import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PhysicalFormStoreTemplate from "./physical-form-store"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  categoryHandle,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categoryHandle?: string
}) => {
  return (
    <PhysicalFormStoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      categoryHandle={categoryHandle}
    />
  )
}

export default StoreTemplate
