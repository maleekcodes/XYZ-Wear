"use client"

import { taglineForAppearance } from "@lib/util/physical-product-copy"
import { HttpTypes } from "@medusajs/types"

import { useProductColor } from "@modules/products/components/product-color-context"

export default function ProductTagline({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const colorCtx = useProductColor()
  const tagline = taglineForAppearance(
    product,
    colorCtx?.color ?? colorCtx?.colors[0]
  )
  if (!tagline) return null
  return <p data-testid="product-tagline">{tagline}</p>
}
