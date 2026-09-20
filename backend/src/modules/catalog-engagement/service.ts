import { MedusaService } from "@medusajs/framework/utils"
import CatalogSubscription from "./models/subscription"

class CatalogEngagementModuleService extends MedusaService({
  CatalogSubscription,
}) {
  async findActiveSubscription(input: {
    email: string
    kind: "waitlist" | "restock"
    product_id: string
    variant_id?: string | null
  }) {
    const rows = await this.listCatalogSubscriptions({
      email: input.email,
      kind: input.kind,
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      status: "subscribed",
    })
    return rows[0] ?? null
  }

  async listActiveSubscriptions(input: {
    kind: "waitlist" | "restock"
    product_id: string
    variant_id?: string | null
  }) {
    return this.listCatalogSubscriptions({
      kind: input.kind,
      product_id: input.product_id,
      ...(input.variant_id ? { variant_id: input.variant_id } : {}),
      status: "subscribed",
    })
  }
}

export default CatalogEngagementModuleService
