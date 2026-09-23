import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block h-10 w-32 animate-pulse bg-concrete" />
  }

  return (
    <div className="text-deepBlack">
      <div className="flex items-baseline gap-x-2 whitespace-nowrap">
        {!variant && (
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            From
          </span>
        )}
        <span
          className={clx(
            "text-xl font-semibold tracking-tight tabular-nums",
            selectedPrice.price_type === "sale"
              ? "text-red-600"
              : "text-deepBlack"
          )}
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
        {selectedPrice.price_type === "sale" && (
          <span
            className="text-base font-medium tracking-tight text-neutral-400 line-through tabular-nums"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
        )}
        {selectedPrice.price_type === "sale" && (
          <span className="text-xs font-mono text-red-600">
            ({selectedPrice.percentage_diff}% off)
          </span>
        )}
      </div>
    </div>
  )
}
