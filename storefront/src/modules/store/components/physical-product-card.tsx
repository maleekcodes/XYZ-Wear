"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Plus } from "lucide-react"
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
  }[]
  isLatest?: boolean
  compact?: boolean
  fitLabel?: string | null
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
  fitLabel,
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
    if (normalized.includes("grey") || normalized.includes("gray")) return "#9ca3af"
    if (normalized.includes("navy")) return "#1e3a8a"
    if (normalized.includes("blue")) return "#3b82f6"
    if (normalized.includes("red")) return "#dc2626"
    if (normalized.includes("green")) return "#16a34a"
    if (normalized.includes("olive")) return "#4d5d3a"
    if (normalized.includes("brown")) return "#7c4a2d"
    if (normalized.includes("beige") || normalized.includes("cream")) return "#e7dcc2"
    return "#d4d4d4"
  }

  return (
    <LocalizedClientLink
      href={`/products/${handle}`}
      className={`block h-full ${compact ? "min-h-[360px] max-w-[20rem]" : "min-h-[520px]"}`}
      data-testid="product-wrapper"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4 }}
        className={`group bg-concrete flex flex-col justify-between h-full border border-transparent hover:border-neutral-200 transition-colors ${
          compact
            ? "min-h-[360px] p-3"
            : "min-h-[520px] p-4 md:p-5"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap items-center gap-1.5">
            {isLatest && (
              <span className="text-[10px] uppercase tracking-widest font-mono rounded-full px-2 py-0.5 bg-deepBlack text-white">
                Latest
              </span>
            )}
            <span className="text-[10px] uppercase tracking-widest font-mono border border-neutral-300 rounded-full px-2 py-0.5 bg-white/50">
              {lineLabel}
            </span>
          </div>
          <span
            className="text-neutral-400 group-hover:text-deepBlack transition-colors pointer-events-none"
            aria-hidden
          >
            <Plus size={18} />
          </span>
        </div>

        <div className={`flex-grow flex items-start justify-center ${compact ? "py-3" : "py-4"}`}>
          <div
            className={`relative w-full aspect-[3/4] bg-white shadow-sm border border-neutral-100 overflow-hidden ${
              compact ? "max-w-[14rem]" : "max-w-[28rem]"
            }`}
          >
            {previewImage ? (
              <Image
                src={previewImage}
                alt={title}
                fill
                className="object-cover object-center"
                sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 95vw"
                quality={75}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                <PlaceholderImage size={24} />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end gap-3 mb-4">
            <div className="min-w-0">
              <h3
                className={`font-bold tracking-tight truncate ${compact ? "text-sm" : "text-lg"}`}
                data-testid="product-title"
              >
                {title}
              </h3>
              <span className="text-xs text-neutral-500 block mt-1 line-clamp-2">
                {subtitle}
              </span>
            </div>
            {swatchItems.length > 0 && (
              <div className="flex gap-1.5 shrink-0">
                {swatchItems.map((swatch, i) => {
                  const selected = i === activeSwatch
                  return (
                    <button
                      key={`${swatch.label}-${i}`}
                      type="button"
                      title={swatch.label}
                      aria-label={`Preview ${swatch.label}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setActiveSwatch(i)
                      }}
                      className={`h-4 w-4 rounded-full border transition-all ${
                        selected
                          ? "border-deepBlack ring-1 ring-deepBlack/30"
                          : "border-neutral-300"
                      }`}
                      style={{
                        backgroundColor: fallbackSwatchColor(swatch.label),
                        backgroundImage: swatch.imageUrl
                          ? `url("${swatch.imageUrl}")`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-200/60 flex justify-between items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400">
            <span>{fitLabel}</span>
            <span className="text-right tabular-nums normal-case tracking-normal">
              {priceIsSale && originalPriceFormatted && (
                <span
                  className="line-through text-neutral-400 mr-2"
                  data-testid="original-price"
                >
                  {originalPriceFormatted}
                </span>
              )}
              {priceFormatted ? (
                <span
                  className={
                    priceIsSale ? "text-deepBlack font-medium" : "text-neutral-500"
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
    </LocalizedClientLink>
  )
}
