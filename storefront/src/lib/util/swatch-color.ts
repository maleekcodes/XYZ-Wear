import { HttpTypes } from "@medusajs/types"

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

function asHex(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) {
    return trimmed
  }
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return `#${trimmed}`
  }
  return null
}

function parseColorMap(raw: unknown): Record<string, string> {
  if (!raw) return {}
  let data: unknown = raw
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (!data || typeof data !== "object") return {}

  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const hex = asHex(value)
    if (hex) out[normalizeKey(key)] = hex
  }
  return out
}

/** Colors set on the product in Medusa (`metadata.swatch_colors`). */
export function swatchColorMap(
  product?: HttpTypes.StoreProduct | null
): Record<string, string> {
  if (!product) return {}
  const fromMeta = parseColorMap(product.metadata?.swatch_colors)

  const option = product.options?.find((item) => {
    const title = item.title?.toLowerCase() ?? ""
    return title.includes("color") || title.includes("colour") || title.includes("finish")
  })

  for (const value of option?.values ?? []) {
    const hex = asHex(
      (value as { metadata?: Record<string, unknown> }).metadata?.swatch_hex
    )
    if (hex && value.value) {
      const key = normalizeKey(value.value)
      if (!fromMeta[key]) fromMeta[key] = hex
    }
  }

  return fromMeta
}

export function swatchHexForLabel(
  product: HttpTypes.StoreProduct | null | undefined,
  label: string
): string | null {
  const map = swatchColorMap(product)
  return map[normalizeKey(label)] ?? null
}
