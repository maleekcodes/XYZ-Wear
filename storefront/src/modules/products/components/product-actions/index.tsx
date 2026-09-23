"use client"

import { Button } from "@medusajs/ui"
import dynamic from "next/dynamic"
import { isEqual } from "lodash"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"

const PhysicalProductTryOn = dynamic(
  () =>
    import("./physical-product-try-on").then((m) => m.PhysicalProductTryOn),
  { ssr: false }
)
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { productMetadataString } from "@lib/util/physical-product-copy"
import {
  defaultAppearanceValue,
  isAppearanceOption,
  isSizeOption,
  optionValuesInOrder,
  productHasSelectableOptions,
} from "@lib/util/product-options"
import { useProductColor } from "@modules/products/components/product-color-context"
import SizeGuide from "@modules/products/components/size-guide"
import { CatalogSubscriptionForm } from "../catalog-subscription-form"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  /** Set from server via env; avoids client-only feature detection that can miss on cold loads. */
  tryOnEnabled: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

function defaultOptions(
  product: HttpTypes.StoreProduct
): Record<string, string | undefined> {
  const defaults: Record<string, string> = {}
  for (const option of product.options || []) {
    const values = optionValuesInOrder(option)
    if (!option.title || values.length === 0) continue
    if (values.length === 1) {
      defaults[option.title] = values[0]
    }
    if (isAppearanceOption(option.title)) {
      defaults[option.title] = defaultAppearanceValue(product) ?? values[0]
    }
  }
  if (product.variants?.length === 1) {
    Object.assign(defaults, optionsAsKeymap(product.variants[0].options) ?? {})
  }
  return defaults
}

export default function ProductActions({
  product,
  region,
  disabled,
  tryOnEnabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>(
    () => defaultOptions(product)
  )
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()
  const countryCode = useParams().countryCode as string
  const colorCtx = useProductColor()
  const setColor = colorCtx?.setColor

  useEffect(() => {
    setOptions((prev) => ({ ...defaultOptions(product), ...prev }))
  }, [product.variants, product.options])

  // Keep gallery in sync with the selected / default color
  useEffect(() => {
    const colorKey = Object.keys(options).find((key) =>
      isAppearanceOption(key)
    )
    const selected =
      (colorKey ? options[colorKey] : undefined) ??
      defaultAppearanceValue(product)
    if (selected) {
      setColor?.(selected)
    }
  }, [options, product, setColor])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
    if (isAppearanceOption(title)) {
      setColor?.(value)
    }
  }

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const launchStatus = String(product.metadata?.launch_status ?? "available")
  const preOrderEnabled = String(product.metadata?.pre_order_enabled ?? "false") === "true"
  const now = Date.now()
  const openingTime = Date.parse(String(product.metadata?.pre_order_opening_date ?? ""))
  const closingTime = Date.parse(String(product.metadata?.pre_order_closing_date ?? ""))
  const dateAwareStatus = preOrderEnabled && Number.isFinite(openingTime)
    ? now < openingTime
      ? "coming_soon"
      : Number.isFinite(closingTime) && now >= closingTime
        ? "available"
        : "pre_order"
    : launchStatus
  const isComingSoon =
    product.metadata?.coming_soon === true ||
    product.metadata?.coming_soon === "true" ||
    dateAwareStatus === "coming_soon"
  const isPreOrder = dateAwareStatus === "pre_order"
  const lowStock = inStock && (selectedVariant?.inventory_quantity ?? 0) <= 50
  const formatDate = (value: unknown) => {
    if (!value || typeof value !== "string") return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date)
  }
  const openingDate = formatDate(product.metadata?.pre_order_opening_date)
  const closingDate = formatDate(product.metadata?.pre_order_closing_date)
  const dispatchDate = product.metadata?.pre_order_dispatch_date

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    router.refresh()
    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <ProductPrice product={product} variant={selectedVariant} />
          </div>
          <PhysicalProductTryOn
            enabled={tryOnEnabled}
            product={product}
            countryCode={countryCode}
          />
        </div>

        {selectedVariant?.manage_inventory !== false &&
        selectedVariant &&
        !isPreOrder ? (
          <div className="space-y-2" aria-live="polite">
            {inStock &&
            (selectedVariant.metadata as Record<string, unknown> | undefined)
              ?.restocked_at ? (
              <p className="font-mono text-[10px] uppercase tracking-widest text-black">
                RESTOCK
              </p>
            ) : null}
            <p className={`font-mono text-[10px] uppercase tracking-widest ${lowStock ? "text-red-600" : "text-black"}`}>
              {inStock
                ? `${selectedVariant.inventory_quantity ?? 0} left in stock`
                : "Sold out"}
            </p>
          </div>
        ) : null}

        {productHasSelectableOptions(product) && (
          <div className="flex flex-col gap-y-5">
            {(product.options || []).map((option) => {
              const isSize = isSizeOption(option.title)
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.title ?? ""]}
                    updateOption={setOptionValue}
                    title={option.title ?? ""}
                    hint={
                      isSize
                        ? productMetadataString(product, "size_info")
                        : null
                    }
                    note={
                      isSize
                        ? productMetadataString(product, "size_info_detail")
                        : null
                    }
                    data-testid="product-options"
                    disabled={!!disabled || isAdding}
                  />
                </div>
              )
            })}
            <Divider />
          </div>
        )}

        {isComingSoon ? (
          <>
            <Button
              disabled
              variant="primary"
              className="h-12 w-full rounded-none border border-neutral-200 bg-neutral-100 text-xs font-medium uppercase tracking-[0.15em] !text-red-600 disabled:!text-red-600"
            >
              Coming soon
            </Button>
            {openingDate ? <p className="text-center text-sm text-red-600">Pre-order opens on {openingDate}</p> : null}
            <CatalogSubscriptionForm productId={product.id} kind="waitlist" />
          </>
        ) : isPreOrder ? (
          <>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant || !!disabled || isAdding}
              variant="primary"
              className="h-12 w-full rounded-none border border-neutral-200 bg-neutral-100 text-xs font-medium uppercase tracking-[0.15em] text-red-600 transition-colors hover:bg-white hover:text-red-600 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-red-600 disabled:hover:bg-neutral-100"
              isLoading={isAdding}
              data-testid="pre-order-button"
            >
              Pre-order
            </Button>
            <p className="text-left text-sm leading-relaxed text-black">
              {closingDate ? `Pre-order closes ${closingDate}. ` : "This product is available for pre-order. "}
              {dispatchDate ? `Estimated dispatch: ${dispatchDate}. ` : "You’ll receive it 1–2 weeks after successful payment. "}
              We’ll email you with updates.
            </p>
          </>
        ) : !inStock && selectedVariant ? (
          <>
            <Button
              disabled
              variant="primary"
              className="h-12 w-full rounded-none border border-neutral-200 bg-neutral-100 text-xs font-medium uppercase tracking-[0.15em] !text-red-600 disabled:!text-red-600"
            >
              Sold out
            </Button>
            <CatalogSubscriptionForm
              productId={product.id}
              variantId={selectedVariant.id}
              kind="restock"
            />
          </>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant || !!disabled || isAdding}
            variant="primary"
            className="h-12 w-full rounded-none border border-deepBlack bg-deepBlack text-xs font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-white hover:text-deepBlack disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:hover:bg-neutral-100"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant ? "Select variant" : "Add to bag"}
          </Button>
        )}
        <SizeGuide product={product} />
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
