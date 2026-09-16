import { Metadata } from "next"
import CartTemplate from "@modules/cart/templates"

import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { buildPageMetadata } from "@lib/seo/metadata"
import { getGlobalSeoSettings, getStaticPageSeoFields } from "@lib/seo/sanity"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

export async function generateMetadata(): Promise<Metadata> {
  const [global, seo] = await Promise.all([
    getGlobalSeoSettings(),
    getStaticPageSeoFields("cart"),
  ])

  return buildPageMetadata(
    {
      title: seo?.seoTitle ?? "Cart | XYZ London",
      description:
        seo?.seoDescription ??
        "Review items in your XYZ London cart before checkout.",
      path: "/cart",
      noIndex: true,
    },
    global
  )
}

const fetchCart = async () => {
  const cart = await retrieveCart()

  if (!cart) {
    return null
  }

  let finalCart = cart
  if (finalCart?.items?.length) {
    const enrichedItems = await enrichLineItems(finalCart?.items, finalCart?.region_id!)
    finalCart = { ...finalCart, items: enrichedItems as HttpTypes.StoreCartLineItem[] }
  }

  return finalCart
}

export default async function Cart() {
  const cart = await fetchCart()
  const customer = await getCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
