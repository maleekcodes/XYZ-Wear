"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { getAuthHeaders } from "./cookies"

export const retrieveOrder = cache(async function (id: string) {
  const headers = await getAuthHeaders()
  return sdk.store.order
    .retrieve(
      id,
      {
        fields:
          "*payment_collections.payments,*items.variant.images,*items.variant.product.images,*items.variant.product.thumbnail",
      },
      { cache: "no-store", next: { tags: ["order"] }, ...headers }
    )
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0
) {
  const headers = await getAuthHeaders()
  return sdk.store.order
    .list(
      {
        limit,
        offset,
        fields:
          "*items.variant.images,*items.variant.product.images,*items.variant.product.thumbnail",
      },
      { cache: "no-store", next: { tags: ["order"] }, ...headers }
    )
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
})
