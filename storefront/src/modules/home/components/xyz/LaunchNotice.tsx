"use client"

import { type FormEvent, useState } from "react"
import { medusaBackendUrl, medusaPublishableKey } from "@lib/config"

export function LaunchNotice() {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  )

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === "saving") return
    const email = String(
      new FormData(event.currentTarget).get("email") || ""
    ).trim()
    setState("saving")
    try {
      const response = await fetch(
        `${medusaBackendUrl}/store/catalog-subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(medusaPublishableKey
              ? { "x-publishable-api-key": medusaPublishableKey }
              : {}),
          },
          body: JSON.stringify({ email, kind: "launch", source: "homepage" }),
        }
      )
      if (!response.ok) throw new Error("Subscription failed")
      setState("done")
    } catch {
      setState("error")
    }
  }

  return (
    <aside
      aria-labelledby="launch-heading"
      className="border-b border-neutral-200 bg-concrete px-3 py-2 text-center text-deepBlack"
    >
      <h2 id="launch-heading" className="text-xs font-medium">
        COMING SOON
      </h2>
      <div className="mx-auto mt-1 flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-xs min-[1024px]:flex-nowrap min-[1024px]:text-[clamp(8px,0.75vw,12px)]">
        <p className="leading-normal min-[1024px]:whitespace-nowrap">
          XYZ London is preparing for its official launch. The launch date will
          be announced soon. Our first collection will be available to purchase
          at launch. Be among the first to know.
        </p>
        {state !== "done" && (
          <form
            onSubmit={subscribe}
            className="inline-flex shrink-0 items-center gap-1"
            aria-label="Launch notification signup"
          >
            <label htmlFor="launch-email" className="sr-only">
              Email Address
            </label>
            <input
              id="launch-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="Email Address"
              className="h-6 w-24 min-w-0 border border-neutral-300 bg-white px-1 text-[length:inherit] text-deepBlack placeholder:text-neutral-500 focus:border-deepBlack focus:outline-none focus:ring-0 focus:shadow-none"
            />
            <button
              type="submit"
              disabled={state === "saving"}
              className="h-6 shrink-0 whitespace-nowrap border border-deepBlack bg-deepBlack px-1 text-[length:inherit] text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepBlack disabled:opacity-50"
            >
              {state === "saving" ? "SAVING…" : "GET NOTIFIED"}
            </button>
          </form>
        )}
      </div>
      <p role="status" aria-live="polite" className="text-xs leading-relaxed">
        {state === "done"
          ? "You’re on the list. We’ll email you when the launch is announced."
          : state === "error"
          ? "We couldn’t save your email. Please try again."
          : ""}
      </p>
    </aside>
  )
}
