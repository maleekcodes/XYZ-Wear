"use client"

import { Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="mb-6 flex flex-row items-center justify-between gap-4">
        <h2
          className={clx(
            "text-xl font-bold tracking-tight text-deepBlack",
            {
              "pointer-events-none select-none opacity-50": !isOpen,
            }
          )}
        >
          Review
        </h2>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="mb-6 w-full">
            <Text className="text-sm leading-relaxed text-neutral-500">
              By placing your order you agree to our terms of sale and returns
              policy, and acknowledge our privacy policy.
            </Text>
            <Text className="mt-4 border-l-2 border-deepBlack pl-4 text-sm leading-relaxed text-deepBlack">
              Orders are processed within 2–5 business days. Delivery is then
              estimated at 1–3 business days in the UK, 3–7 in Europe, or
              5–10 internationally.
            </Text>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
