import type { HttpTypes } from "@medusajs/types"

import { getBaseURL } from "@lib/util/env"
import type { SiteSettingsSanity } from "@/types/xyz"

import { SITE_DESCRIPTION, SITE_NAME } from "./site"

const baseUrl = () => getBaseURL().replace(/\/$/, "")

export function buildOrganizationSchema(
  settings?: SiteSettingsSanity | null
): Record<string, unknown> {
  const sameAs = [
    "https://www.instagram.com/xyzlondonofficial/",
    "https://www.tiktok.com/@xyzlondon",
  ]

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.title?.trim() || SITE_NAME,
    url: baseUrl(),
    ...(settings?.logoUrl
      ? { logo: settings.logoUrl }
      : { logo: `${baseUrl()}/images/logo.png` }),
    description:
      settings?.organizationDescription?.trim() ||
      settings?.description?.trim() ||
      SITE_DESCRIPTION,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

export function buildProductSchema({
  product,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
}): Record<string, unknown> | null {
  const variant = product.variants?.find(
    (v) => v.calculated_price?.calculated_amount != null
  )
  const priceMinor = variant?.calculated_price?.calculated_amount
  const currency =
    variant?.calculated_price?.currency_code?.toUpperCase() || "GBP"

  if (priceMinor == null) {
    return null
  }

  const price = (priceMinor / 100).toFixed(2)
  const images = [
    product.thumbnail,
    ...(product.images?.map((img) => img.url) ?? []),
  ].filter((url): url is string => typeof url === "string" && url.length > 0)

  const description =
    product.description?.replace(/<[^>]*>/g, "").trim() ||
    `${product.title} — ${SITE_NAME}.`

  const inventory = variant?.inventory_quantity ?? 0
  const availability =
    inventory > 0 || variant?.manage_inventory === false
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock"

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    ...(images.length > 0 ? { image: images } : {}),
    description,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl()}/${countryCode}/products/${product.handle}`,
      priceCurrency: currency,
      price,
      availability,
    },
  }
}
