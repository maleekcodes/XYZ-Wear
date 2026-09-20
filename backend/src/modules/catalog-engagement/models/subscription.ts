import { model } from "@medusajs/framework/utils"

const CatalogSubscription = model.define("catalog_subscription", {
  id: model.id().primaryKey(),
  email: model.text(),
  kind: model.enum(["waitlist", "restock"]),
  product_id: model.text(),
  variant_id: model.text().nullable(),
  source: model.enum(["physical", "digital"]),
  status: model.enum(["subscribed", "notified", "unsubscribed"]),
  notified_at: model.dateTime().nullable(),
})

export default CatalogSubscription
