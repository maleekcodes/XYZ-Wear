import { HttpTypes } from "@medusajs/types"

import { getProductPrice } from "@lib/util/get-product-price"
import {
  fitLabelForProduct,
  productDisplayTitle,
  productMetadataString,
} from "@lib/util/physical-product-copy"
import {
  appearanceValues,
  isAppearanceOption,
} from "@lib/util/product-options"
import { swatchHexForLabel } from "@lib/util/swatch-color"
import type { PhysicalProductCardProps } from "@modules/store/components/physical-product-card"

function truncateText(text: string | null | undefined, max = 96): string {
  if (!text) return ""
  const t = text.replace(/\s+/g, " ").trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function toImageUrl(
  image: HttpTypes.StoreProductImage | { url?: string } | undefined
): string | null {
  const url = image?.url
  return typeof url === "string" && url.trim().length > 0 ? url.trim() : null
}

function variantIsPurchasable(variant: HttpTypes.StoreProductVariant): boolean {
  if (!variant.id) return false
  if (variant.manage_inventory === false) return true
  if (variant.allow_backorder) return true
  return (variant.inventory_quantity ?? 1) > 0
}

function variantMatchesAppearance(
  variant: HttpTypes.StoreProductVariant,
  color: string,
  appearanceOptionId?: string
): boolean {
  return (variant.options ?? []).some((opt) => {
    const isAppearance =
      isAppearanceOption(opt.option?.title) ||
      Boolean(appearanceOptionId && opt.option_id === appearanceOptionId)
    return isAppearance && opt.value === color
  })
}

function pickVariantId(
  product: HttpTypes.StoreProduct,
  color?: string
): string | null {
  const variants = product.variants ?? []
  const appearanceOptionId = product.options?.find((option) =>
    isAppearanceOption(option.title)
  )?.id
  const matching = color
    ? variants.filter((variant) =>
        variantMatchesAppearance(variant, color, appearanceOptionId)
      )
    : variants
  const pool = matching.length ? matching : variants
  const ready = pool.find(variantIsPurchasable)
  return ready?.id ?? pool.find((variant) => variant.id)?.id ?? null
}

function extractSwatches(
  product: HttpTypes.StoreProduct
): PhysicalProductCardProps["swatches"] {
  const swatchLabels = appearanceValues(product).slice(0, 5)
  if (swatchLabels.length === 0) {
    return []
  }

  const imagePool = [
    toImageUrl({ url: product.thumbnail ?? undefined }),
    ...(product.images ?? []).map((img) => toImageUrl(img)),
  ].filter((u): u is string => Boolean(u))

  const uniqueImagePool = [...new Set(imagePool)]

  return swatchLabels.map((label, index) => {
    const token = normalizeToken(label)
    const matched = uniqueImagePool.find((url) =>
      normalizeToken(url).includes(token)
    )
    return {
      label,
      imageUrl: matched ?? uniqueImagePool[index] ?? null,
      hex: swatchHexForLabel(product, label),
      variantId: pickVariantId(product, label),
    }
  })
}

function subtitleForProduct(product: HttpTypes.StoreProduct): string {
  const tagline = productMetadataString(product, "tagline") ?? product.subtitle
  if (tagline) return truncateText(tagline, 96)
  const fromDesc = truncateText(product.description ?? undefined)
  if (fromDesc) return fromDesc
  const cat = product.categories?.[0]?.name
  if (cat) return cat
  return product.type?.value ?? "Physical"
}

export function buildPhysicalProductCardProps(
  priced: HttpTypes.StoreProduct
): PhysicalProductCardProps | null {
  if (!priced.handle) {
    return null
  }

  const { cheapestPrice } = getProductPrice({ product: priced })
  const imageUrl =
    priced.thumbnail ??
    (priced.images?.[0] as { url?: string } | undefined)?.url ??
    null

  const lineLabel = priced.collection?.title?.trim() || ""

  return {
    handle: priced.handle,
    title: productDisplayTitle(priced),
    subtitle: subtitleForProduct(priced),
    lineLabel,
    imageUrl,
    priceFormatted: cheapestPrice?.calculated_price ?? null,
    originalPriceFormatted:
      cheapestPrice?.price_type === "sale"
        ? cheapestPrice.original_price
        : undefined,
    priceIsSale: cheapestPrice?.price_type === "sale",
    swatches: extractSwatches(priced),
    defaultVariantId: pickVariantId(priced),
    fitLabel: fitLabelForProduct(priced),
    launchStatus: typeof priced.metadata?.launch_status === "string" ? priced.metadata.launch_status : "",
    inventoryQuantity: priced.variants?.reduce((sum, variant) => sum + (variant.inventory_quantity ?? 0), 0) ?? null,
    restockedAt: (priced.variants?.find((variant) => typeof variant.metadata?.restocked_at === "string")?.metadata?.restocked_at as string | undefined) ?? null,
  }
}
