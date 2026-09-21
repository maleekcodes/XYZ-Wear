import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  return (
    <div className="text-sm leading-relaxed text-neutral-500">
      <p>
        We have sent the order confirmation details to{" "}
        <span className="font-semibold text-deepBlack" data-testid="order-email">
          {order.email}
        </span>
        .
      </p>
      <p className="mt-4">
        Order date:{" "}
        <span className="text-deepBlack" data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </p>
      <p className="mt-4">
        Order number:{" "}
        <span
          className="font-mono text-sm font-semibold tabular-nums text-deepBlack"
          data-testid="order-id"
        >
          #{order.display_id}
        </span>
      </p>
      <p className="mt-6 border-l-2 border-deepBlack pl-4 text-deepBlack">
        We are preparing your order now. Please allow 2–5 business days for
        processing, followed by an estimated 1–3 business days for UK delivery,
        3–7 for Europe, or 5–10 internationally.
      </p>

      {showStatus ? (
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500">
          {/* Status fields reserved for fulfillment / payment when exposed by API */}
        </div>
      ) : null}
    </div>
  )
}

export default OrderDetails
