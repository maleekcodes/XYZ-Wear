import { HttpTypes } from "@medusajs/types"

import {
  getPhysicalStoreCatalogProducts,
  getProductsById,
} from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  isLineCollectionHandle,
  normalizeHandle,
} from "@lib/util/line-collections"
import { Container } from "@modules/common/components/xyz/Container"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PhysicalProductCard } from "@modules/store/components/physical-product-card"
import { buildPhysicalProductCardProps } from "@modules/store/lib/build-physical-product-card-props"
import { isLatestInGroup } from "@modules/store/lib/group-products-by-category"
import { groupProductsByLineCollection } from "@modules/store/lib/group-products-by-collection"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

function similarCategory(product: HttpTypes.StoreProduct) {
  const assigned = (product.categories ?? []).filter(Boolean)
  return (
    assigned.find(
      (category) =>
        !isLineCollectionHandle(category.handle) &&
        !isLineCollectionHandle(category.name)
    ) ?? assigned[0]
  )
}

function sharesCategory(
  product: HttpTypes.StoreProduct,
  categoryId: string
): boolean {
  return (product.categories ?? []).some((category) => category.id === categoryId)
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const category = similarCategory(product)
  const currentLine = normalizeHandle(product.collection?.handle)
  const catalog = await getPhysicalStoreCatalogProducts({
    sortBy: "created_at",
    countryCode,
  })

  const candidates = catalog.filter((item) => {
    if (!item.id || item.id === product.id) return false
    if (category?.id) return sharesCategory(item, category.id)
    if (product.collection_id) {
      return item.collection_id === product.collection_id
    }
    return true
  })

  const ids = candidates.map((item) => item.id).filter(Boolean) as string[]
  const pricedProducts =
    ids.length > 0
      ? await getProductsById({ ids, regionId: region.id })
      : []
  const pricedById = new Map(pricedProducts.map((item) => [item.id, item]))
  const similar = candidates.map(
    (item) => (item.id ? pricedById.get(item.id) : null) ?? item
  )

  const groups = groupProductsByLineCollection(similar, {
    includeEmpty: true,
  }).filter((group) => {
    if (group.products.length > 0) return true
    return normalizeHandle(group.handle) !== currentLine
  })

  if (groups.length === 0) {
    return null
  }

  return (
    <Container data-testid="similar-items">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
        <h2 className="text-3xl font-bold tracking-tighter text-deepBlack md:text-4xl">
          Similar items
        </h2>
        {category?.handle && (
          <LocalizedClientLink
            href={`/categories/${category.handle}`}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400 hover:text-deepBlack transition-colors"
          >
            Shop {category.name}
          </LocalizedClientLink>
        )}
      </div>

      <div className="space-y-12 md:space-y-16">
        {groups.map((group) => (
          <div key={group.id}>
            <div className="mb-5 flex items-baseline justify-between gap-3">
              {group.handle && category?.handle ? (
                <LocalizedClientLink
                  href={`/categories/${category.handle}?collection=${group.handle}`}
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
                {group.products.map((item) => {
                  const cardProps = buildPhysicalProductCardProps(item)
                  if (!cardProps) return null
                  return (
                    <li key={item.id}>
                      <PhysicalProductCard
                        {...cardProps}
                        compact
                        isLatest={isLatestInGroup(item, similar)}
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
    </Container>
  )
}
