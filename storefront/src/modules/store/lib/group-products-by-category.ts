import { isLineCollectionHandle } from "@lib/util/line-collections"
import { HttpTypes } from "@medusajs/types"

export type PhysicalCategorySection = {
  id: string
  name: string
  handle?: string | null
  products: HttpTypes.StoreProduct[]
}

export type ComingSoonCategory = {
  id: string
  name: string
  handle?: string | null
  shape?: string | null
}

export function productCreatedAtMs(product: HttpTypes.StoreProduct): number {
  if (!product.created_at) return 0
  const time = new Date(product.created_at).getTime()
  return Number.isFinite(time) ? time : 0
}

export function latestCreatedAtMs(products: HttpTypes.StoreProduct[]): number {
  return products.reduce(
    (max, product) => Math.max(max, productCreatedAtMs(product)),
    0
  )
}

export function isLatestInGroup(
  product: HttpTypes.StoreProduct,
  products: HttpTypes.StoreProduct[]
): boolean {
  const latest = latestCreatedAtMs(products)
  return latest > 0 && productCreatedAtMs(product) === latest
}

/** Newest products first; remaining items keep the given order. */
export function pinLatestProducts(
  products: HttpTypes.StoreProduct[]
): HttpTypes.StoreProduct[] {
  if (products.length <= 1) return products
  const latest = latestCreatedAtMs(products)
  if (latest <= 0) return products
  const newest: HttpTypes.StoreProduct[] = []
  const rest: HttpTypes.StoreProduct[] = []
  for (const product of products) {
    if (productCreatedAtMs(product) === latest) newest.push(product)
    else rest.push(product)
  }
  return [...newest, ...rest]
}

type StoreCategory = HttpTypes.StoreProductCategory & {
  parent_category_id?: string | null
  rank?: number
  is_active?: boolean
  is_internal?: boolean
}

function parentCategoryId(c: StoreCategory): string | null | undefined {
  return c.parent_category_id ?? c.parent_category?.id ?? null
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

function isPublicActive(c: StoreCategory): boolean {
  if (c.is_active === false) return false
  if (c.is_internal === true) return false
  if (isLineCollectionHandle(c.handle) || isLineCollectionHandle(c.name)) {
    return false
  }
  if (isTruthyMetadata(c.metadata, "hide_on_store")) return false
  return true
}

function compareCategories(a: StoreCategory, b: StoreCategory): number {
  const ra = a.rank ?? 0
  const rb = b.rank ?? 0
  if (ra !== rb) return ra - rb
  return (a.name ?? "").localeCompare(b.name ?? "")
}

function isDescendantOf(
  node: StoreCategory,
  ancestorId: string,
  byId: Map<string, StoreCategory>
): boolean {
  let current: StoreCategory | undefined = node
  let guard = 0
  while (current && guard < 32) {
    const parentId = parentCategoryId(current)
    if (!parentId) return false
    if (parentId === ancestorId) return true
    current = byId.get(parentId)
    guard += 1
  }
  return false
}

function hasChildCategories(
  category: StoreCategory,
  all: StoreCategory[]
): boolean {
  if (category.category_children?.length) return true
  return all.some((other) => parentCategoryId(other) === category.id)
}

function flattenCategories(
  categories: HttpTypes.StoreProductCategory[] | null | undefined
): StoreCategory[] {
  const byId = new Map<string, StoreCategory>()

  const visit = (category: StoreCategory) => {
    const id = category.id as string | undefined
    if (!id || byId.has(id)) return
    byId.set(id, category)
    for (const child of (category.category_children ?? []) as StoreCategory[]) {
      visit(child)
    }
  }

  for (const category of (categories ?? []) as StoreCategory[]) {
    visit(category)
  }

  return Array.from(byId.values())
}

/**
 * Prefer the most specific assigned category (leaf) when a product is
 * linked to both a parent and a child in the same tree.
 */
function displayCategoriesForProduct(
  product: HttpTypes.StoreProduct,
  byId: Map<string, StoreCategory>
): StoreCategory[] {
  const assigned = (product.categories ?? []).filter(Boolean) as StoreCategory[]
  if (!assigned.length) return []

  const resolved = assigned.map((c) => {
    const id = c.id as string
    return byId.get(id) ?? c
  })

  return resolved.filter((cat) => {
    const id = cat.id as string
    return !resolved.some(
      (other) =>
        other.id !== id && isDescendantOf(other, id, byId)
    )
  })
}

/**
 * Buckets products under the Medusa categories assigned in Admin.
 * New categories (Hoodies, Sneakers, Caps, …) appear as their own
 * sections as soon as a product is assigned — no hardcoded names.
 */
export function groupProductsByAssignedCategory(
  products: HttpTypes.StoreProduct[],
  allCategories: HttpTypes.StoreProductCategory[] | null | undefined
): PhysicalCategorySection[] {
  const catalog = flattenCategories(allCategories)
  const byId = new Map(catalog.map((c) => [c.id as string, c]))

  const buckets = new Map<string, HttpTypes.StoreProduct[]>()
  const labels = new Map<string, { name: string; handle?: string | null }>()

  for (const product of products) {
    const cats = displayCategoriesForProduct(product, byId)
    if (cats.length === 0) {
      const key = "__other__"
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key)!.push(product)
      continue
    }

    for (const cat of cats) {
      if (!isPublicActive(cat)) continue
      const key = cat.id as string
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key)!.push(product)
      labels.set(key, {
        name: cat.name ?? "Category",
        handle: cat.handle,
      })
    }
  }

  const orderedIds = catalog
    .filter((c) => buckets.has(c.id as string))
    .sort(compareCategories)
    .map((c) => c.id as string)

  for (const id of Array.from(buckets.keys())) {
    if (id !== "__other__" && !orderedIds.includes(id)) {
      orderedIds.push(id)
    }
  }

  const out: PhysicalCategorySection[] = []

  for (const id of orderedIds) {
    const list = buckets.get(id)
    if (!list?.length) continue
    const cat = byId.get(id)
    const label = labels.get(id)
    out.push({
      id,
      name: label?.name ?? cat?.name ?? "Category",
      handle: label?.handle ?? cat?.handle,
      products: list,
    })
  }

  const other = buckets.get("__other__")
  if (other?.length) {
    out.push({ id: "__other__", name: "Other", products: other })
  }

  return out
}

/** @deprecated Use groupProductsByAssignedCategory */
export const groupProductsByTopLevelCategory = groupProductsByAssignedCategory

/**
 * Active Medusa categories with no products on Physical Form.
 * Used for the Coming Soon / Future Forms block — names come from Admin.
 */
export function listComingSoonCategories(
  allCategories: HttpTypes.StoreProductCategory[] | null | undefined,
  sections: PhysicalCategorySection[]
): ComingSoonCategory[] {
  const catalog = flattenCategories(allCategories)
  const usedIds = new Set(sections.map((s) => s.id))

  return catalog
    .filter(isPublicActive)
    .filter((c) => Boolean(c.name))
    .filter((c) => {
      if (isTruthyMetadata(c.metadata, "coming_soon")) return true
      if (usedIds.has(c.id as string)) return false
      return !hasChildCategories(c, catalog)
    })
    .sort(compareCategories)
    .map((c) => ({
      id: c.id as string,
      name: c.name as string,
      handle: c.handle,
      shape:
        typeof c.metadata?.shape === "string" ? c.metadata.shape : null,
    }))
}
