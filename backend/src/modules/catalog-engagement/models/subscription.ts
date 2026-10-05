import { model } from "@medusajs/framework/utils"

const CatalogSubscription = model.define("catalog_subscription", {
  id: model.id().primaryKey(),
  email: model.text(),
  kind: model.enum(["waitlist", "restock", "launch"]),
  product_id: model.text().nullable(),
  variant_id: model.text().nullable(),
  source: model.enum(["physical", "digital", "homepage"]),
  status: model.enum(["subscribed", "notified", "unsubscribed"]),
  notified_at: model.dateTime().nullable(),
})

export default CatalogSubscription
