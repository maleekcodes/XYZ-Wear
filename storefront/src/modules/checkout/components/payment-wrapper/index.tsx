"use client"

import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import StripeWrapper from "./stripe-wrapper"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { createContext } from "react"
import { HttpTypes } from "@medusajs/types"
import { isPaypal, isStripe } from "@lib/constants"

type WrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

export const StripeContext = createContext(false)

/** True when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (or NEXT_PUBLIC_STRIPE_KEY) is set — required for Stripe.js / card fields. */
export const StripePublishableKeyContext = createContext(false)

/** Publishable key (pk_…); must match the Stripe account used by Medusa (`STRIPE_API_KEY` on backend). */
const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_STRIPE_KEY?.trim() ||
  ""

const stripePkConfigured = Boolean(stripePublishableKey)

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

function CheckoutProviders({
  children,
  stripeElementsActive,
}: {
  children: React.ReactNode
  stripeElementsActive: boolean
}) {
  return (
    <StripePublishableKeyContext.Provider value={stripePkConfigured}>
      <StripeContext.Provider value={stripeElementsActive}>
        {children}
      </StripeContext.Provider>
    </StripePublishableKeyContext.Provider>
  )
}

const Wrapper: React.FC<WrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const clientSecret =
    typeof paymentSession?.data?.client_secret === "string"
      ? paymentSession.data.client_secret
      : ""

  const canMountStripeElements =
    isStripe(paymentSession?.provider_id) &&
    Boolean(paymentSession) &&
    Boolean(stripePromise) &&
    clientSecret.length > 0

  if (canMountStripeElements) {
    return (
      <CheckoutProviders stripeElementsActive>
        <StripeWrapper
          paymentSession={paymentSession!}
          stripeKey={stripePublishableKey}
          stripePromise={stripePromise}
        >
          {children}
        </StripeWrapper>
      </CheckoutProviders>
    )
  }

  if (
    isPaypal(paymentSession?.provider_id) &&
    paypalClientId !== undefined &&
    cart
  ) {
    return (
      <CheckoutProviders stripeElementsActive={false}>
        <PayPalScriptProvider
          options={{
            "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
            currency: cart?.currency_code?.toUpperCase(),
            intent: "authorize",
            components: "buttons",
          }}
        >
          {children}
        </PayPalScriptProvider>
      </CheckoutProviders>
    )
  }

  return (
    <CheckoutProviders stripeElementsActive={false}>
      <div>{children}</div>
    </CheckoutProviders>
  )
}

export default Wrapper
