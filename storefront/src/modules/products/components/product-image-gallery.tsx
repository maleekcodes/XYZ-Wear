"use client"

import { imagesForAppearance } from "@lib/util/product-options"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useProductColor } from "@modules/products/components/product-color-context"

const INITIAL_VISIBLE = 2
const FADE_MS = 400

type GalleryImage = { id: string; url: string }

type ProductImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  thumbnail?: string | null
  productTitle: string
  product?: HttpTypes.StoreProduct
}

function normalizeImages(
  images: HttpTypes.StoreProductImage[],
  thumbnail?: string | null
): GalleryImage[] {
  const fromImages = images
    .filter((img) => !!img.url)
    .map((img) => ({ id: img.id ?? img.url!, url: img.url! }))
  if (fromImages.length > 0) return fromImages
  if (thumbnail) return [{ id: "thumb", url: thumbnail }]
  return []
}

function viewLabel(url: string, index: number): string {
  const parts = url.toLowerCase().split(/[^a-z0-9]+/)
  if (parts.includes("front")) return "Front"
  if (parts.includes("side")) return "Side"
  if (parts.includes("back")) return "Back"
  if (parts.includes("detail") || parts.includes("close")) return "Detail"
  return index === 0 ? "Front" : index === 1 ? "Back" : `View ${index + 1}`
}

function revealAfterPaint(show: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(show)
  })
}

function CrossfadeImage({
  src,
  alt,
  priority,
  sizes,
}: {
  src: string
  alt: string
  priority?: boolean
  sizes: string
}) {
  const [base, setBase] = useState(src)
  const [overlay, setOverlay] = useState<string | null>(null)
  const [overlayShown, setOverlayShown] = useState(false)

  useEffect(() => {
    if (src === base) {
      setOverlay(null)
      setOverlayShown(false)
      return
    }
    if (src === overlay) return
    setOverlay(src)
    setOverlayShown(false)
  }, [src, base, overlay])

  const commitOverlay = useCallback(() => {
    if (!overlay) return
    setBase(overlay)
    setOverlay(null)
    setOverlayShown(false)
  }, [overlay])

  const onOverlayReady = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !overlay) return
      if (img.complete && img.naturalWidth > 0) {
        revealAfterPaint(() => setOverlayShown(true))
      }
    },
    [overlay]
  )

  return (
    <div className="absolute inset-0">
      <Image
        src={base}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={90}
        className="object-contain object-center"
      />
      {overlay && (
        <Image
          key={overlay}
          src={overlay}
          alt={alt}
          fill
          sizes={sizes}
          quality={90}
          className={`object-contain object-center transition-opacity ease-[cubic-bezier(0.2,0,0,1)] ${
            overlayShown ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          onLoad={(event) => onOverlayReady(event.currentTarget)}
          onTransitionEnd={(event) => {
            if (event.propertyName !== "opacity" || !overlayShown) return
            commitOverlay()
          }}
        />
      )}
    </div>
  )
}

export default function ProductImageGallery({
  images,
  thumbnail,
  productTitle,
  product,
}: ProductImageGalleryProps) {
  const [expanded, setExpanded] = useState(false)
  const colorCtx = useProductColor()
  const selectedColor = colorCtx?.color ?? colorCtx?.colors[0]
  const colors = colorCtx?.colors ?? []

  const colorImages = useMemo(
    () => imagesForAppearance(product, images, selectedColor, colors),
    [product, images, selectedColor, colors]
  )
  const all = useMemo(
    () => normalizeImages(colorImages, thumbnail),
    [colorImages, thumbnail]
  )
  const prefetchUrls = useMemo(() => {
    const urls = images.map((img) => img.url).filter((url): url is string => !!url)
    if (thumbnail) urls.push(thumbnail)
    return [...new Set(urls)]
  }, [images, thumbnail])

  useEffect(() => {
    setExpanded(false)
  }, [selectedColor])

  if (all.length === 0) {
    return (
      <div className="aspect-square w-full border border-black/10 bg-white" />
    )
  }

  const visible = expanded ? all : all.slice(0, INITIAL_VISIBLE)
  const hasMore = all.length > INITIAL_VISIBLE
  const gridCols = visible.length === 1 ? "grid-cols-1" : "grid-cols-2"

  return (
    <div className="flex flex-col gap-6">
      <div hidden aria-hidden>
        {prefetchUrls.map((url) => (
          <Image key={url} src={url} alt="" width={16} height={16} />
        ))}
      </div>

      <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
        {visible.map((img, index) => (
          <figure key={index} className="group flex flex-col gap-2">
            <div className="relative aspect-square w-full border border-black/10 bg-white">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                  <CrossfadeImage
                    src={img.url}
                    alt={`${productTitle}${selectedColor ? ` — ${selectedColor}` : ""} — ${viewLabel(img.url, index)}`}
                    priority={index < 2}
                    sizes="(max-width: 1024px) 50vw, 40vw"
                  />
                </div>
              </div>
            </div>
            <figcaption className="px-0.5 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 transition-opacity duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
              {viewLabel(img.url, index)}
              {selectedColor ? ` · ${selectedColor}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mx-auto flex min-h-10 items-center gap-2 border border-deepBlack bg-white px-8 py-3 text-[10px] font-mono uppercase tracking-[0.2em] text-deepBlack transition-[color,background-color,transform] duration-200 hover:bg-deepBlack hover:text-white active:scale-[0.96]"
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  )
}
