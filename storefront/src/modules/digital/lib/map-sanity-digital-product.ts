import { normalizeDigitalPdpSlug } from "@lib/digital/normalize-digital-slug"
import type {
  DigitalFormProductDisplay,
  DigitalFormProductSanity,
} from "@/types/xyz"

export function sanityDigitalToDisplay(
  p: DigitalFormProductSanity
): DigitalFormProductDisplay {
  const rawSlug = p.slug?.trim() || ""
  const normalizedSlug = normalizeDigitalPdpSlug(rawSlug) || null
  return {
    id: p._key || p.name || "item",
    sanityKey: p._key?.trim() || null,
    slug: normalizedSlug,
    name: p.name || "Untitled",
    productType: p.line || "Digital",
    category: p.category || "",
    shape: p.shape,
    description: p.description ?? undefined,
    previewImage: p.previewImage ?? null,
    platforms: p.platforms?.filter(Boolean) as string[] | undefined,
    price: p.price ?? null,
    currency: p.currency ?? null,
    medusaHandle: p.medusaHandle ?? null,
    externalLinks: p.externalLinks ?? null,
    isFeatured: !!p.isFeatured,
    isComingSoon: !!p.isComingSoon,
    statusLabel: p.statusLabel ?? undefined,
    medusaFromPrice: null,
  }
}
