import { listCategories } from "@lib/data/categories"
import {
  getPhysicalStoreCatalogProducts,
  getProductsById,
} from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  isLineCollectionHandle,
  normalizeHandle,
} from "@lib/util/line-collections"
import { productTypeCategory } from "@lib/util/product-type-category"
import { HttpTypes } from "@medusajs/types"
import {
  FUTURE_FORMS_HANDLE,
} from "@modules/store/components/physical-form-category-tabs"
import { buildPhysicalProductCardProps } from "@modules/store/lib/build-physical-product-card-props"
import {
  groupProductsByAssignedCategory,
  isLatestInGroup,
  listComingSoonCategories,
  pinLatestProducts,
  type PhysicalCategorySection,
} from "@modules/store/lib/group-products-by-category"
import { groupProductsByLineCollection } from "@modules/store/lib/group-products-by-collection"

import {
  PhysicalFormPdpCatalogView,
  type PdpCatalog,
} from "./physical-form-pdp-catalog-view"

function toCatalog(section: PhysicalCategorySection): PdpCatalog | null {
  const handle = section.handle
  if (!handle) return null

  return {
    handle,
    groups: groupProductsByLineCollection(section.products, {
      includeEmpty: true,
    }).map((group) => ({
      id: group.id,
      title: group.title,
      handle: group.handle,
      cards: group.products
        .map((item) => {
          const card = buildPhysicalProductCardProps(item)
          if (!card || !item.id) return null
          return {
            ...card,
            id: item.id,
            isLatest: isLatestInGroup(item, group.products),
          }
        })
        .filter((card): card is NonNullable<typeof card> => Boolean(card)),
    })),
  }
}

export default async function PhysicalFormPdpCatalog({
  product,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
}) {
  const category = productTypeCategory(product)
  if (!category?.handle) return null

  const region = await getRegion(countryCode)
  if (!region) return null

  const [sorted, allCategories] = await Promise.all([
    getPhysicalStoreCatalogProducts({
      sortBy: "created_at",
      countryCode,
    }),
    listCategories(),
  ])

  const ids = sorted.map((item) => item.id).filter(Boolean) as string[]
  const priced =
    ids.length > 0
      ? await getProductsById({ ids, regionId: region.id })
      : []
  const pricedById = new Map(priced.map((item) => [item.id, item]))
  const enriched = sorted.map(
    (item) => (item.id ? pricedById.get(item.id) : null) ?? item
  )

  const sections = groupProductsByAssignedCategory(
    enriched,
    allCategories
  ).map((section) => ({
    ...section,
    products: pinLatestProducts(section.products),
  }))
  const comingSoon = listComingSoonCategories(allCategories, sections)

  const seen = new Set<string>()
  const tabs = [
    { name: category.name, handle: category.handle },
    ...sections.map((section) => ({
      name: section.name,
      handle: section.handle ?? "",
    })),
    ...comingSoon.map((item) => ({
      name: item.name,
      handle: item.handle ?? "",
    })),
  ].filter((tab) => {
    const handle = normalizeHandle(tab.handle)
    if (!handle || handle === FUTURE_FORMS_HANDLE || seen.has(handle)) {
      return false
    }
    if (isLineCollectionHandle(handle)) return false
    seen.add(handle)
    return true
  })

  const catalogs = [
    ...sections,
    ...comingSoon
      .filter(
        (item) => !sections.some((section) => section.id === item.id)
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
        handle: item.handle,
        products: [] as HttpTypes.StoreProduct[],
      })),
  ]
    .map(toCatalog)
    .filter((catalog): catalog is PdpCatalog => Boolean(catalog))

  return (
    <PhysicalFormPdpCatalogView
      tabs={tabs}
      initialHandle={category.handle}
      catalogs={catalogs}
      comingSoon={comingSoon}
    />
  )
}
