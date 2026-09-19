"use client"

import { Dialog, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { Fragment, useCallback, useState } from "react"

import { compressImageDataUrl, fileToDataUrl } from "@lib/util/client-image"
import X from "@modules/common/icons/x"
import { ScanFace } from "lucide-react"

type PollState =
  | { phase: "idle" }
  | { phase: "starting" }
  | { phase: "polling"; label: string }
  | { phase: "done" }
  | { phase: "error"; message: string }

type Props = {
  enabled: boolean
  product: HttpTypes.StoreProduct
  countryCode: string
}

function primaryProductImageUrl(product: HttpTypes.StoreProduct): string | null {
  const fromImages = product.images?.find((i) => i?.url?.trim())?.url?.trim()
  if (fromImages) {
    return fromImages
  }
  const t = product.thumbnail?.trim()
  return t || null
}

export function PhysicalProductTryOn({
  enabled,
  product,
  countryCode,
}: Props) {
  const [open, setOpen] = useState(false)
  const [poll, setPoll] = useState<PollState>({ phase: "idle" })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null)

  const handle = product.handle?.trim()
  const imageUrl = primaryProductImageUrl(product)

  const runTryOn = useCallback(
    async (file: File) => {
      if (!handle) {
        return
      }
      const rawPreview = await fileToDataUrl(file)
      setUserPhotoPreview(rawPreview)
      setPoll({ phase: "starting" })
      setPreviewUrl(null)

      try {
        const modelImage = await compressImageDataUrl(rawPreview)

        const start = await fetch("/api/try-on/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productHandle: handle,
            countryCode,
            modelImage,
          }),
        })
        const startJson = (await start.json()) as {
          predictionId?: string
          tryonSlug?: string
          error?: string
        }
        if (!start.ok) {
          throw new Error(startJson.error || "Try-on could not start")
        }
        const id = startJson.predictionId
        const tryonSlug = startJson.tryonSlug
        if (!id || !tryonSlug) {
          throw new Error("Invalid try-on response")
        }

        const deadline = Date.now() + 180_000
        let delay = 2500

        while (Date.now() < deadline) {
          setPoll({
            phase: "polling",
            label: "Generating your preview…",
          })
          const st = await fetch(
            `/api/try-on/status?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(tryonSlug)}`
          )
          const j = (await st.json()) as {
            status?: string
            error?: string
            previewUrl?: string
            persisted?: boolean
          }

          if (j.status === "failed") {
            throw new Error(j.error || "Try-on failed")
          }

          if (j.status === "completed") {
            setPreviewUrl(j.previewUrl || null)
            setUserPhotoPreview(null)
            if (j.error && !j.previewUrl) {
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
    [countryCode, handle]
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

  const closeModal = useCallback(() => {
    setOpen(false)
    setPoll({ phase: "idle" })
    setPreviewUrl(null)
    setUserPhotoPreview(null)
  }, [])

  const resetTryOn = useCallback(() => {
    setPoll({ phase: "idle" })
    setPreviewUrl(null)
    setUserPhotoPreview(null)
  }, [])

  if (!enabled || !imageUrl || !handle) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setPoll({ phase: "idle" })
          setPreviewUrl(null)
          setUserPhotoPreview(null)
        }}
        className="flex shrink-0 items-center gap-2 rounded border border-neutral-200 bg-white px-3 py-2 text-deepBlack transition-colors hover:border-deepBlack hover:bg-neutral-50"
        aria-label="Try on"
        title="Try it on"
        data-testid="physical-try-on-open"
      >
        <span className="text-xs font-medium uppercase tracking-[0.15em]">
          Try on
        </span>
        <ScanFace className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
      </button>

      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-[80]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform border border-neutral-200 bg-white p-6 text-left shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-xs font-bold uppercase tracking-widest text-deepBlack">
                        Try-on
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                        We&apos;ll composite this garment onto your photo so you
                        can judge silhouette and scale before you buy—the same
                        idea as on our digital expression pages where try-on is
                        available.
                      </p>
                      <div className="mt-4 rounded border border-neutral-100 bg-neutral-50 px-3 py-3">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                          Tips for a clearer preview
                        </p>
                        <ul className="text-xs text-neutral-600 leading-relaxed space-y-1.5 list-disc list-inside marker:text-neutral-400">
                          <li>
                            Stand or sit facing the camera; include your head and
                            shoulders.
                          </li>
                          <li>
                            Use soft, even lighting—facing a window or a
                            well-lit wall. Avoid standing with a bright window
                            behind you.
                          </li>
                          <li>
                            Keep the image sharp and steady; plain clothing
                            behind the product area helps the composite read
                            better.
                          </li>
                          <li>JPG or PNG; avoid heavy filters if you can.</li>
                        </ul>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="shrink-0 text-neutral-400 hover:text-deepBlack"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {poll.phase === "error" ? (
                      <p className="text-sm text-red-600">{poll.message}</p>
                    ) : null}

                    {poll.phase === "starting" || poll.phase === "polling" ? (
                      <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-deepBlack" />
                        <p className="text-sm text-neutral-600">
                          {poll.phase === "starting"
                            ? "Starting…"
                            : poll.label}
                        </p>
                        {userPhotoPreview ? (
                          <div className="relative mx-auto mt-2 max-h-48 w-full max-w-xs overflow-hidden bg-neutral-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={userPhotoPreview}
                              alt="Your photo"
                              className="mx-auto max-h-48 w-auto object-contain"
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {poll.phase === "done" && previewUrl ? (
                      <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-widest text-deepBlack">
                          Preview
                        </p>
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt="Try-on preview"
                            draggable={false}
                            onContextMenu={(event) => event.preventDefault()}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={resetTryOn}
                          className="text-xs font-medium uppercase tracking-widest text-deepBlack border-b border-deepBlack pb-0.5 hover:opacity-60"
                        >
                          Try another photo
                        </button>
                      </div>
                    ) : null}

                    {poll.phase === "done" && !previewUrl ? (
                      <p className="text-sm text-neutral-600">
                        Preview completed. Configure MinIO and preview signing to
                        see the image here, or try again later.
                      </p>
                    ) : null}

                    {poll.phase === "idle" ||
                    poll.phase === "error" ||
                    (poll.phase === "done" && !previewUrl) ? (
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-neutral-300 bg-white px-4 py-8 text-center text-sm text-neutral-500 transition-colors hover:border-neutral-400">
                        <span className="text-xs font-medium uppercase tracking-widest text-deepBlack">
                          {poll.phase === "done" && !previewUrl
                            ? "Upload again"
                            : "Upload photo"}
                        </span>
                        <span className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                          Front-facing · shoulders in frame · even light · JPG or
                          PNG
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={onFileChange}
                        />
                      </label>
                    ) : null}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
