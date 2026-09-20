import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CATALOG_ENGAGEMENT_MODULE } from "../../../../../../modules/catalog-engagement"
import { EmailTemplates } from "../../../../../../modules/email-notifications/templates"

type Body = { status?: "coming_soon" | "pre_order" | "available" }

export async function POST(
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse
) {
  const status = req.body?.status
  if (!status) return res.status(400).json({ message: "status is required" })

  const productService = req.scope.resolve(Modules.PRODUCT) as any
  const product = await productService.retrieveProduct(req.params.id)
  const previousStatus = product.metadata?.launch_status
  const metadata = { ...(product.metadata ?? {}), launch_status: status, coming_soon: status === "coming_soon" }
  const updated = await productService.updateProducts(req.params.id, { metadata })

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
