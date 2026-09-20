import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Button, Container, Heading, Select, Text, toast } from "@medusajs/ui"
import { useState } from "react"

const ProductLaunchStatusWidget = ({ data }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const current = String(data.metadata?.launch_status ?? "available")
  const [status, setStatus] = useState(current)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const response = await fetch(`/admin/catalog-engagement/products/${data.id}/launch-status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Could not update launch status")
      toast.success("Launch status updated")
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
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: "product.details.after" })
export default ProductLaunchStatusWidget
