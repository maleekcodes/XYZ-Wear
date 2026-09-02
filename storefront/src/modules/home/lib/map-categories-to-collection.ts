import {
  LINE_COLLECTION_HANDLES,
  isLineCollectionHandle,
  lineCollectionSectionLabel,
  type LineCollectionHandle,
} from "@lib/util/line-collections"
import {
  productDisplayTitle,
  productMetadataString,
} from "@lib/util/physical-product-copy"
import { HttpTypes } from "@medusajs/types"

import {
  groupProductsByAssignedCategory,
  isLatestInGroup,
  listComingSoonCategories,
  productCreatedAtMs,
  type ComingSoonCategory,
} from "@modules/store/lib/group-products-by-category"
import { groupProductsByLineCollection } from "@modules/store/lib/group-products-by-collection"
import type { PhysicalProductCardProps } from "@modules/store/components/physical-product-card"
import { buildPhysicalProductCardProps } from "@modules/store/lib/build-physical-product-card-props"

export type CollectionShape = "x" | "y" | "z"

export type HomeCollectionItem = {
  id: string
  title: string
  description: string
  line: string
  href: string
  shape: CollectionShape
  imageUrl?: string | null
  isLatest?: boolean
  comingSoon?: boolean
  card?: PhysicalProductCardProps | null
}

export type HomeCategorySection = {
  id: string
  name: string
  handle?: string | null
  items: HomeCollectionItem[]
}

export type HomeCollectionLayout = {
  categories: HomeCategorySection[]
  futureForms: ComingSoonCategory[]
}

type StoreCategory = HttpTypes.StoreProductCategory & {
  parent_category_id?: string | null
  rank?: number
  is_active?: boolean
}

function parentCategoryId(c: StoreCategory): string | null | undefined {
  return c.parent_category_id ?? c.parent_category?.id ?? null
}

function metadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string
): string | undefined {
  const value = metadata?.[key]
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function resolveShape(
  metadata: Record<string, unknown> | null | undefined,
  index: number
): CollectionShape {
  const raw = metadataString(metadata, "shape")?.toLowerCase()
  if (raw === "x" || raw === "y" || raw === "z") return raw
  return LINE_COLLECTION_HANDLES[index % LINE_COLLECTION_HANDLES.length]
}

function resolveLine(
  category: HttpTypes.StoreProductCategory,
  index: number
): string {
  const fromMeta = metadataString(category.metadata, "line")
  if (fromMeta) return fromMeta

  const name = (category.name ?? "").trim()
  if (/^[xyz]\b/i.test(name) || /\bline\b/i.test(name)) return name

  return `${["X", "Y", "Z"][index % 3]} Line`
}

function isTruthyMetadata(
  metadata: Record<string, unknown> | null | undefined,
  key: string
): boolean {
  const value = metadata?.[key]
  if (value === true || value === 1) return true
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "true" || normalized === "1" || normalized === "yes"
  }
  return false
}

/**
 * Top-level active Medusa categories → homepage collection cards.
 *
 * @deprecated Prefer {@link mapPhysicalHomeCollection} for category × line layout.
 */
export function mapCategoriesToCollectionItems(
  categories: HttpTypes.StoreProductCategory[] | null | undefined
): HomeCollectionItem[] {
  if (!categories?.length) return []

  const topLevel = (categories as StoreCategory[])
    .filter((c) => !parentCategoryId(c))
    .filter((c) => c.is_active !== false)
    .filter((c) => !isLineCollectionHandle(c.handle) && !isLineCollectionHandle(c.name))
    .sort((a, b) => {
      const ra = a.rank ?? 0
      const rb = b.rank ?? 0
      if (ra !== rb) return ra - rb
      return (a.name ?? "").localeCompare(b.name ?? "")
    })

  const curated = topLevel.filter((c) =>
    isTruthyMetadata(c.metadata, "show_on_home")
  )
  const selected = curated.length > 0 ? curated : topLevel

  return selected
    .filter((c) => Boolean(c.handle) && Boolean(c.name))
    .map((c, index) => {
      const subtitle =
        metadataString(c.metadata, "subtitle") ??
        (c.description?.trim() || "View products")

      return {
        id: c.id as string,
        title: c.name as string,
        description: subtitle,
        line: resolveLine(c, index),
        href: `/categories/${c.handle}`,
        shape: resolveShape(c.metadata, index),
      }
    })
}

function productImageUrl(product: HttpTypes.StoreProduct): string | null {
  const thumbnail = product.thumbnail?.trim()
  if (thumbnail) return thumbnail
  const first = product.images?.[0] as { url?: string } | undefined
  const url = first?.url?.trim()
  return url || null
}

function latestProduct(products: HttpTypes.StoreProduct[]) {
  if (!products.length) return null
  return [...products].sort(
    (a, b) => productCreatedAtMs(b) - productCreatedAtMs(a)
  )[0]
}

function lineCard(args: {
  categoryId: string
  categoryHandle?: string | null
  line: LineCollectionHandle
  product?: HttpTypes.StoreProduct | null
  isLatest?: boolean
}): HomeCollectionItem {
  const { categoryId, categoryHandle, line, product, isLatest } = args
  const href = product?.handle
    ? `/products/${product.handle}`
    : categoryHandle
      ? `/categories/${categoryHandle}?collection=${line}`
      : "/store"
  const card = product ? buildPhysicalProductCardProps(product) : null

  return {
    id: `${categoryId}-${line}`,
    title: (product && productDisplayTitle(product)) || "Coming soon",
    description:
      (product &&
        (productMetadataString(product, "tagline") ??
          product.subtitle?.trim())) ||
      "Coming soon",
    line: lineCollectionSectionLabel(line),
    href,
    shape: line,
    imageUrl: product ? productImageUrl(product) : null,
    isLatest: Boolean(isLatest),
    comingSoon: !product,
    card: card
      ? { ...card, isLatest: Boolean(isLatest) }
      : null,
  }
}

/**
 * Homepage Physical Form: each category (Tees, Caps, …) shows X / Y / Z,
 * featuring the latest product in that line. Empty lines use the original
 * abstract shapes. Future Forms is a separate coming-soon grid.
 */
export function mapPhysicalHomeCollection(
  products: HttpTypes.StoreProduct[] | null | undefined,
  categories: HttpTypes.StoreProductCategory[] | null | undefined
): HomeCollectionLayout {
  const withProducts = groupProductsByAssignedCategory(
    products ?? [],
    categories
  ).filter((section) => section.id !== "__other__")
  const comingSoon = listComingSoonCategories(categories, withProducts)
  const usedIds = new Set(withProducts.map((section) => section.id))
  const emptyCategories = comingSoon.filter((category) => !usedIds.has(category.id))

  const categorySections = [
    ...withProducts,
    ...emptyCategories.map((category) => ({
      id: category.id,
      name: category.name,
      handle: category.handle,
      products: [] as HttpTypes.StoreProduct[],
    })),
  ]

  return {
    futureForms: comingSoon,
    categories: categorySections.map((section) => {
      const lines = groupProductsByLineCollection(section.products, {
        includeEmpty: true,
      })

      return {
        id: section.id,
        name: section.name,
        handle: section.handle,
        items: LINE_COLLECTION_HANDLES.map((line) => {
          const group = lines.find((item) => item.handle === line)
          const product = latestProduct(group?.products ?? [])
          return lineCard({
            categoryId: section.id,
            categoryHandle: section.handle,
            line,
            product,
            isLatest: product
              ? isLatestInGroup(product, section.products)
              : false,
          })
        }),
      }
    }),
  }
}
