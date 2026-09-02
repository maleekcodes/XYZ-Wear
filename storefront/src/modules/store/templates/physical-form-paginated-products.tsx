import { listCategories } from "@lib/data/categories"
import {
  getPhysicalStoreCatalogProducts,
  getProductsById,
} from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { normalizeHandle } from "@lib/util/line-collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  FUTURE_FORMS_HANDLE,
  PhysicalFormCategoryTabs,
} from "@modules/store/components/physical-form-category-tabs"
import { PhysicalFutureForms } from "@modules/store/components/physical-future-forms"
import { PhysicalProductCard } from "@modules/store/components/physical-product-card"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { buildPhysicalProductCardProps } from "@modules/store/lib/build-physical-product-card-props"
import {
  groupProductsByAssignedCategory,
  isLatestInGroup,
  listComingSoonCategories,
  pinLatestProducts,
  type ComingSoonCategory,
  type PhysicalCategorySection,
} from "@modules/store/lib/group-products-by-category"
import { groupProductsByLineCollection } from "@modules/store/lib/group-products-by-collection"

function catalogTabs(
  sections: PhysicalCategorySection[],
  comingSoon: ComingSoonCategory[]
) {
  const tabs: { name: string; handle: string }[] = [
    { name: "All", handle: "all" },
  ]

  for (const section of sections) {
    if (!section.handle) continue
    tabs.push({ name: section.name, handle: section.handle })
  }

  for (const category of comingSoon) {
    if (!category.handle) continue
    if (tabs.some((tab) => tab.handle === category.handle)) continue
    tabs.push({ name: category.name, handle: category.handle })
  }

  return tabs
}

function CollectionCatalog({
  section,
}: {
  section: PhysicalCategorySection
}) {
  return (
    <section
      id={section.handle ? `physical-cat-${section.handle}` : undefined}
      aria-labelledby={`cat-${section.id}`}
      className="scroll-mt-40"
    >
      <h2
        id={`cat-${section.id}`}
        className="mb-10 text-3xl font-bold tracking-tighter text-deepBlack md:text-4xl"
      >
        {section.handle ? (
          <LocalizedClientLink
            href={`/categories/${section.handle}`}
            className="hover:opacity-70 transition-opacity"
          >
            {section.name}
          </LocalizedClientLink>
        ) : (
          section.name
        )}
      </h2>

      <div className="space-y-12 md:space-y-16">
        {groupProductsByLineCollection(section.products, {
          includeEmpty: true,
        }).map((group) => (
          <div key={group.id}>
            <div className="mb-5 flex items-baseline justify-between gap-3">
              {group.handle && section.handle ? (
                <LocalizedClientLink
                  href={`/categories/${section.handle}?collection=${group.handle}`}
                  className="text-lg font-bold tracking-tight text-deepBlack hover:opacity-70 transition-opacity"
                >
                  {group.title}
                </LocalizedClientLink>
              ) : (
                <span className="text-lg font-bold tracking-tight text-deepBlack">
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
                        isLatest={isLatestInGroup(product, group.products)}
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
  )
}

export default async function PhysicalFormPaginatedProducts({
  sortBy,
  countryCode,
  categoryHandle,
}: {
  sortBy?: SortOptions
  countryCode: string
  categoryHandle?: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const [sorted, allCategories] = await Promise.all([
    getPhysicalStoreCatalogProducts({
      sortBy: sortBy ?? "created_at",
      countryCode,
    }),
    listCategories(),
  ])

  const ids = sorted.map((p) => p.id).filter(Boolean) as string[]
  const pricedProducts =
    ids.length > 0
      ? await getProductsById({ ids, regionId: region.id })
      : []
  const pricedById = new Map(pricedProducts.map((p) => [p.id, p]))

  const enriched = sorted
    .map((p) => (p.id ? pricedById.get(p.id) : null) ?? p)
    .filter(Boolean) as typeof pricedProducts

  const sections = groupProductsByAssignedCategory(enriched, allCategories).map(
    (section) => ({
      ...section,
      products: pinLatestProducts(section.products),
    })
  )
  const comingSoon = listComingSoonCategories(allCategories, sections)
  const tabs = catalogTabs(sections, comingSoon)
  const requested = normalizeHandle(categoryHandle)
  const futureActive = requested === FUTURE_FORMS_HANDLE
  const showAll = !requested || requested === "all"
  const requestedSection = sections.find(
    (section) => section.handle === requested
  )
  const requestedComingSoon = comingSoon.find(
    (category) => category.handle === requested
  )

  const comingSoonAsSections: PhysicalCategorySection[] = comingSoon.map(
    (category) => ({
      id: category.id,
      name: category.name,
      handle: category.handle,
      products: [],
    })
  )

  const visibleSections = futureActive
    ? []
    : showAll
      ? [...sections, ...comingSoonAsSections]
      : requestedSection
        ? [requestedSection]
        : []

  const emptyCategory =
    !futureActive &&
    !showAll &&
    !requestedSection &&
    requestedComingSoon
      ? {
          id: requestedComingSoon.id,
          name: requestedComingSoon.name,
          handle: requestedComingSoon.handle,
          products: [],
        }
      : null

  const activeHandle = futureActive
    ? FUTURE_FORMS_HANDLE
    : showAll
      ? "all"
      : requestedSection?.handle ??
        requestedComingSoon?.handle ??
        "all"

  const hasCatalog = sections.length > 0 || comingSoon.length > 0

  return (
    <div className="space-y-16 md:space-y-20" data-testid="products-list">
      <PhysicalFormCategoryTabs
        tabs={tabs}
        activeHandle={activeHandle}
        showFuture
        scrollSpy={showAll && !futureActive}
      />

      {futureActive ? (
        <PhysicalFutureForms items={comingSoon} />
      ) : (
        <>
          {hasCatalog ? (
            <div className="space-y-20 md:space-y-24">
              {visibleSections.map((section) => (
                <CollectionCatalog key={section.id} section={section} />
              ))}
              {emptyCategory && <CollectionCatalog section={emptyCategory} />}
            </div>
          ) : (
            <p className="font-mono text-sm text-neutral-500">
              No products in this catalog yet.
            </p>
          )}
          <PhysicalFutureForms items={comingSoon} />
        </>
      )}
    </div>
  )
}
