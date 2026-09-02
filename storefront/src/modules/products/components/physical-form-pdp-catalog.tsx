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
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PhysicalProductCard } from "@modules/store/components/physical-product-card"
import {
  FUTURE_FORMS_HANDLE,
  PhysicalFormCategoryTabs,
} from "@modules/store/components/physical-form-category-tabs"
import { CATALOG_SCROLL_ID } from "@modules/store/lib/catalog-scroll"
import { buildPhysicalProductCardProps } from "@modules/store/lib/build-physical-product-card-props"
import {
  groupProductsByAssignedCategory,
  isLatestInGroup,
  listComingSoonCategories,
  pinLatestProducts,
} from "@modules/store/lib/group-products-by-category"
import { groupProductsByLineCollection } from "@modules/store/lib/group-products-by-collection"

function categoryHref(handle: string) {
  return `/categories/${handle}`
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
  ]
    .filter((tab) => {
      const handle = normalizeHandle(tab.handle)
      if (!handle || handle === FUTURE_FORMS_HANDLE || seen.has(handle)) {
        return false
      }
      if (isLineCollectionHandle(handle)) return false
      seen.add(handle)
      return true
    })
    .map((tab) => ({
      ...tab,
      href: categoryHref(tab.handle),
    }))

  const pageSection = sections.find(
    (section) =>
      normalizeHandle(section.handle) === normalizeHandle(category.handle)
  )
  const catalogProducts = pageSection?.products ?? []
  const collectionGroups = groupProductsByLineCollection(catalogProducts, {
    includeEmpty: true,
  })

  return (
    <div className="mt-12 md:mt-16">
      <PhysicalFormCategoryTabs
        tabs={tabs}
        activeHandle={category.handle}
        showFuture
        futureHref={`${categoryHref(category.handle)}?view=${FUTURE_FORMS_HANDLE}`}
      />

      <section
        id={CATALOG_SCROLL_ID}
        className="scroll-mt-[10.5rem] mt-12 space-y-16 md:mt-16 md:space-y-20"
        data-testid="products-list"
      >
        {collectionGroups.map((group) => (
          <div
            key={group.id}
            id={group.handle ? `line-${group.handle}` : undefined}
          >
            <div className="mb-6 flex items-baseline justify-between gap-3">
              {group.handle ? (
                <LocalizedClientLink
                  href={`${categoryHref(category.handle)}?collection=${group.handle}`}
                  className="text-lg font-bold tracking-tight text-deepBlack hover:opacity-70 transition-opacity md:text-xl"
                >
                  {group.title}
                </LocalizedClientLink>
              ) : (
                <span className="text-lg font-bold tracking-tight text-deepBlack md:text-xl">
                  {group.title}
                </span>
              )}
              {group.products.length > 0 && (
                <span className="font-mono text-[10px] text-neutral-400">
                  {group.products.length}
                </span>
              )}
            </div>
            {group.products.length > 0 ? (
              <ul className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                {group.products.map((item) => {
                  const cardProps = buildPhysicalProductCardProps(item)
                  if (!cardProps) return null
                  return (
                    <li key={item.id}>
                      <PhysicalProductCard
                        {...cardProps}
                        compact
                        isLatest={isLatestInGroup(item, group.products)}
                      />
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                Coming soon
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
