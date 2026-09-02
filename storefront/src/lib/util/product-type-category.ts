import { isLineCollectionHandle } from "@lib/util/line-collections"
import { HttpTypes } from "@medusajs/types"

/** Product type category (Tees, Caps, …), not an X/Y/Z line. */
export function productTypeCategory(product: HttpTypes.StoreProduct) {
  return (product.categories ?? []).find(
    (category) => category?.handle && !isLineCollectionHandle(category.handle)
  )
}
