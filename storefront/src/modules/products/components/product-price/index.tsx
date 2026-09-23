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
  const promotionPrice = typeof product.metadata?.promotion_price === "string" ? product.metadata.promotion_price : null
  const promotionOriginal = typeof product.metadata?.promotion_original_price === "string" ? product.metadata.promotion_original_price : null
  const promotionLabel = typeof product.metadata?.promotion_discount_label === "string" ? product.metadata.promotion_discount_label : null

  if (!selectedPrice) {
    return <div className="block h-10 w-32 animate-pulse bg-concrete" />
  }

  return (
    <div className="flex flex-col gap-1 text-deepBlack">
      {promotionPrice && promotionOriginal ? (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-semibold tracking-tight text-red-600" data-testid="promotion-price">{promotionPrice}</span>
          {promotionLabel ? <span className="text-base text-red-600">({promotionLabel})</span> : null}
          <span className="text-sm text-neutral-400 line-through">{promotionOriginal}</span>
        </div>
      ) : null}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {!variant && (
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            From
          </span>
        )}
        <span
          className={clx(
            "text-2xl font-semibold tracking-tight tabular-nums",
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
            className="text-sm text-neutral-400 line-through tabular-nums"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
        )}
      </div>
      {selectedPrice.price_type === "sale" && (
        <span className="text-xs font-mono text-neutral-500">
          Save {selectedPrice.percentage_diff}%
        </span>
      )}
    </div>
  )
}
