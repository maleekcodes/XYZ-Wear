"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useCallback, useState } from "react"

import { compressImageDataUrl, fileToDataUrl } from "@lib/util/client-image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DigitalProductGallery } from "./digital-product-gallery"
import type { DigitalProductDetailSanity } from "@/types/xyz"

type PollState =
  | { phase: "idle" }
  | { phase: "starting" }
  | { phase: "polling"; label: string }
  | { phase: "done" }
  | { phase: "error"; message: string }

type Props = {
  product: DigitalProductDetailSanity
  images: string[]
  priceLabel: string | null
  countryCode: string
  collectionLabel?: string | null
  pageTitle?: string | null
  fetchError?: boolean
}

export function DigitalProductPdpClient({
  product,
  images,
  priceLabel,
  countryCode,
  collectionLabel,
  pageTitle,
  fetchError,
}: Props) {
  const slug = product.slug
  const productImageUrl = images[0]
  const canTryOn = !!productImageUrl && !product.isComingSoon

  const [poll, setPoll] = useState<PollState>({ phase: "idle" })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null)
  const [predictionId, setPredictionId] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const runTryOn = useCallback(
    async (file: File) => {
      setCheckoutError(null)
      const rawPreview = await fileToDataUrl(file)
      setUserPhotoPreview(rawPreview)
      setPoll({ phase: "starting" })
      setPreviewUrl(null)
      setPredictionId(null)

      try {
        const modelImage = await compressImageDataUrl(rawPreview)

        const start = await fetch("/api/try-on/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, modelImage }),
        })
        const startJson = (await start.json()) as {
          predictionId?: string
          error?: string
        }
        if (!start.ok) {
          throw new Error(startJson.error || "Try-on could not start")
        }
        const id = startJson.predictionId
        if (!id) {
          throw new Error("No prediction id")
        }
        setPredictionId(id)

        const deadline = Date.now() + 180_000
        let delay = 2500

        while (Date.now() < deadline) {
          setPoll({
            phase: "polling",
            label: "Generating your preview…",
          })
          const st = await fetch(
            `/api/try-on/status?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`
          )
          const j = (await st.json()) as {
            status?: string
            error?: string
            persisted?: boolean
            previewUrl?: string
            predictionId?: string
          }

          if (j.status === "failed") {
            throw new Error(j.error || "Try-on failed")
          }

          if (j.status === "completed") {
            setPreviewUrl(j.previewUrl || null)
            setUserPhotoPreview(null)
            if (j.error && !j.persisted) {
              setPoll({ phase: "error", message: j.error })
            } else {
              setPoll({ phase: "done" })
            }
            return
          }

          await new Promise((r) => setTimeout(r, delay))
          delay = Math.min(delay + 750, 8000)
        }

        throw new Error("Timed out waiting for try-on. Please try again.")
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unexpected error"
        setPoll({ phase: "error", message })
      }
    },
    [slug]
  )

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) {
        void runTryOn(f)
      }
      e.target.value = ""
    },
    [runTryOn]
  )

  const buy = useCallback(async () => {
    setCheckoutError(null)
    if (!predictionId) {
      setCheckoutError(
        "Run try-on first so we can attach your result to checkout."
      )
      return
    }
    const r = await fetch("/api/stripe/digital-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, predictionId, countryCode }),
    })
    const j = (await r.json()) as { url?: string; error?: string }
    if (!r.ok || !j.url) {
      setCheckoutError(j.error || "Checkout could not start")
      return
    }
    window.location.href = j.url
  }, [slug, predictionId, countryCode])

  const busy = poll.phase === "starting" || poll.phase === "polling"
  const blocked = product.isComingSoon || !canTryOn
  const canBuy =
    !product.isComingSoon &&
    !!predictionId &&
    !!previewUrl &&
    !busy &&
    poll.phase !== "error"
  const showProcessing =
    poll.phase === "starting" || poll.phase === "polling"

  return (
    <>
      {fetchError ? (
        <p className="mb-8 text-sm font-mono text-amber-400 border border-amber-900/40 bg-amber-950/20 px-4 py-3">
          Sanity returned an error while loading this product. Content may be
          incomplete.
        </p>
      ) : null}

      <nav className="mb-10 text-xs font-mono text-neutral-500">
        <LocalizedClientLink href="/digital" className="hover:text-white">
          {pageTitle?.trim() || "Digital Form"}
        </LocalizedClientLink>
        <span className="mx-2">/</span>
        <span className="text-neutral-300">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
        <div className="flex flex-col gap-10 lg:col-span-7 xl:col-span-8">
          {collectionLabel ? (
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
              {collectionLabel}
            </span>
          ) : null}

          {/* Side-by-side: product imagery + try-on (matches physical PDP gallery column width) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6 xl:gap-8 lg:items-start">
            <div className="min-w-0 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Product
              </p>
              <DigitalProductGallery
                images={images}
                productName={product.name || "Digital product"}
              />
            </div>

            <div className="min-w-0 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Your look
              </p>
              <div className="relative aspect-[3/4] w-full max-h-[min(80vh,720px)] overflow-hidden rounded-sm border border-neutral-800 bg-neutral-950">
                <div className="absolute inset-0">
                  <AnimatePresence mode="wait">
                  {blocked ? (
                    <motion.div
                      key="blocked"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
                    >
                      <p className="text-sm text-amber-400/90">
                        {product.isComingSoon
                          ? "Try-on coming soon for this piece."
                          : "Add product images in CMS to enable try-on."}
                      </p>
                    </motion.div>
                  ) : previewUrl ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="absolute inset-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Your preview"
                        draggable={false}
                        onContextMenu={(event) => event.preventDefault()}
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                      <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={busy}
                            onChange={onFileChange}
                          />
                          <span className="rounded border border-white/20 bg-black/60 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-white/90 backdrop-blur-sm hover:bg-black/80">
                            New photo
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  ) : showProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0"
                    >
                      {userPhotoPreview ? (
                        <div className="absolute inset-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={userPhotoPreview}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
                          />
                          <motion.div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              ease: "easeInOut",
                            }}
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
                            <motion.div
                              className="h-14 w-14 rounded-full border-2 border-blue-400/30 border-t-blue-400"
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear",
                              }}
                            />
                            <p className="max-w-[14rem] text-center text-xs font-mono text-neutral-300">
                              {poll.phase === "starting"
                                ? "Uploading…"
                                : poll.phase === "polling"
                                  ? poll.label
                                  : "Working…"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                          <motion.div
                            className="h-12 w-12 rounded-full border-2 border-blue-400/30 border-t-blue-400"
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              ease: "linear",
                            }}
                          />
                          <p className="text-xs font-mono text-neutral-400">
                            Starting…
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-5 sm:p-6 text-center overflow-y-auto"
                    >
                      <div className="max-w-sm space-y-4 text-left">
                        <p className="text-sm text-neutral-400 leading-relaxed">
                          Upload a photo and we&apos;ll composite this piece onto
                          you for a reference preview—the same flow as our
                          physical garments.{" "}
                          <LocalizedClientLink
                            href="/virtual-try-on"
                            className="text-blue-400 underline-offset-2 hover:underline"
                          >
                            How try-on works
                          </LocalizedClientLink>
                        </p>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                            Get the best result
                          </p>
                          <ul className="text-xs text-neutral-500 leading-relaxed space-y-1.5 list-disc list-inside marker:text-neutral-600">
                            <li>
                              Face the camera straight on; keep your head and
                              shoulders in frame.
                            </li>
                            <li>
                              Use bright, even light—natural daylight or a
                              softly lit room. Avoid strong backlight or deep
                              shadow on your face.
                            </li>
                            <li>
                              Hold the camera steady and keep the shot sharp;
                              plain backgrounds usually read more clearly.
                            </li>
                            <li>JPG or PNG works best.</li>
                          </ul>
                        </div>
                      </div>
                      <label className="cursor-pointer shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={busy}
                          onChange={onFileChange}
                        />
                        <span className="inline-flex items-center justify-center border border-blue-600/50 bg-blue-950/30 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-blue-200 hover:bg-blue-900/40">
                          Choose photo
                        </span>
                      </label>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>

              {poll.phase === "error" ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-400">{poll.message}</p>
                  {!blocked ? (
                    <label className="inline-block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileChange}
                      />
                      <span className="text-xs font-mono text-blue-400 hover:text-blue-300">
                        Try another photo
                      </span>
                    </label>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {product.description ? (
            <p className="max-w-xl whitespace-pre-line text-sm leading-relaxed text-neutral-400">
              {product.description}
            </p>
          ) : null}
        </div>

        <aside className="flex flex-col gap-8 lg:col-span-5 lg:sticky lg:top-28 lg:max-w-md lg:self-start xl:col-span-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            {product.category ? (
              <p className="mt-2 text-xs uppercase tracking-widest text-neutral-500">
                {product.category}
                {product.line ? ` · ${product.line}` : ""}
              </p>
            ) : null}
            {priceLabel ? (
              <p className="mt-6 text-2xl font-mono text-white">{priceLabel}</p>
            ) : (
              <p className="mt-6 text-sm text-neutral-500">Price on request</p>
            )}
          </div>

          <div className="space-y-3 border border-neutral-800 bg-neutral-950/40 p-5">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400">
              Try on
            </h2>
            <p className="text-sm text-neutral-400">
              Your photo is used only for this session to build the preview.
              Purchase unlocks the full-resolution file.
            </p>
          </div>

          <div className="border border-neutral-800 bg-neutral-950/60 p-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Buy
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              This is a watermarked preview. Secure checkout unlocks the
              un-watermarked, full-resolution image for download.
            </p>
            <button
              type="button"
              disabled={!canBuy}
              onClick={() => void buy()}
              className={`mt-4 w-full border py-3 text-sm font-mono uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                canBuy
                  ? "border-blue-400 bg-blue-500 text-white hover:bg-blue-400"
                  : "border-white/20 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              Buy & download
            </button>
            {checkoutError ? (
              <p className="mt-2 text-sm text-red-400">{checkoutError}</p>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  )
}
