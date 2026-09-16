"use client"

import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RadioGroup } from "@headlessui/react"
import ErrorMessage from "@modules/checkout/components/error-message"
import {
  checkoutEditLink,
  checkoutPrimaryButton,
  checkoutSectionTitle,
  checkoutStepDivider,
} from "@modules/checkout/components/checkout-ui"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Text, clx } from "@medusajs/ui"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"

import PaymentContainer from "@modules/checkout/components/payment-container"
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import {
  StripeContext,
  StripePublishableKeyContext,
} from "@modules/checkout/components/payment-wrapper"
import { initiatePaymentSession } from "@lib/data/cart"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(activeSession?.provider_id)
  const stripeReady = useContext(StripeContext)
  const stripePkConfigured = useContext(StripePublishableKeyContext)
  const hasStripeClientSecret = Boolean(
    typeof activeSession?.data?.client_secret === "string" &&
      (activeSession?.data?.client_secret as string).length > 0
  )

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) || paidByGiftcard

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#0F0F0F",
          "::placeholder": {
            color: "rgb(115 115 115)",
          },
        },
      },
      classes: {
        base: "block mt-0 h-11 w-full appearance-none border border-neutral-300 bg-white px-4 pb-1 pt-3 transition-colors duration-300 ease-in-out hover:border-neutral-400 focus:border-deepBlack focus:outline-none focus:ring-0 rounded-none",
      },
    }
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeFunc(selectedPaymentMethod) && !activeSession

      if (!activeSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="mb-6 flex flex-row items-center justify-between gap-4">
        <h2
          className={clx(
            `flex items-baseline gap-2 ${checkoutSectionTitle}`,
            {
              "pointer-events-none select-none opacity-50":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady ? (
            <span className="text-emerald-600" aria-hidden>
              <CheckCircleSolid />
            </span>
          ) : null}
        </h2>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className={checkoutEditLink}
              data-testid="edit-payment-button"
              type="button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setSelectedPaymentMethod(value)}
              >
                {[...availablePaymentMethods]
                  .sort((a, b) => {
                    return a.provider_id > b.provider_id ? 1 : -1
                  })
                  .map((paymentMethod) => {
                    return (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        key={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )
                  })}
              </RadioGroup>
              {isStripe && stripeReady && (
                <div className="mt-5 transition-all duration-150 ease-in-out">
                  <Text className="mb-1 text-sm font-bold text-deepBlack">
                    Enter your card details
                  </Text>

                  <CardElement
                    options={useOptions as StripeCardElementOptions}
                    onChange={(e) => {
                      setCardBrand(
                        e.brand &&
                          e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                      )
                      setError(e.error?.message || null)
                      setCardComplete(e.complete)
                    }}
                  />
                </div>
              )}
              {isStripe && !stripeReady && (
                <div
                  className="mt-5 rounded-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-neutral-800"
                  role="status"
                >
                  {!stripePkConfigured ? (
                    <>
                      <p className="font-semibold text-deepBlack">
                        Stripe publishable key missing
                      </p>
                      <p className="mt-1 text-neutral-600">
                        Add{" "}
                        <code className="font-mono text-xs">
                          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                        </code>{" "}
                        (or <code className="font-mono text-xs">NEXT_PUBLIC_STRIPE_KEY</code>)
                        to the storefront environment — use the{" "}
                        <span className="font-mono text-xs">pk_test_…</span> /{" "}
                        <span className="font-mono text-xs">pk_live_…</span> key
                        from the same Stripe account as the backend{" "}
                        <code className="font-mono text-xs">STRIPE_API_KEY</code>
                        , then restart the dev server.
                      </p>
                    </>
                  ) : !hasStripeClientSecret ? (
                    <>
                      <p className="font-semibold text-deepBlack">
                        Card form could not be loaded
                      </p>
                      <p className="mt-1 text-neutral-600">
                        No Stripe payment session was returned from the server.
                        Refresh the page or go back one step and continue again.
                        If it persists, confirm Stripe is enabled for this region
                        in Medusa Admin.
                      </p>
                    </>
                  ) : (
                    <p className="text-neutral-600">
                      Loading card fields… If this stays visible, refresh the
                      page.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {paidByGiftcard && (
            <div className="flex max-w-md flex-col">
              <Text className="mb-1 text-sm font-bold text-deepBlack">
                Payment method
              </Text>
              <Text
                className="text-sm text-neutral-500"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className={clx(checkoutPrimaryButton, "mt-6")}
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripe &&
                stripeReady &&
                !cardComplete) ||
              (isStripe && !stripeReady) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeFunc(selectedPaymentMethod)
              ? " Enter card details"
              : "Continue to review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex w-full flex-wrap items-start gap-x-8 gap-y-4">
              <div className="flex min-w-[10rem] flex-col">
                <Text className="mb-1 text-sm font-bold text-deepBlack">
                  Payment method
                </Text>
                <Text
                  className="text-sm text-neutral-500"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    selectedPaymentMethod}
                </Text>
              </div>
              <div className="flex min-w-[10rem] flex-col">
                <Text className="mb-1 text-sm font-bold text-deepBlack">
                  Payment details
                </Text>
                <div
                  className="flex items-center gap-2 text-sm text-neutral-500"
                  data-testid="payment-details-summary"
                >
                  <div className="flex h-7 w-fit items-center border border-neutral-200 bg-concrete p-2">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </div>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Another step will appear"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex max-w-md flex-col">
              <Text className="mb-1 text-sm font-bold text-deepBlack">
                Payment method
              </Text>
              <Text
                className="text-sm text-neutral-500"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <div className={checkoutStepDivider} />
    </div>
  )
}

export default Payment
