"use client"

import { type FormEvent, useEffect, useState } from "react"
import { medusaBackendUrl, medusaPublishableKey } from "@lib/config"

const SIGNUP_STORAGE_KEY = "xyz-launch-notification-registered"

export function LaunchNotice() {
  const [state, setState] = useState<
    "checking" | "idle" | "saving" | "done" | "error" | "hidden"
  >("checking")

  useEffect(() => {
    try {
      setState(
        localStorage.getItem(SIGNUP_STORAGE_KEY) === "true" ? "hidden" : "idle"
      )
    } catch {
      setState("idle")
    }
  }, [])

  useEffect(() => {
    if (state !== "done") return
    const timeout = window.setTimeout(() => setState("hidden"), 4000)
    return () => window.clearTimeout(timeout)
  }, [state])

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
      try {
        localStorage.setItem(SIGNUP_STORAGE_KEY, "true")
      } catch {
        // Storage restrictions must not turn a successful signup into an error.
      }
      setState("done")
    } catch {
      setState("error")
    }
  }

  if (state === "checking" || state === "hidden") return null

  if (state === "done") {
    return (
      <aside className="border-b border-neutral-200 bg-concrete px-3 py-2 text-center text-deepBlack">
        <p role="status" aria-live="polite" className="text-xs leading-relaxed">
          You’re on the list. We’ll email you when the launch is announced.
        </p>
      </aside>
    )
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
      </div>
      <p role="status" aria-live="polite" className="text-xs leading-relaxed">
        {state === "error"
          ? "We couldn’t save your email. Please try again."
          : ""}
      </p>
    </aside>
  )
}
