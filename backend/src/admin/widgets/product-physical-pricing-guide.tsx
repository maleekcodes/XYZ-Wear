import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Container, Heading, Text } from "@medusajs/ui"

const ProductPhysicalPricingGuide = (_props: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  return (
    <Container className="p-4">
      <Heading level="h2">Physical Form pricing &amp; currency</Heading>
      <Text className="mb-4 mt-1 text-ui-fg-subtle" size="small">
        Choose whether to edit this product&apos;s prices or the currency shown to
        customers.
      </Text>

      <div className="flex flex-col gap-3">
        <div>
          <Text size="small" weight="plus">Edit this product&apos;s prices</Text>
          <Text className="text-ui-fg-subtle" size="small">
            Open a variant and edit its Prices. Add the EUR and USD amounts you
            want to charge for that variant.
          </Text>
        </div>
        <div>
          <Text size="small" weight="plus">Change the currency customers see</Text>
          <Text className="text-ui-fg-subtle" size="small">
            Go to Settings → Regions, open the region, then change its currency
            to EUR or USD. This affects every customer and product in that
            region; make sure variant prices exist in the selected currency.
          </Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: "product.details.side.after" })
export default ProductPhysicalPricingGuide
