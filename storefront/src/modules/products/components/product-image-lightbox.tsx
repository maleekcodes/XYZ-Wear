"use client"

import { Dialog, Transition } from "@headlessui/react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import {
  Fragment,
  type MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react"

type GalleryImage = { id: string; url: string }

type ProductImageLightboxProps = {
  open: boolean
  onClose: () => void
  images: GalleryImage[]
  index: number
  onIndexChange: (index: number) => void
  productTitle: string
  captions: string[]
}

const ZOOM = 2.35

function canHoverZoom() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches
}

function MagnifierStage({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [zoomed, setZoomed] = useState(false)

  const onMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!canHoverZoom()) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setOrigin({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    })
    setZoomed(true)
  }, [])

  const onLeave = useCallback(() => {
    setZoomed(false)
  }, [])

  return (
    <div
      className="relative aspect-square h-[min(calc(100dvh-9rem),calc(100vw-6rem))] w-[min(calc(100dvh-9rem),calc(100vw-6rem))] overflow-hidden border border-black/10 bg-white"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: zoomed ? `scale(${ZOOM})` : "scale(1)",
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transition: zoomed
            ? "none"
            : "transform 280ms cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          quality={95}
          sizes="90vw"
          className="object-contain object-center"
        />
      </div>
    </div>
  )
}

export default function ProductImageLightbox({
  open,
  onClose,
  images,
  index,
  onIndexChange,
  productTitle,
  captions,
}: ProductImageLightboxProps) {
  const current = images[index]
  const hasNav = images.length > 1

  const step = useCallback(
    (direction: -1 | 1) => {
      if (images.length < 2) return
      onIndexChange((index + direction + images.length) % images.length)
    },
    [images.length, index, onIndexChange]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(-1)
      if (event.key === "ArrowRight") step(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, step])

  if (!current) return null

  const caption = captions[index] ?? ""
  const alt = `${productTitle}${caption ? ` — ${caption}` : ""}`

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[110]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className="flex h-full min-h-full w-full flex-col outline-none"
              data-testid="product-image-lightbox"
            >
              <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                <Dialog.Title className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                  {caption || productTitle}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center text-deepBlack transition-opacity duration-200 hover:opacity-50"
                  aria-label="Close image"
                  data-testid="close-image-lightbox"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 pb-10 sm:px-16">
                <div className="flex flex-col items-center gap-3">
                  <MagnifierStage src={current.url} alt={alt} />
                  <p className="hidden text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 md:block">
                    Hover to zoom
                  </p>
                </div>

                {hasNav && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-deepBlack transition-opacity duration-200 hover:opacity-50 sm:left-5"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={22} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-deepBlack transition-opacity duration-200 hover:opacity-50 sm:right-5"
                      aria-label="Next image"
                    >
                      <ChevronRight size={22} strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
