import { Suspense } from "react"
import { notFound } from "next/navigation"

import { listCategories } from "@lib/data/categories"
import {
  getPhysicalStoreCatalogProducts,
  getProductsById,
} from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  isLineCollectionHandle,
  lineCollectionLabel,
  normalizeHandle,
} from "@lib/util/line-collections"
import { HttpTypes } from "@medusajs/types"
import { ScrollToCatalog } from "@modules/categories/components/scroll-to-catalog"
import { CategoryFeaturedProduct } from "@modules/categories/components/category-featured-product"
import { splitFeaturedAndOlder } from "@modules/categories/lib/split-featured-product"
import InteractiveLink from "@modules/common/components/interactive-link"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container } from "@modules/common/components/xyz/Container"
import {
  FUTURE_FORMS_HANDLE,
  PhysicalFormCategoryTabs,
} from "@modules/store/components/physical-form-category-tabs"
import { CATALOG_SCROLL_ID } from "@modules/store/lib/catalog-scroll"
import { PhysicalProductCard } from "@modules/store/components/physical-product-card"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { buildPhysicalProductCardProps } from "@modules/store/lib/build-physical-product-card-props"
import {
  groupProductsByAssignedCategory,
  isLatestInGroup,
  pinLatestProducts,
} from "@modules/store/lib/group-products-by-category"
import { groupProductsByLineCollection } from "@modules/store/lib/group-products-by-collection"

function categoryPageHref({
  pageHandle,
  viewHandle,
  collectionHandle,
  hash,
}: {
  pageHandle: string
  viewHandle?: string
  collectionHandle?: string
  hash?: string
}) {
  const params = new URLSearchParams()
  if (collectionHandle) params.set("collection", collectionHandle)
  if (viewHandle && viewHandle !== pageHandle) params.set("view", viewHandle)
  const query = params.toString()
  const path = query
    ? `/categories/${pageHandle}?${query}`
    : `/categories/${pageHandle}`
  return hash ? `${path}#${hash}` : path
}

export default async function CategoryTemplate({
  categories,
  sortBy,
  countryCode,
  featuredHandle,
  collectionHandle,
  viewHandle,
}: {
  categories: HttpTypes.StoreProductCategory[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
  featuredHandle?: string
  collectionHandle?: string
  viewHandle?: string
}) {
  const sort = sortBy || "created_at"
  const category = categories[categories.length - 1]
  const parents = categories.slice(0, -1)

  if (!category || !countryCode) notFound()

  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const [sorted, allCategories] = await Promise.all([
    getPhysicalStoreCatalogProducts({
      sortBy: sort,
      countryCode,
    }),
    listCategories(),
  ])

  const catalogIds = sorted.map((p) => p.id).filter(Boolean) as string[]
  const catalogPriced =
    catalogIds.length > 0
      ? await getProductsById({ ids: catalogIds, regionId: region.id })
      : []
  const catalogById = new Map(catalogPriced.map((p) => [p.id, p]))
  const catalogEnriched = sorted.map(
    (p) => (p.id ? catalogById.get(p.id) : null) ?? p
  )

  const sections = groupProductsByAssignedCategory(
    catalogEnriched,
    allCategories
  ).map((section) => ({
    ...section,
    products: pinLatestProducts(section.products),
  }))
  const pageHandle = category.handle ?? ""
  const pageSection = sections.find(
    (section) => normalizeHandle(section.handle) === normalizeHandle(pageHandle)
  )
  const pageProducts = pageSection?.products ?? []

  const requestedCollection = normalizeHandle(collectionHandle)
  const activeCollection = isLineCollectionHandle(requestedCollection)
    ? requestedCollection
    : ""
  const featuredPool = activeCollection
    ? pageProducts.filter(
        (product) =>
          normalizeHandle(product.collection?.handle) === activeCollection
      )
    : pageProducts

  const { featured } = splitFeaturedAndOlder(featuredPool, featuredHandle)

  const featuredPriced = featured?.id
    ? (await getProductsById({ ids: [featured.id], regionId: region.id }))[0]
    : null
  const featuredProduct = featuredPriced ?? featured

  const seenTabs = new Set<string>()
  const tabs = [
    { name: category.name, handle: pageHandle },
    ...sections.map((section) => ({
      name: section.name,
      handle: section.handle ?? "",
    })),
  ].filter((tab) => {
    const handle = normalizeHandle(tab.handle)
    if (!handle || handle === FUTURE_FORMS_HANDLE || seenTabs.has(handle)) {
      return false
    }
    seenTabs.add(handle)
    return true
  })

  const requestedView = normalizeHandle(viewHandle)
  const futureActive = requestedView === FUTURE_FORMS_HANDLE
  const catalogHandle = futureActive
    ? FUTURE_FORMS_HANDLE
    : requestedView &&
        tabs.some((tab) => normalizeHandle(tab.handle) === requestedView)
      ? requestedView
      : pageHandle
  const catalogSection =
    catalogHandle === pageHandle
      ? pageSection
      : sections.find(
          (section) => normalizeHandle(section.handle) === catalogHandle
        )
  const catalogProducts = futureActive ? [] : catalogSection?.products ?? []
  const collectionGroups = groupProductsByLineCollection(catalogProducts, {
    includeEmpty: true,
  })

  return (
    <div
      className="bg-white text-deepBlack pt-16 pb-24 min-h-screen"
      data-testid="category-container"
    >
      <Container>
        <div className="mb-10 flex flex-wrap items-baseline gap-3">
          {parents.map((parent) => (
            <span key={parent.id} className="font-mono text-xs text-neutral-400">
              <LocalizedClientLink
                className="hover:text-deepBlack transition-colors"
                href={`/categories/${parent.handle}`}
                data-testid="sort-by-link"
              >
                {parent.name}
              </LocalizedClientLink>
              <span className="mx-2">/</span>
            </span>
          ))}
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tighter text-balance"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>
        </div>

        {category.description && (
          <p className="mb-12 max-w-2xl text-neutral-600 text-pretty">
            {category.description}
          </p>
        )}

        {category.category_children && category.category_children.length > 0 && (
          <ul className="mb-12 flex flex-wrap gap-4">
            {category.category_children
              .filter((child) => !isLineCollectionHandle(child.handle))
              .map((child) => (
                <li key={child.id}>
                  <InteractiveLink href={`/categories/${child.handle}`}>
                    {child.name}
                  </InteractiveLink>
                </li>
              ))}
          </ul>
        )}

        {featuredProduct ? (
          <CategoryFeaturedProduct
            product={featuredProduct}
            region={region}
            className=""
          />
        ) : (
          <p className="font-mono text-sm text-neutral-500">
            {pageProducts.length === 0
              ? "No products in this category yet."
              : activeCollection
                ? `No featured product in ${lineCollectionLabel(activeCollection)} yet.`
                : "No products in this category yet."}
          </p>
        )}

        <PhysicalFormCategoryTabs
          tabs={tabs.map((tab) => ({
            ...tab,
            href: categoryPageHref({
              pageHandle,
              viewHandle: tab.handle,
              collectionHandle: activeCollection || undefined,
              hash: CATALOG_SCROLL_ID,
            }),
          }))}
          activeHandle={catalogHandle}
          showFuture
          scrollToCatalogOnClick
          futureHref={categoryPageHref({
            pageHandle,
            viewHandle: FUTURE_FORMS_HANDLE,
            collectionHandle: activeCollection || undefined,
            hash: CATALOG_SCROLL_ID,
          })}
        />

        <Suspense fallback={null}>
          <ScrollToCatalog />
        </Suspense>

        <section className="mt-12 md:mt-16" data-testid="products-list">
          <div
            id={CATALOG_SCROLL_ID}
            className="scroll-mt-[10.5rem] space-y-16 md:space-y-20"
          >
            {collectionGroups.map((group) => (
                <div
                  key={group.id}
                  id={group.handle ? `line-${group.handle}` : undefined}
                >
                  <div className="mb-6 flex items-baseline justify-between gap-3">
                    {group.handle && catalogHandle === pageHandle ? (
                      <LocalizedClientLink
                        href={categoryPageHref({
                          pageHandle,
                          collectionHandle: group.handle,
                        })}
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
                      {group.products.map((product) => {
                        const cardProps = buildPhysicalProductCardProps(product)
                        if (!cardProps) return null
                        return (
                          <li key={product.id}>
                            <PhysicalProductCard
                              {...cardProps}
                              compact
                              isLatest={isLatestInGroup(
                                product,
                                catalogProducts
                              )}
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
          </div>
        </section>
      </Container>
    </div>
  )
}
