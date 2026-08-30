import { HttpTypes } from "@medusajs/types"

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]

export const PRODUCT_DETAIL_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,*variants.options,*variants.images,*options,*options.values,*categories,*collection,*images,+thumbnail,+metadata"

export function isAppearanceOption(title?: string | null): boolean {
  const t = title?.toLowerCase() ?? ""
  return t.includes("color") || t.includes("colour") || t.includes("finish")
}

export function isSizeOption(title?: string | null): boolean {
  return (title?.toLowerCase() ?? "") === "size"
}

export function optionValuesInOrder(
  option?: HttpTypes.StoreProductOption | null
): string[] {
  const values = [...(option?.values ?? [])]
  values.sort((a, b) => {
    const aRank = (a as { rank?: number }).rank
    const bRank = (b as { rank?: number }).rank
    const ar = typeof aRank === "number" ? aRank : Number.MAX_SAFE_INTEGER
    const br = typeof bRank === "number" ? bRank : Number.MAX_SAFE_INTEGER
    if (ar !== br) return ar - br
    return 0
  })
  const names = values
    .map((item) => item.value)
    .filter((value): value is string => Boolean(value))
  return [...new Set(names)]
}

export function findAppearanceOption(
  product: HttpTypes.StoreProduct
): HttpTypes.StoreProductOption | undefined {
  return product.options?.find((option) => isAppearanceOption(option.title))
}

export function appearanceValues(product: HttpTypes.StoreProduct): string[] {
  const option = findAppearanceOption(product)
  const fromOption = optionValuesInOrder(option)
  if (fromOption.length) return fromOption

  const fromVariants: string[] = []
  for (const variant of product.variants ?? []) {
    for (const opt of variant.options ?? []) {
      if (isAppearanceOption(opt.option?.title) && opt.value) {
        if (!fromVariants.includes(opt.value)) fromVariants.push(opt.value)
      }
    }
  }
  return fromVariants
}

export function defaultAppearanceValue(
  product: HttpTypes.StoreProduct
): string | undefined {
  return appearanceValues(product)[0]
}

export function variantHasOption(
  variant: HttpTypes.StoreProductVariant,
  title: string,
  value: string
): boolean {
  return (variant.options ?? []).some((opt) => {
    const optionTitle = opt.option?.title ?? ""
    return (
      optionTitle.toLowerCase() === title.toLowerCase() && opt.value === value
    )
  })
}

export function imagesForAppearance(
  product: HttpTypes.StoreProduct | undefined,
  images: HttpTypes.StoreProductImage[],
  selected: string | undefined,
  knownColors: string[] = []
): HttpTypes.StoreProductImage[] {
  const colors = knownColors.length
    ? knownColors
    : product
      ? appearanceValues(product)
      : []
  const defaultColor = colors[0]
  const active = selected ?? defaultColor

  const fromProduct = filterImagesByToken(images, active, colors, defaultColor)
  if (fromProduct.length) return fromProduct

  if (product && active) {
    const appearanceOption = findAppearanceOption(product)
    const title = appearanceOption?.title
    if (title) {
      const fromVariants: HttpTypes.StoreProductImage[] = []
      const seen = new Set<string>()
      for (const variant of product.variants ?? []) {
        if (!variantHasOption(variant, title, active)) continue
        for (const image of variant.images ?? []) {
          if (!image.url || seen.has(image.url)) continue
          seen.add(image.url)
          fromVariants.push(image)
        }
      }
      const fromVariantTokens = filterImagesByToken(
        fromVariants,
        active,
        colors,
        defaultColor
      )
      if (fromVariantTokens.length) return fromVariantTokens
      if (fromVariants.length) return fromVariants
    }
  }

  return images.slice(0, Math.min(2, images.length))
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function colorTokenInUrl(url: string, colors: string[]): string | null {
  const normalizedUrl = normalizeToken(url)
  const sorted = [...colors].sort(
    (a, b) => normalizeToken(b).length - normalizeToken(a).length
  )
  for (const color of sorted) {
    const token = normalizeToken(color)
    if (token && normalizedUrl.includes(token)) return color
  }
  return null
}

function filterImagesByToken(
  images: HttpTypes.StoreProductImage[],
  selected: string,
  colors: string[],
  defaultColor: string | undefined
): HttpTypes.StoreProductImage[] {
  const activeToken = normalizeToken(selected)
  const defaultToken = normalizeToken(defaultColor ?? selected)
  const isDefault = activeToken === defaultToken

  return images.filter((img) => {
    const detected = colorTokenInUrl(img.url ?? "", colors)
    if (!detected) return isDefault
    return normalizeToken(detected) === activeToken
  })
}

export function sortedDisplayValues(
  title: string,
  values: HttpTypes.StoreProductOption["values"]
): string[] {
  const names = (values ?? [])
    .map((v) => v.value)
    .filter((v): v is string => Boolean(v))

  if (!isSizeOption(title)) return [...new Set(names)]

  return [...new Set(names)].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase())
    const bi = SIZE_ORDER.indexOf(b.toUpperCase())
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

export function productHasSelectableOptions(
  product: HttpTypes.StoreProduct
): boolean {
  return (product.options ?? []).some(
    (option) => optionValuesInOrder(option).length > 0
  )
}
