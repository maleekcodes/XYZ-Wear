"use client"

import { HttpTypes } from "@medusajs/types"

import Accordion from "@modules/products/components/product-tabs/accordion"
import { productMetadataString } from "@lib/util/physical-product-copy"

type Props = {
  product: HttpTypes.StoreProduct
}

function Spec({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div>
      <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
        {label}
      </span>
      <p className="mt-1 whitespace-pre-line text-deepBlack">{value}</p>
    </div>
  )
}

function DescriptionBody({ product }: { product: HttpTypes.StoreProduct }) {
  const composition = productMetadataString(product, "composition")
  const fabricWeight = productMetadataString(product, "fabric_weight")
  const designDetails = productMetadataString(product, "design_details")
  const typeLabel =
    productMetadataString(product, "type_label") ?? product.type?.value
  const coreId = productMetadataString(product, "core_product_id")
  const itemNumber = productMetadataString(product, "item_number")
  const fit = productMetadataString(product, "fit")
  const care = productMetadataString(product, "care")
  const origin =
    productMetadataString(product, "origin_label") ??
    (product.origin_country ? product.origin_country : null)

  const hasStructured = Boolean(
    composition || fabricWeight || designDetails || coreId || fit || care
  )
  const overview = productMetadataString(product, "overview")

  if (!hasStructured) {
    return product.description ? (
      <p className="whitespace-pre-line">{product.description}</p>
    ) : (
      <p className="text-neutral-400">No description available.</p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {overview && (
        <p className="whitespace-pre-line">{overview}</p>
      )}
      <section className="flex flex-col gap-4">
        <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">
          Details & Materials
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Spec label="Composition" value={composition} />
          <Spec label="Fabric weight" value={fabricWeight} />
          <Spec label="Type" value={typeLabel} />
          <Spec label="Country of origin" value={origin} />
          <Spec label="Core product ID" value={coreId} />
          <Spec label="Item number" value={itemNumber} />
        </div>
        {designDetails && (
          <Spec label="Design details" value={designDetails} />
        )}
      </section>

      {fit && (
        <section className="flex flex-col gap-4">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">
            Dimension
          </h4>
          <Spec label="Fit" value={fit} />
        </section>
      )}

      {care && (
        <section className="flex flex-col gap-4">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">
            Details & Care
          </h4>
          <p className="whitespace-pre-line text-deepBlack">{care}</p>
        </section>
      )}
    </div>
  )
}

export default function ProductDetailAccordions({ product }: Props) {
  const shippingCopy = productMetadataString(product, "shipping_copy")
  const returnsCopy = productMetadataString(product, "returns_copy")
  const originLabel =
    productMetadataString(product, "origin_label") ?? product.origin_country

  return (
    <div className="w-full">
      <Accordion type="multiple">
        <Accordion.Item
          title="Description"
          headingSize="medium"
          value="description"
        >
          <div
            className="pb-8 pt-2 text-sm font-light leading-relaxed text-neutral-600"
            data-testid="product-description"
          >
            <DescriptionBody product={product} />
          </div>
        </Accordion.Item>

        <Accordion.Item title="Details" headingSize="medium" value="details">
          <div className="pb-8 pt-2 text-small-regular">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-12">
              <div className="flex flex-col gap-y-4">
                <Spec
                  label="Material"
                  value={
                    product.material ??
                    productMetadataString(product, "composition")
                  }
                />
                <Spec label="Country of origin" value={originLabel} />
                <Spec
                  label="Type"
                  value={
                    productMetadataString(product, "type_label") ??
                    product.type?.value
                  }
                />
              </div>
              <div className="flex flex-col gap-y-4">
                <Spec
                  label="Fabric weight"
                  value={productMetadataString(product, "fabric_weight")}
                />
                <Spec
                  label="Core product ID"
                  value={productMetadataString(product, "core_product_id")}
                />
                <Spec
                  label="Item number"
                  value={productMetadataString(product, "item_number")}
                />
              </div>
            </div>
          </div>
        </Accordion.Item>

        {(shippingCopy || returnsCopy) && (
          <Accordion.Item
            title="Shipping & Returns"
            headingSize="medium"
            value="shipping"
          >
            <div className="flex flex-col gap-6 pb-8 pt-2 text-sm font-light leading-relaxed text-neutral-600">
              {shippingCopy && (
                <section>
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">
                    Shipping
                  </h4>
                  <p className="mt-3 whitespace-pre-line">{shippingCopy}</p>
                </section>
              )}
              {returnsCopy && (
                <section>
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">
                    Returns
                  </h4>
                  <p className="mt-3 whitespace-pre-line">{returnsCopy}</p>
                </section>
              )}
            </div>
          </Accordion.Item>
        )}
      </Accordion>
    </div>
  )
}
