"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ExternalLink, ShoppingBag } from "lucide-react"

import { normalizeDigitalPdpSlug } from "@lib/digital/normalize-digital-slug"
import { formatDigitalPrice } from "@lib/util/format-digital-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container } from "@modules/common/components/xyz/Container"
import { Shape } from "@modules/common/components/xyz/Shape"
import { asShapeType } from "@modules/journal/lib/shape-type"
import type { DigitalExternalLinks, DigitalFormProductDisplay } from "@/types/xyz"

import { CyberxVisual, isCyberxVisual } from "./cyberx-visual"

type Hero = {
  collectionLabel: string
  title: string
  description: string
}

function primaryExternalUrl(
  links: DigitalExternalLinks | null | undefined
): string | undefined {
  if (!links) {
    return undefined
  }
  const u =
    links.opensea ||
    links.rarible ||
    links.foundation ||
    links.custom ||
    undefined
  return typeof u === "string" && u.length > 0 ? u : undefined
}

/**
 * URL segment for `/digital/[slug]`: explicit CMS slug, else stable Sanity `_key`
 * so older documents without `slug` still open the try-on PDP.
 */
function digitalListingSlug(product: DigitalFormProductDisplay): string | null {
  const raw = product.slug?.trim() || product.sanityKey?.trim() || null
  if (!raw) {
    return null
  }
  return normalizeDigitalPdpSlug(raw) || product.sanityKey?.trim() || null
}

function DigitalProductCard({ product }: { product: DigitalFormProductDisplay }) {
  const ext = primaryExternalUrl(product.externalLinks)
  const hasExternal = !!ext && /^https?:\/\//i.test(ext)
  const digitalSlug = digitalListingSlug(product)
  const hasDigitalPdp = !!digitalSlug
  const hasMedusa = !!product.medusaHandle?.trim()
  const isClickable = hasExternal || hasDigitalPdp || hasMedusa

  const displayPrice =
    product.medusaFromPrice ||
    formatDigitalPrice(product.price ?? null, product.currency ?? null)

  const CardInner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={isClickable ? { y: -5 } : undefined}
      transition={{ duration: 0.4 }}
      className={`flex w-full flex-col justify-between h-full min-h-[520px] bg-neutral-900 border border-neutral-800 p-4 md:p-5 group ${
        isClickable ? "hover:border-blue-500/30 cursor-pointer" : ""
      } transition-colors`}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] text-blue-400 font-mono border border-blue-900/50 bg-blue-900/10 px-2 py-0.5 rounded">
          {product.productType}
        </span>
        {isClickable ? (
          <ArrowUpRight
            className="text-neutral-600 group-hover:text-blue-400 transition-colors"
            size={20}
          />
        ) : null}
      </div>

      <div className="relative my-3 flex aspect-[3/4] w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        {product.previewImage ? (
          isCyberxVisual(digitalSlug, product.previewImage) ? (
            <div className="relative z-10 flex h-full w-full items-center justify-center">
              <CyberxVisual image={product.previewImage} alt={product.name} />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.previewImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-contain object-center z-10 group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          <Shape
            type={asShapeType(product.shape, "hexagon")}
            className="w-40 bg-black border border-neutral-800 relative z-10 group-hover:scale-110 transition-transform duration-500"
          >
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className="border-[0.5px] border-neutral-500"
                />
              ))}
            </div>
          </Shape>
        )}
      </div>

      <div>
        <h3 className="text-lg font-mono tracking-tight text-white mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">
          {product.category}
        </p>
        {product.description ? (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-neutral-400">
            {product.description}
          </p>
        ) : null}

        {product.platforms && product.platforms.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.platforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                className="text-[9px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded"
              >
                {platform}
              </span>
            ))}
            {product.platforms.length > 3 ? (
              <span className="text-[9px] text-neutral-500">
                +{product.platforms.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          {displayPrice ? (
            <span className="text-sm font-mono text-white">{displayPrice}</span>
          ) : (
            <span className="text-xs text-neutral-500 uppercase">View</span>
          )}

          <div className="flex gap-2">
            {hasExternal ? (
              <ExternalLink size={14} className="text-neutral-500" />
            ) : null}
            {hasMedusa ? (
              <ShoppingBag size={14} className="text-neutral-500" />
            ) : null}
          </div>
        </div>

        {product.isComingSoon ? (
          <div className="mt-3 text-center">
            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">
              {product.statusLabel || "Coming Soon"}
            </span>
          </div>
        ) : null}
      </div>
    </motion.div>
  )

  if (hasExternal && ext) {
    return (
      <a
        href={ext}
        target="_blank"
        rel="noopener noreferrer"
        className="h-full block"
      >
        {CardInner}
      </a>
    )
  }

  if (hasDigitalPdp && digitalSlug) {
    return (
      <LocalizedClientLink
        href={`/digital/${encodeURIComponent(digitalSlug)}`}
        className="h-full block"
      >
        {CardInner}
      </LocalizedClientLink>
    )
  }

  if (hasMedusa) {
    return (
      <LocalizedClientLink
        href={`/products/${product.medusaHandle}`}
        className="h-full block"
      >
        {CardInner}
      </LocalizedClientLink>
    )
  }

  return <div className="h-full">{CardInner}</div>
}

export function DigitalFormClient({
  hero,
  products,
  fetchError,
}: {
  hero: Hero
  products: DigitalFormProductDisplay[]
  fetchError?: boolean
}) {
  return (
    <div className="pt-32 pb-24 bg-deepBlack text-white min-h-screen">
      <Container>
        {fetchError ? (
          <p className="text-sm text-amber-400 font-mono mb-8 border border-amber-900/40 bg-amber-950/20 px-4 py-3">
            Could not refresh Digital Form from Sanity. Showing cached or
            fallback content.
          </p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24 border-b border-neutral-800 pb-12"
        >
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
            {hero.collectionLabel}
          </span>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mt-4 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
            {hero.title}
          </h1>
          <p className="max-w-2xl text-xl font-light text-neutral-400">
            {hero.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {products.map((product) => (
            <DigitalProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </div>
  )
}
