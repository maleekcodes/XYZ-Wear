import { Suspense } from "react"

import { Container } from "@modules/common/components/xyz/Container"
import { PhysicalFormStoreHero } from "@modules/store/components/physical-form-store-hero"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

import PhysicalFormPaginatedProducts from "./physical-form-paginated-products"

const PhysicalFormStoreTemplate = async ({
  sortBy,
  countryCode,
  categoryHandle,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categoryHandle?: string
}) => {
  const sort = sortBy || "created_at"

  return (
    <div
      className="pt-16 pb-24 bg-white text-deepBlack min-h-screen"
      data-testid="category-container"
    >
      <Container>
        <PhysicalFormStoreHero />

        <section>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PhysicalFormPaginatedProducts
              sortBy={sort}
              countryCode={countryCode}
              categoryHandle={categoryHandle}
            />
          </Suspense>
        </section>
      </Container>
    </div>
  )
}

export default PhysicalFormStoreTemplate
