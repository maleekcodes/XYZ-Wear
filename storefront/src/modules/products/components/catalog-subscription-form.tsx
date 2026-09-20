"use client"

import { FormEvent, useState } from "react"

import { medusaBackendUrl, medusaPublishableKey } from "@lib/config"

type Props = {
  productId: string
  variantId?: string
  kind: "waitlist" | "restock"
  source?: "physical" | "digital"
}

export function CatalogSubscriptionForm({
  productId,
  variantId,
  kind,
  source = "physical",
}: Props) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle")
  const [message, setMessage] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState("saving")
    setMessage("")

    try {
      const response = await fetch(`${medusaBackendUrl}/store/catalog-subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(medusaPublishableKey
            ? { "x-publishable-api-key": medusaPublishableKey }
            : {}),
        },
        body: JSON.stringify({
          email,
          kind,
          product_id: productId,
          variant_id: variantId ?? null,
          source,
        }),
      })
      const body = (await response.json().catch(() => ({}))) as {
        message?: string
        already_subscribed?: boolean
      }
      if (!response.ok) throw new Error(body.message || "Could not save your request")
      setState("done")
      setMessage(
        body.already_subscribed
          ? "You’re already on the list."
          : kind === "restock"
            ? "We’ll email you when it’s back."
            : "You’re on the waitlist."
      )
    } catch (error) {
      setState("error")
      setMessage(error instanceof Error ? error.message : "Could not save your request")
    }
  }

  if (state === "done") {
    return <p className="text-xs text-neutral-500">{message}</p>
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <label className="sr-only" htmlFor={`${kind}-${productId}`}>
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id={`${kind}-${productId}`}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="min-w-0 flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm text-deepBlack outline-none placeholder:text-neutral-500 focus:border-deepBlack"
        />
        <button
          type="submit"
          disabled={state === "saving"}
          className="border border-deepBlack bg-deepBlack px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-white disabled:opacity-50"
        >
          {state === "saving" ? "Saving" : kind === "restock" ? "Notify me" : "Join waitlist"}
        </button>
      </div>
      {state === "error" ? <p className="text-xs text-red-600">{message}</p> : null}
    </form>
  )
}
