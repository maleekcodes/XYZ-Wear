import { Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { CATALOG_ENGAGEMENT_MODULE } from "../modules/catalog-engagement"
import { EmailTemplates } from "../modules/email-notifications/templates"

export default async function catalogRestockAlerts(container: MedusaContainer) {
  const productService = container.resolve(Modules.PRODUCT) as any
  const engagement = container.resolve(CATALOG_ENGAGEMENT_MODULE) as any
  const notification = container.resolve(Modules.NOTIFICATION) as any
  const { products } = await productService.listAndCountProducts({}, { relations: ["variants"] })

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      if (variant.manage_inventory !== false && (variant.inventory_quantity ?? 0) <= 0) continue
      const subscriptions = await engagement.listActiveSubscriptions({
        kind: "restock",
        product_id: product.id,
        variant_id: variant.id,
      })
      for (const subscription of subscriptions) {
        try {
          await notification.createNotifications({
            to: subscription.email,
            channel: "email",
            template: EmailTemplates.RESTOCK_AVAILABLE,
            data: {
              kind: "restock",
              productName: product.title,
              emailOptions: { subject: `${product.title} is back in stock` },
            },
          })
          await engagement.updateCatalogSubscriptions({ id: subscription.id, status: "notified", notified_at: new Date() })
        } catch (error) {
          console.error("Restock notification failed", subscription.email, error)
        }
      }
    }
  }
}

export const config = {
  name: "catalog-restock-alerts",
  schedule: "*/15 * * * *",
}
