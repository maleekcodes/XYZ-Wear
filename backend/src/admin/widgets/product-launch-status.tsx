import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Label, Select, Text, toast } from "@medusajs/ui"
import { useState } from "react"

const ProductLaunchStatusWidget = ({ data }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const current = String(data.metadata?.launch_status ?? "available")
  const [status, setStatus] = useState(current)
  const metadata = data.metadata ?? {}
  const [preOrderEnabled, setPreOrderEnabled] = useState(String(metadata.pre_order_enabled ?? "false") === "true")
  const [openingDate, setOpeningDate] = useState(String(metadata.pre_order_opening_date ?? ""))
  const [closingDate, setClosingDate] = useState(String(metadata.pre_order_closing_date ?? ""))
  const [dispatchDate, setDispatchDate] = useState(String(metadata.pre_order_dispatch_date ?? ""))
  const [notificationsEnabled, setNotificationsEnabled] = useState(String(metadata.pre_order_customer_notifications ?? "true") !== "false")
  const [saving, setSaving] = useState(false)
  const [promotionPrice, setPromotionPrice] = useState(String(metadata.promotion_price ?? ""))
  const [promotionOriginalPrice, setPromotionOriginalPrice] = useState(String(metadata.promotion_original_price ?? ""))
  const [promotionDiscountLabel, setPromotionDiscountLabel] = useState(String(metadata.promotion_discount_label ?? ""))

  async function save() {
    setSaving(true)
    try {
      const response = await fetch(`/admin/catalog-engagement/products/${data.id}/launch-status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          pre_order_enabled: preOrderEnabled,
          pre_order_opening_date: openingDate || null,
          pre_order_closing_date: closingDate || null,
          pre_order_dispatch_date: dispatchDate || null,
          pre_order_customer_notifications: notificationsEnabled,
          promotion_price: promotionPrice || null,
          promotion_original_price: promotionOriginalPrice || null,
          promotion_discount_label: promotionDiscountLabel || null,
        }),
      })
      if (!response.ok) throw new Error("Could not update launch status")
      toast.success("Launch status updated")
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update launch status")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="p-6">
      <Heading level="h2">Launch status</Heading>
      <Text className="mb-4 mt-1 text-ui-fg-subtle">Controls Coming Soon, Pre-Order, and availability messaging.</Text>
      <div className="flex items-end gap-3">
        <Select value={status} onValueChange={setStatus}>
          <Select.Trigger className="w-56"><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="coming_soon">Coming Soon</Select.Item>
            <Select.Item value="pre_order">Pre-Order</Select.Item>
            <Select.Item value="available">Available</Select.Item>
          </Select.Content>
        </Select>
        <Button onClick={() => void save()} disabled={saving}>{saving ? "Saving" : "Save status"}</Button>
      </div>
      {status === "pre_order" ? <div className="mt-6 grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={preOrderEnabled} onChange={(event) => setPreOrderEnabled(event.target.checked)} />
          Pre-order enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={notificationsEnabled} onChange={(event) => setNotificationsEnabled(event.target.checked)} />
          Customer notifications enabled
        </label>
        <div><Label>Pre-order opening date</Label><Input type="datetime-local" value={openingDate} onChange={(event) => setOpeningDate(event.target.value)} /></div>
        <div><Label>Pre-order closing date</Label><Input type="datetime-local" value={closingDate} onChange={(event) => setClosingDate(event.target.value)} /></div>
        <div className="col-span-2"><Label>Estimated dispatch date or range</Label><Input placeholder="15–30 November 2026" value={dispatchDate} onChange={(event) => setDispatchDate(event.target.value)} /></div>
      </div> : null}
      <div className="mt-6 border-t border-ui-border-base pt-6">
        <Heading level="h3">Promotion price</Heading>
        <Text className="mb-4 mt-1 text-ui-fg-subtle">Set a temporary product sale display in one place. Leave blank to use the normal price.</Text>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Promotion price</Label><Input placeholder="£272.11" value={promotionPrice} onChange={(event) => setPromotionPrice(event.target.value)} /></div>
          <div><Label>Original price</Label><Input placeholder="£453.51" value={promotionOriginalPrice} onChange={(event) => setPromotionOriginalPrice(event.target.value)} /></div>
          <div><Label>Discount label</Label><Input placeholder="40% off" value={promotionDiscountLabel} onChange={(event) => setPromotionDiscountLabel(event.target.value)} /></div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: "product.details.after" })
export default ProductLaunchStatusWidget
