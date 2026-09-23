import { HttpTypes } from "@medusajs/types"
import { getPercentageDiff } from "./get-precentage-diff"
import { convertToLocale } from "./money"

export const getPricesForVariant = (variant: any, promotionPercentage?: number) => {
  if (!variant?.calculated_price?.calculated_amount) {
    return null
  }

  const originalAmount = promotionPercentage
    ? variant.calculated_price.original_amount ?? variant.calculated_price.calculated_amount
    : variant.calculated_price.calculated_amount
  const promotedAmount = promotionPercentage && promotionPercentage > 0 && promotionPercentage < 100
    ? Math.round(originalAmount * (100 - promotionPercentage) / 100)
    : originalAmount

  return {
    calculated_price_number: promotedAmount,
    calculated_price: convertToLocale({
      amount: promotedAmount,
      currency_code: variant.calculated_price.currency_code,
    }),
    original_price_number: promotionPercentage ? originalAmount : variant.calculated_price.original_amount,
    original_price: convertToLocale({
      amount: promotionPercentage ? originalAmount : variant.calculated_price.original_amount,
      currency_code: variant.calculated_price.currency_code,
    }),
    currency_code: variant.calculated_price.currency_code,
    price_type: promotionPercentage ? "sale" : variant.calculated_price.calculated_price.price_list_type,
    percentage_diff: getPercentageDiff(
      promotionPercentage ? originalAmount : variant.calculated_price.original_amount,
      promotedAmount
    ),
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) {
  if (!product || !product.id) {
    throw new Error("No product provided")
  }

  const cheapestPrice = () => {
    if (!product || !product.variants?.length) {
      return null
    }

    const cheapestVariant: any = product.variants
      .filter((v: any) => !!v.calculated_price)
      .sort((a: any, b: any) => {
        return (
          a.calculated_price.calculated_amount -
          b.calculated_price.calculated_amount
        )
      })[0]

    return getPricesForVariant(cheapestVariant, readPromotionPercentage(product.metadata))
  }

  const variantPrice = () => {
    if (!product || !variantId) {
      return null
    }

    const variant: any = product.variants?.find(
      (v) => v.id === variantId || v.sku === variantId
    )

    if (!variant) {
      return null
    }

    return getPricesForVariant(variant, readPromotionPercentage(product.metadata))
  }

  return {
    product,
    cheapestPrice: cheapestPrice(),
    variantPrice: variantPrice(),
  }
}

function readPromotionPercentage(metadata: HttpTypes.StoreProduct["metadata"]): number | undefined {
  const value = Number(metadata?.promotion_percentage)
  return Number.isInteger(value) && value > 0 && value < 100 ? value : undefined
}
