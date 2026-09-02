import {
  isLineCollectionHandle,
  lineCollectionLabel,
} from "@lib/util/line-collections"
import { appearanceValues } from "@lib/util/product-options"
import { HttpTypes } from "@medusajs/types"

function normalizeMetaKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_")
}

export function productMetadataString(
  product: HttpTypes.StoreProduct,
  key: string
): string | null {
  const value = product.metadata?.[key]
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Assigned Medusa line collection (X / Y / Z), or the collection title. */
export function productLineCollectionLabel(
  product: HttpTypes.StoreProduct
): string | null {
  const collection = product.collection
  if (collection) {
    if (isLineCollectionHandle(collection.handle)) {
      return lineCollectionLabel(collection.handle)
    }
    const title = collection.title?.trim()
    if (title) return title
  }

  const match = (product.title ?? "").trim().match(/^([xyz])\s*[_\-]/i)
  return match?.[1] ? lineCollectionLabel(match[1]) : null
}

/** Product name from Admin `display_title`, else title without the `X _` prefix. */
export function productDisplayTitle(product: HttpTypes.StoreProduct): string {
  const override = productMetadataString(product, "display_title")
  if (override) return override
  const title = (product.title ?? "").trim()
  const stripped = title.replace(/^[xyz]\s*[_\-]\s*/i, "").trim()
  return stripped || title
}

export function productCollectionLine(
  product: HttpTypes.StoreProduct
): string | null {
  return (
    productMetadataString(product, "collection_line") ??
    product.collection?.title?.trim() ??
    null
  )
}

function taglineOverrideForColor(
  product: HttpTypes.StoreProduct,
  color: string
): string | null {
  const exact = productMetadataString(product, `tagline_${color}`)
  if (exact) return exact
  const normalized = productMetadataString(
    product,
    `tagline_${normalizeMetaKey(color)}`
  )
  if (normalized) return normalized

  const raw = product.metadata?.taglines
  if (!raw) return null
  let map: unknown = raw
  if (typeof raw === "string") {
    try {
      map = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!map || typeof map !== "object") return null
  const record = map as Record<string, unknown>
  const match =
    record[color] ??
    record[color.toLowerCase()] ??
    record[normalizeMetaKey(color)]
  return typeof match === "string" && match.trim() ? match.trim() : null
}

function applySelectedColorToCopy(
  text: string,
  colors: string[],
  selected: string
): string {
  if (!colors.length) return text
  const escaped = [...colors]
    .sort((a, b) => b.length - a.length)
    .map((color) => color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi")
  return text.replace(pattern, selected)
}

/** Tagline for the selected color; falls back to swapping the color name in copy. */
export function taglineForAppearance(
  product: HttpTypes.StoreProduct,
  selectedColor?: string | null
): string | null {
  const base =
    productMetadataString(product, "tagline") ?? product.subtitle ?? null
  const colors = appearanceValues(product)
  const active = selectedColor || colors[0]
  if (!active) return base

  const override = taglineOverrideForColor(product, active)
  if (override) return override
  if (!base) return null
  return applySelectedColorToCopy(base, colors, active)
}

export const SIZE_GUIDE_INTRO =
  "Genderless equals design and size philosophy"

export const SIZE_GUIDE_TITLE = "XYZ Frame Measurement Guide (Unisex)"

export const SIZE_GUIDE_COLUMNS = [
  "Frame",
  "Chest (in)",
  "Waist (in)",
  "Hip (in)",
  "Torso Length (in)",
] as const

export const SIZE_GUIDE_ROWS = [
  ["Compact", "23–26", "19–22", "24–27", "16–18"],
  ["Lean", "26–29", "22–25", "27–30", "18–20"],
  ["Balanced", "29–34", "25–30", "30–35", "20–22"],
  ["Athletic", "34–40", "30–35", "35–40", "21–23"],
  ["Broad", "40–46", "35–40", "40–45", "22–24"],
  ["Extended", "46–52", "40–48", "45–54", "23–26"],
] as const

export type SizeGuideContent = {
  intro: string
  title: string
  columns: string[]
  rows: string[][]
}

function parseSizeGuideTable(
  raw: unknown
): { columns: string[]; rows: string[][] } | null {
  if (!raw) return null
  let data: unknown = raw
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!data || typeof data !== "object") return null
  const table = data as { columns?: unknown; rows?: unknown }
  if (!Array.isArray(table.columns) || !Array.isArray(table.rows)) return null
  const columns = table.columns.filter(
    (col): col is string => typeof col === "string" && col.trim().length > 0
  )
  const rows = table.rows
    .filter((row): row is unknown[] => Array.isArray(row))
    .map((row) =>
      row.map((cell) => (typeof cell === "string" ? cell : String(cell ?? "")))
    )
    .filter((row) => row.some((cell) => cell.trim().length > 0))
  if (!columns.length || !rows.length) return null
  return { columns, rows }
}

/** Short catalog-card footer, e.g. Regular Fit or One Size. */
export function fitLabelForProduct(
  product: HttpTypes.StoreProduct
): string | null {
  return productMetadataString(product, "fit_label")
}

/** Only what the product sets in Medusa — no storefront fallback table. */
export function sizeGuideFromProduct(
  product?: HttpTypes.StoreProduct | null
): SizeGuideContent | null {
  if (!product) return null
  const parsed = parseSizeGuideTable(product.metadata?.size_guide)
  const intro = productMetadataString(product, "size_guide_intro")
  const title = productMetadataString(product, "size_guide_title")
  if (!parsed && !intro && !title) return null
  return {
    intro: intro ?? "",
    title: title ?? "",
    columns: parsed?.columns ?? [],
    rows: parsed?.rows ?? [],
  }
}
