"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { useMemo, useState, type MouseEvent } from "react"

import { addToCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

export type PhysicalProductCardProps = {
  handle: string
  title: string
  subtitle: string
  lineLabel: string
  imageUrl: string | null
  priceFormatted: string | null
  originalPriceFormatted?: string | null
  priceIsSale?: boolean
  swatches?: {
    label: string
    imageUrl?: string | null
    hex?: string | null
    variantId?: string | null
  }[]
  defaultVariantId?: string | null
  isLatest?: boolean
  compact?: boolean
  fitLabel?: string | null
  className?: string
}

export function PhysicalProductCard({
  handle,
  title,
  subtitle,
  lineLabel,
  imageUrl,
  priceFormatted,
  originalPriceFormatted,
  priceIsSale,
  swatches,
  defaultVariantId,
  isLatest,
  compact,
  fitLabel,
  className,
}: PhysicalProductCardProps) {
  const router = useRouter()
  const { countryCode } = useParams()
  const swatchItems = swatches?.slice(0, 5) ?? []
  const [activeSwatch, setActiveSwatch] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  const previewImage = useMemo(() => {
    const active = swatchItems[activeSwatch]?.imageUrl
    if (active) return active
    return imageUrl
  }, [activeSwatch, imageUrl, swatchItems])

  const activeVariantId =
    swatchItems[activeSwatch]?.variantId ?? defaultVariantId ?? null

  const fallbackSwatchColor = (label: string): string => {
    const normalized = label.toLowerCase()
    if (normalized.includes("black")) return "#171717"
    if (normalized.includes("white")) return "#f5f5f5"
    if (normalized.includes("ivory") || normalized.includes("cream")) return "#e7dcc2"
    if (normalized.includes("beige") || normalized.includes("sand")) return "#d6c4a8"
    if (normalized.includes("grey") || normalized.includes("gray") || normalized.includes("charcoal"))
      return "#6b7280"
    if (normalized.includes("navy")) return "#1e3a8a"
    if (normalized.includes("blue")) return "#3b82f6"
    if (normalized.includes("red") || normalized.includes("burgundy")) return "#9b1c2c"
    if (normalized.includes("olive")) return "#4d5d3a"
    if (normalized.includes("green")) return "#1f3d2b"
    if (normalized.includes("purple") || normalized.includes("violet") || normalized.includes("plum"))
      return "#4a2c5a"
    if (normalized.includes("pink") || normalized.includes("mauve")) return "#b76e79"
    if (normalized.includes("brown") || normalized.includes("chocolate")) return "#7c4a2d"
    if (normalized.includes("orange")) return "#c2410c"
    if (normalized.includes("yellow") || normalized.includes("gold")) return "#ca8a04"
    return "#d4d4d4"
  }

  const handleAddToCart = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!activeVariantId || isAdding) return

    const country = Array.isArray(countryCode) ? countryCode[0] : countryCode
    if (!country) return

    setIsAdding(true)
    try {
      await addToCart({
        variantId: activeVariantId,
        quantity: 1,
        countryCode: country,
      })
      router.refresh()
    } catch (error) {
      console.error("Add to cart failed", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className={`group relative flex h-full w-full flex-col justify-between border border-neutral-200 bg-white transition-colors hover:border-neutral-300 ${
        compact ? "min-h-[360px] p-3" : "min-h-[520px] p-4 md:p-5"
      } ${className ?? ""}`}
      data-testid="product-wrapper"
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {isLatest && (
            <span className="rounded-full bg-deepBlack px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
              Latest
            </span>
          )}
          {lineLabel ? (
            <span className="rounded-full border border-neutral-300 bg-white/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">
              {lineLabel}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={`Add ${title} to cart`}
          data-testid="product-card-add"
          data-variant-id={activeVariantId ?? ""}
          disabled={!activeVariantId || isAdding}
          onClick={handleAddToCart}
          className="text-neutral-400 transition-colors hover:text-deepBlack disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAdding ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Plus size={18} />
          )}
        </button>
      </div>

      <LocalizedClientLink
        href={`/products/${handle}`}
        className={`relative z-0 block flex-grow ${compact ? "py-2" : "py-3"}`}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
          {previewImage ? (
            <Image
              src={previewImage}
              alt={title}
              fill
              className="object-contain object-center"
              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 95vw"
              quality={75}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
              <PlaceholderImage size={24} />
            </div>
          )}
        </div>
      </LocalizedClientLink>

      <div className="relative z-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <LocalizedClientLink href={`/products/${handle}`} className="min-w-0">
            <h3
              className={`truncate font-bold tracking-tight ${compact ? "text-xs" : "text-sm"}`}
              data-testid="product-title"
            >
              {title}
            </h3>
            <span className="mt-1 block line-clamp-2 text-xs text-neutral-500">
              {subtitle}
            </span>
          </LocalizedClientLink>
          {swatchItems.length > 0 && (
            <div className="flex shrink-0 gap-1.5">
              {swatchItems.map((swatch, i) => {
                const selected = i === activeSwatch
                return (
                  <button
                    key={`${swatch.label}-${i}`}
                    type="button"
                    title={swatch.label}
                    aria-label={`Preview ${swatch.label}`}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setActiveSwatch(i)
                    }}
                    className={`h-4 w-4 rounded-full border transition-all ${
                      selected
                        ? "border-deepBlack ring-1 ring-deepBlack/30"
                        : "border-black/15"
                    }`}
                    style={{
                      backgroundColor:
                        swatch.hex || fallbackSwatchColor(swatch.label),
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-neutral-200/60 pt-4 text-[10px] uppercase tracking-widest text-neutral-400">
          <span>{fitLabel}</span>
          <span className="text-right tabular-nums normal-case tracking-normal">
            {priceIsSale && originalPriceFormatted && (
              <span
                className="mr-2 text-neutral-400 line-through"
                data-testid="original-price"
              >
                {originalPriceFormatted}
              </span>
            )}
            {priceFormatted ? (
              <span
                className={
                  priceIsSale ? "font-medium text-deepBlack" : "text-neutral-500"
                }
                data-testid="price"
              >
                {priceFormatted}
              </span>
            ) : (
              <span>Pre-Order</span>
            )}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
