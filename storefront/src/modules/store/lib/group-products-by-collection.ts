import { HttpTypes } from "@medusajs/types"

import {
  LINE_COLLECTION_HANDLES,
  isLineCollectionHandle,
  lineCollectionSectionLabel,
  normalizeHandle,
} from "@lib/util/line-collections"

export type PhysicalCollectionGroup = {
  id: string
  title: string
  handle: string | null
  products: HttpTypes.StoreProduct[]
}

export function groupProductsByLineCollection(
  products: HttpTypes.StoreProduct[],
  options?: { includeEmpty?: boolean }
): PhysicalCollectionGroup[] {
  const buckets = new Map<string, PhysicalCollectionGroup>()

  for (const handle of LINE_COLLECTION_HANDLES) {
    buckets.set(handle, {
      id: handle,
      title: lineCollectionSectionLabel(handle),
      handle,
      products: [],
    })
  }

  const extras: PhysicalCollectionGroup[] = []

  for (const product of products) {
    const handle = normalizeHandle(product.collection?.handle)
    if (isLineCollectionHandle(handle)) {
      buckets.get(handle)!.products.push(product)
      continue
    }

    if (product.collection?.id) {
      const key = product.collection.id
      const existing = extras.find((group) => group.id === key)
      if (existing) {
        existing.products.push(product)
      } else {
        extras.push({
          id: key,
          title: product.collection.title || "Collection",
          handle: product.collection.handle ?? null,
          products: [product],
        })
      }
      continue
    }

    const unassigned = extras.find((group) => group.id === "__none__")
    if (unassigned) {
      unassigned.products.push(product)
    } else {
      extras.push({
        id: "__none__",
        title: "Unassigned",
        handle: null,
        products: [product],
      })
    }
  }

  const lineGroups = LINE_COLLECTION_HANDLES.map((handle) => buckets.get(handle)!)
  const visible = options?.includeEmpty
    ? lineGroups
    : lineGroups.filter((group) => group.products.length > 0)

  return [...visible, ...extras].filter(
    (group) => options?.includeEmpty || group.products.length > 0
  )
}
