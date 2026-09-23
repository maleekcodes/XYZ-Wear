"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useMemo, useState } from "react"

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
  catalogMobile?: boolean
  fitLabel?: string | null
  className?: string
  launchStatus?: string
  inventoryQuantity?: number | null
  restockedAt?: string | null
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
  isLatest,
  compact,
  catalogMobile,
  fitLabel,
  className,
  launchStatus = "",
  inventoryQuantity,
  restockedAt,
}: PhysicalProductCardProps) {
  const swatchItems = swatches?.slice(0, 5) ?? []
  const [activeSwatch, setActiveSwatch] = useState(0)

  const previewImage = useMemo(() => {
    const active = swatchItems[activeSwatch]?.imageUrl
    if (active) return active
    return imageUrl
  }, [activeSwatch, imageUrl, swatchItems])

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className={`group relative flex h-full w-full flex-col border border-neutral-200 bg-white transition-colors hover:border-neutral-300 ${
        catalogMobile
          ? "min-h-0 p-5 sm:min-h-[520px] sm:p-4 md:p-5"
          : compact
            ? "min-h-[360px] p-3"
            : "min-h-[520px] p-4 md:p-5"
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
        {launchStatus === "coming_soon" || launchStatus === "pre_order" || launchStatus === "available" || restockedAt || inventoryQuantity === 0 ? (
          <span className="shrink-0 rounded-full border border-red-600 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-black">
            {launchStatus === "coming_soon" ? "Coming Soon" : launchStatus === "pre_order" ? "Pre-Order" : restockedAt ? "Restock" : inventoryQuantity === 0 ? "Sold Out" : "Available"}
          </span>
        ) : null}
      </div>

      <LocalizedClientLink
        href={`/products/${handle}`}
        className={`relative z-0 block ${compact ? "py-2" : "py-3"}`}
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
        <div className={`mb-4 flex items-end justify-between gap-3 ${catalogMobile ? "flex-wrap sm:flex-nowrap" : ""}`}>
          <LocalizedClientLink href={`/products/${handle}`} className="min-w-0">
            <h3
              className={`truncate font-bold tracking-tight ${compact ? "text-xs" : "text-sm"} ${catalogMobile ? "text-base sm:text-xs" : ""}`}
              data-testid="product-title"
            >
              {title}
            </h3>
            <span className={`mt-1 block line-clamp-2 text-xs text-neutral-500 ${catalogMobile ? "text-base sm:text-xs" : ""}`}>
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
                    className={`h-4 w-4 rounded-full border transition-all ${catalogMobile ? "h-6 w-6 sm:h-4 sm:w-4" : ""} ${
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

        <div className={`flex items-center justify-between gap-2 border-t border-neutral-200/60 pt-4 text-[10px] uppercase tracking-widest text-neutral-400 ${catalogMobile ? "text-xs sm:text-[10px]" : ""}`}>
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
