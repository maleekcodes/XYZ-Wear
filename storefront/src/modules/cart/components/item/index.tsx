"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"
import Image from "next/image"
import { Minus, Plus, X } from "lucide-react"
import { useState } from "react"

import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  /** `table`: Medusa table row. `card`: roomy checkout sidebar row. */
  previewLayout?: "table" | "card"
}

const Item = ({ item, type = "full", previewLayout = "table" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { handle } = item.variant?.product ?? {}
  const initialImage =
    item.variant?.images?.[0]?.url ||
    item.variant?.product?.thumbnail ||
    item.variant?.product?.images?.[0]?.url

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const removeLine = async () => {
    setError(null)
    setRemoving(true)
    await deleteLineItem(item.id)
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setRemoving(false)
      })
  }

  if (type === "preview" && previewLayout === "card") {
    return (
      <div
        className="flex gap-5 border border-neutral-200 bg-white px-5 py-6 md:gap-6 md:px-6 md:py-7"
        data-testid="product-row"
      >
        <LocalizedClientLink
          href={`/products/${handle}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden bg-concrete"
        >
          {initialImage ? (
            <Image
              src={initialImage}
              alt={item.product_title ?? "Product"}
              className="object-cover object-center"
              fill
              sizes="96px"
              quality={60}
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-200">
              <div className="h-12 w-12 rounded bg-neutral-300" />
            </div>
          )}
        </LocalizedClientLink>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <LocalizedClientLink href={`/products/${handle}`}>
            <span
              className="text-sm font-bold text-deepBlack hover:opacity-80"
              data-testid="product-title"
            >
              {item.product_title}
            </span>
          </LocalizedClientLink>
          <div
            className="text-xs text-neutral-500 [&_*]:text-neutral-500"
            data-testid="product-variant"
          >
            <LineItemOptions variant={item.variant} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center gap-1.5 text-right">
          <span className="flex items-baseline gap-1 text-xs text-neutral-500">
            <span>{item.quantity}×</span>
            <LineItemUnitPrice item={item} style="tight" />
          </span>
          <span className="text-sm font-bold tabular-nums text-deepBlack">
            <LineItemPrice item={item} style="tight" />
          </span>
        </div>
      </div>
    )
  }

  if (type === "preview") {
    return (
      <Table.Row className="w-full" data-testid="product-row">
        <Table.Cell className="!pl-0 p-4 w-24">
          <LocalizedClientLink href={`/products/${handle}`} className="flex w-16">
            <Thumbnail
              thumbnail={item.variant?.images?.[0]?.url}
              images={item.variant?.images ?? item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        </Table.Cell>

        <Table.Cell className="text-left">
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        </Table.Cell>

        <Table.Cell className="!pr-0">
          <span className="flex flex-col items-end h-full justify-center !pr-0">
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice item={item} style="tight" />
            </span>
            <LineItemPrice item={item} style="tight" />
          </span>
        </Table.Cell>
      </Table.Row>
    )
  }

  return (
    <div
      className="flex gap-6 pb-8 border-b border-neutral-100 last:border-b-0"
      data-testid="product-row"
    >
      <LocalizedClientLink
        href={`/products/${handle}`}
        className="relative block h-32 w-32 shrink-0 overflow-hidden bg-concrete"
      >
        {initialImage ? (
          <Image
            src={initialImage}
            alt={item.product_title ?? "Product"}
            className="object-cover object-center"
            fill
            sizes="128px"
            quality={60}
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200">
            <div className="h-16 w-16 rounded bg-neutral-300" />
          </div>
        )}
      </LocalizedClientLink>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <LocalizedClientLink href={`/products/${handle}`}>
              <h3
                className="text-lg font-bold text-deepBlack hover:opacity-80"
                data-testid="product-title"
              >
                {item.product_title}
              </h3>
            </LocalizedClientLink>
            <div
              className="mt-1 text-sm text-neutral-500 [&_*]:text-neutral-500"
              data-testid="product-variant"
            >
              <LineItemOptions variant={item.variant} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => void removeLine()}
            disabled={removing || updating}
            className="shrink-0 text-neutral-400 transition-colors hover:text-deepBlack disabled:opacity-50"
            data-testid="product-delete-button"
            aria-label="Remove item"
          >
            {removing ? (
              <Spinner />
            ) : (
              <X size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center border border-neutral-200">
            <button
              type="button"
              disabled={updating || item.quantity <= 1}
              onClick={() =>
                void changeQuantity(Math.max(1, item.quantity - 1))
              }
              className="p-2 transition-colors hover:bg-neutral-100 disabled:opacity-40"
              data-testid="product-qty-decrease"
              aria-label="Decrease quantity"
            >
              <Minus size={16} strokeWidth={1.5} />
            </button>
            <span
              className="min-w-[2.5rem] px-2 text-center font-mono text-sm tabular-nums"
              data-testid="product-select-button"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={
                updating || item.quantity >= Math.min(maxQuantity, 10)
              }
              onClick={() =>
                void changeQuantity(
                  Math.min(item.quantity + 1, Math.min(maxQuantity, 10))
                )
              }
              className="p-2 transition-colors hover:bg-neutral-100 disabled:opacity-40"
              data-testid="product-qty-increase"
              aria-label="Increase quantity"
            >
              <Plus size={16} strokeWidth={1.5} />
            </button>
            {updating ? (
              <span className="pl-1 pr-2">
                <Spinner />
              </span>
            ) : null}
          </div>
          <span className="font-bold text-deepBlack tabular-nums">
            <LineItemPrice item={item} style="tight" />
          </span>
        </div>
        <ErrorMessage error={error} data-testid="product-error-message" />
      </div>
    </div>
  )
}

export default Item
