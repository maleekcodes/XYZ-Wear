import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CATALOG_ENGAGEMENT_MODULE } from "../../../../modules/catalog-engagement"
import { EmailTemplates } from "../../../../modules/email-notifications/templates"

type Body = {
  kind?: "waitlist" | "restock"
  product_id?: string
  variant_id?: string | null
  product_name?: string
  product_url?: string
  image_url?: string
}

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  const { kind, product_id, variant_id, product_name, product_url, image_url } = req.body ?? {}
  if (!kind || !product_id || !product_name) {
    return res.status(400).json({ message: "kind, product_id, and product_name are required" })
  }

  const engagement = req.scope.resolve(CATALOG_ENGAGEMENT_MODULE) as any
  const notification = req.scope.resolve(Modules.NOTIFICATION) as any
  const subscriptions = await engagement.listActiveSubscriptions({ kind, product_id, variant_id })
  const template = kind === "waitlist" ? EmailTemplates.WAITLIST_AVAILABLE : EmailTemplates.RESTOCK_AVAILABLE
  let sent = 0

  for (const subscription of subscriptions) {
    try {
      await notification.createNotifications({
        to: subscription.email,
        channel: "email",
        template,
        data: {
          kind,
          productName: product_name,
          productUrl: product_url,
          imageUrl: image_url,
          emailOptions: { subject: kind === "waitlist" ? `${product_name} is ready to pre-order` : `${product_name} is back in stock` },
        },
      })
      await engagement.updateCatalogSubscriptions({ id: subscription.id, status: "notified", notified_at: new Date() })
      sent += 1
    } catch (error) {
      console.error("Catalog notification failed", subscription.email, error)
    }
  }

  return res.json({ matched: subscriptions.length, sent })
}
