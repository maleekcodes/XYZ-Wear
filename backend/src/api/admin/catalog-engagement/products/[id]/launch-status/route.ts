import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { CATALOG_ENGAGEMENT_MODULE } from "../../../../../../modules/catalog-engagement"
import { EmailTemplates } from "../../../../../../modules/email-notifications/templates"
import { STOREFRONT_URL } from "../../../../../../lib/constants"

type Body = {
  status?: "coming_soon" | "pre_order" | "available"
  pre_order_enabled?: boolean
  pre_order_opening_date?: string | null
  pre_order_closing_date?: string | null
  pre_order_dispatch_date?: string | null
  pre_order_customer_notifications?: boolean
  promotion_percentage?: string | number | null
}

export async function POST(
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse
) {
  const body = req.body ?? {}
  const status = body.status
  if (!status) return res.status(400).json({ message: "status is required" })

  const productService = req.scope.resolve(Modules.PRODUCT) as any
  const product = await productService.retrieveProduct(req.params.id, {
    relations: ["variants", "variants.prices"],
  })
  const previousStatus = product.metadata?.launch_status
  const promotionPercentage = body.promotion_percentage == null || body.promotion_percentage === ""
    ? null
    : Number(body.promotion_percentage)
  if (promotionPercentage !== null && (!Number.isInteger(promotionPercentage) || promotionPercentage < 0 || promotionPercentage > 99)) {
    return res.status(400).json({ message: "Discount percentage must be a whole number from 0 to 99" })
  }
  const metadata = {
    ...(product.metadata ?? {}),
    launch_status: status,
    coming_soon: status === "coming_soon",
    pre_order_enabled: bodyBoolean(body.pre_order_enabled, product.metadata?.pre_order_enabled ?? false),
    pre_order_opening_date: body.pre_order_opening_date ?? product.metadata?.pre_order_opening_date ?? null,
    pre_order_closing_date: body.pre_order_closing_date ?? product.metadata?.pre_order_closing_date ?? null,
    pre_order_dispatch_date: body.pre_order_dispatch_date ?? product.metadata?.pre_order_dispatch_date ?? null,
    pre_order_customer_notifications: bodyBoolean(body.pre_order_customer_notifications, product.metadata?.pre_order_customer_notifications ?? true),
    promotion_percentage: promotionPercentage,
    promotion_price: null,
    promotion_original_price: null,
    promotion_discount_label: null,
  }
  await syncProductSalePriceList(req, product, promotionPercentage)
  const updated = await productService.updateProducts(req.params.id, { metadata })

  const variantPrices = (product.variants ?? [])
    .flatMap((variant: any) => variant.prices ?? [])
    .map((price: any) => Number(price.amount))
    .filter((amount: number) => Number.isFinite(amount))
  const lowestPrice = variantPrices.length ? Math.min(...variantPrices) : null
  const currencyCode = product.variants?.[0]?.prices?.[0]?.currency_code ?? "gbp"
  const price = lowestPrice === null
    ? undefined
    : new Intl.NumberFormat("en-GB", { style: "currency", currency: currencyCode.toUpperCase() }).format(lowestPrice / 100)
  const productUrl = product.handle
    ? `${STOREFRONT_URL.replace(/\/$/, "")}/products/${encodeURIComponent(product.handle)}`
    : undefined

  let notified = 0
  if (status === "pre_order" && previousStatus !== "pre_order") {
    const engagement = req.scope.resolve(CATALOG_ENGAGEMENT_MODULE) as any
    const notification = req.scope.resolve(Modules.NOTIFICATION) as any
    const subscriptions = await engagement.listActiveSubscriptions({
      kind: "waitlist",
      product_id: product.id,
    })

    for (const subscription of subscriptions) {
      try {
        await notification.createNotifications({
          to: subscription.email,
          channel: "email",
          template: EmailTemplates.WAITLIST_AVAILABLE,
          data: {
            kind: "waitlist",
            productName: product.title,
            imageUrl: product.thumbnail ?? undefined,
            price,
            productUrl,
            emailOptions: { subject: `${product.title} is ready to pre-order` },
          },
        })
        await engagement.updateCatalogSubscriptions({
          id: subscription.id,
          status: "notified",
          notified_at: new Date(),
        })
        notified += 1
      } catch (error) {
        console.error("Waitlist notification failed", subscription.email, error)
      }
    }
  }

  return res.json({ product: updated, waitlist_matched: notified })
}

async function syncProductSalePriceList(req: AuthenticatedMedusaRequest<Body>, product: any, percentage: number | null) {
  const pricing = req.scope.resolve(Modules.PRICING) as any
  const remoteLink = req.scope.resolve(ContainerRegistrationKeys.LINK) as any
  const title = `Product sale ${product.id}`
  const existing = await pricing.listPriceLists({ q: title }, { take: 100, relations: ["prices"] })
  const priceList = existing.find((entry: any) => entry.metadata?.product_id === product.id)

  if (percentage === null || percentage === 0) {
    if (priceList) {
      await pricing.updatePriceLists([{ id: priceList.id, status: "draft" }])
    }
    return
  }

  const variantIds = (product.variants ?? []).map((variant: any) => variant.id)
  const variantPriceSetLinks = variantIds.length
    ? await remoteLink.getLinkModule(Modules.PRODUCT, "variant_id", Modules.PRICING, "price_set_id").list(
      { variant_id: variantIds },
      { select: ["variant_id", "price_set_id"] }
    )
    : []
  const priceSetIds = variantPriceSetLinks.map((link: any) => link.price_set_id)
  const priceSets = priceSetIds.length
    ? await pricing.listPriceSets({ id: priceSetIds }, { relations: ["prices"] })
    : []
  const priceSetByVariantId = new Map(variantPriceSetLinks.map((link: any) => [link.variant_id, link.price_set_id]))
  const priceSetById = new Map(priceSets.map((priceSet: any) => [priceSet.id, priceSet]))
  const prices = (product.variants ?? []).flatMap((variant: any) => {
    const priceSetId = priceSetByVariantId.get(variant.id)
    const priceSet: any = priceSetId ? priceSetById.get(priceSetId) : null
    const basePrices = priceSet?.prices ?? variant.prices ?? []
    return basePrices
      .filter((price: any) => Number.isFinite(Number(price.amount)) && Number(price.amount) > 0)
      .map((price: any) => ({
        price_set_id: priceSetId,
        currency_code: price.currency_code,
        amount: Math.round(Number(price.amount) * (100 - percentage) / 100),
      }))
      .filter((price: any) => !!price.price_set_id)
  })

  if (!prices.length) {
    throw new Error("Cannot apply the sale because this product has no priced variants")
  }

  if (priceList) {
    const oldPrices = priceList.prices ?? []
    if (oldPrices.length) {
      await pricing.updatePriceListPrices([{
        price_list_id: priceList.id,
        prices: prices.map((price: any) => {
          const existing = oldPrices.find((entry: any) => entry.price_set_id === price.price_set_id && entry.currency_code === price.currency_code)
          return existing ? { id: existing.id, amount: price.amount } : { ...price }
        }),
      }])
      const stale = oldPrices.filter((entry: any) => !prices.some((price: any) => price.price_set_id === entry.price_set_id && price.currency_code === entry.currency_code))
      if (stale.length) await pricing.removePrices(stale.map((price: any) => price.id))
    } else {
      await pricing.addPriceListPrices([{ price_list_id: priceList.id, prices }])
    }
    await pricing.updatePriceLists([{ id: priceList.id, status: "active", metadata: { product_id: product.id, promotion_percentage: percentage } }])
    return
  }

  await pricing.createPriceLists([{
    title,
    description: `Automatic ${percentage}% sale for ${product.title}`,
    type: "sale",
    status: "active",
    metadata: { product_id: product.id, promotion_percentage: percentage },
    prices,
  }])
}

function bodyBoolean(value: boolean | undefined, fallback: unknown) {
  return typeof value === "boolean" ? value : String(fallback) === "true"
}
