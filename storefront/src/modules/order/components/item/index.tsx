import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
}

const Item = ({ item }: ItemProps) => {
  const product = (
    item.variant as { product?: HttpTypes.StoreProduct } | undefined
  )?.product
  const handle = product?.handle

  const initialImage =
    item.variant?.images?.[0]?.url ||
    item.thumbnail ||
    product?.thumbnail ||
    product?.images?.[0]?.url

  return (
    <div
      className="flex gap-5 border border-neutral-200 bg-white px-5 py-6 md:gap-6 md:px-6 md:py-7"
      data-testid="product-row"
    >
      {handle ? (
        <LocalizedClientLink
          href={`/products/${handle}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden bg-concrete"
        >
          {initialImage ? (
            <Image
              src={initialImage}
              alt={item.title ?? "Product"}
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
      ) : (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-concrete">
          {initialImage ? (
            <Image
              src={initialImage}
              alt={item.title ?? "Product"}
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
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        {handle ? (
          <LocalizedClientLink href={`/products/${handle}`}>
            <span
              className="text-sm font-bold text-deepBlack hover:opacity-80"
              data-testid="product-name"
            >
              {item.title}
            </span>
          </LocalizedClientLink>
        ) : (
          <span
            className="text-sm font-bold text-deepBlack"
            data-testid="product-name"
          >
            {item.title}
          </span>
        )}
        {item.variant ? (
          <div
            className="text-xs text-neutral-500 [&_*]:text-neutral-500"
            data-testid="product-variant"
          >
            <LineItemOptions variant={item.variant} />
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-1.5 text-right">
        <span className="flex items-baseline gap-1 text-xs text-neutral-500">
          <span data-testid="product-quantity">{item.quantity}</span>
          <span>×</span>
          <LineItemUnitPrice item={item} style="tight" />
        </span>
        <span className="text-sm font-bold tabular-nums text-deepBlack">
          <LineItemPrice item={item} style="tight" />
        </span>
      </div>
    </div>
  )
}

export default Item
