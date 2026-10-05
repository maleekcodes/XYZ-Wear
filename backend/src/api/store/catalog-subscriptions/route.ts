import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { CATALOG_ENGAGEMENT_MODULE } from "../../../modules/catalog-engagement"

type SubscriptionBody = {
  email?: string
  kind?: "waitlist" | "restock" | "launch"
  product_id?: string
  variant_id?: string | null
  source?: "physical" | "digital" | "homepage"
}

function cleanEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

export async function POST(
  req: MedusaRequest<SubscriptionBody>,
  res: MedusaResponse
) {
  const body = req.body ?? {}
  const email = cleanEmail(body.email)
  const kind = body.kind
  const productId =
    typeof body.product_id === "string" ? body.product_id.trim() || null : null
  const source = body.source

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A valid email is required"
    )
  }
  if (kind !== "waitlist" && kind !== "restock" && kind !== "launch") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Invalid subscription type"
    )
  }
  if (
    kind === "launch"
      ? source !== "homepage" || !!productId || !!body.variant_id
      : !productId || (source !== "physical" && source !== "digital")
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Product and source are required"
    )
  }

  const service = req.scope.resolve(CATALOG_ENGAGEMENT_MODULE) as any
  const variantId =
    typeof body.variant_id === "string" ? body.variant_id.trim() || null : null
  const existing = await service.findActiveSubscription({
    email,
    kind,
    product_id: productId,
    variant_id: variantId,
  })

  if (existing) {
    return res
      .status(200)
      .json({ subscription: existing, already_subscribed: true })
  }

  const subscription = await service.createCatalogSubscriptions({
    email,
    kind,
    product_id: productId,
    variant_id: variantId,
    source,
    status: "subscribed",
  })

  return res.status(201).json({ subscription, already_subscribed: false })
}
