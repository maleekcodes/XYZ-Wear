import { NextResponse } from "next/server"
import Stripe from "stripe"

import { normalizeDigitalPdpSlug } from "@lib/digital/normalize-digital-slug"
import { CYBERX_EFFECT_VERSION, CYBERX_SLUG } from "@lib/digital/cyberx-effects"
import { loadDigitalProductForApi } from "@lib/digital/load-product-for-api"
import {
  digitalTryonObjectKey,
  tryonObjectEffectVersion,
  tryonObjectExists,
} from "@lib/digital/minio-server"
import { getBaseURL } from "@lib/util/env"

export const runtime = "nodejs"

const STRIPE_CURRENCIES = new Set(["gbp", "usd", "eur"])

type Body = {
  slug?: string
  predictionId?: string
  countryCode?: string
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured" },
      { status: 503 }
    )
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const slug = normalizeDigitalPdpSlug(body.slug?.trim() || "")
  const predictionId = body.predictionId?.trim()
  const countryCode = body.countryCode?.trim() || "us"

  if (!slug || !predictionId) {
    return NextResponse.json(
      { error: "slug and predictionId are required" },
      { status: 400 }
    )
  }

  const key = digitalTryonObjectKey(slug, predictionId)
  const ready = await tryonObjectExists(key)
  if (!ready) {
    return NextResponse.json(
      {
        error:
          "Try-on file is not available yet. Complete try-on with MinIO configured, then try again.",
      },
      { status: 400 }
    )
  }
  if (
    slug === CYBERX_SLUG &&
    (await tryonObjectEffectVersion(key)) !== CYBERX_EFFECT_VERSION
  ) {
    return NextResponse.json(
      { error: "The enhanced CyberX image is not ready yet. Please finish try-on." },
      { status: 400 }
    )
  }

  const product = await loadDigitalProductForApi(slug)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const priceMajor = product.price
  if (priceMajor == null || Number.isNaN(Number(priceMajor)) || Number(priceMajor) < 0) {
    return NextResponse.json(
      { error: "Product is missing a valid price" },
      { status: 400 }
    )
  }

  const currency = (product.currency || "gbp").toLowerCase()
  if (!STRIPE_CURRENCIES.has(currency)) {
    return NextResponse.json(
      {
        error:
          "This currency is not supported for one-click Stripe checkout. Use GBP, USD, or EUR.",
      },
      { status: 422 }
    )
  }

  const unitAmount = Math.round(Number(priceMajor) * 100)
  if (unitAmount < 50) {
    return NextResponse.json(
      { error: "Amount is too low for Stripe (minimum ~0.50 in major units)" },
      { status: 400 }
    )
  }

  const base = getBaseURL().replace(/\/$/, "")
  const successUrl = `${base}/${countryCode}/digital/${encodeURIComponent(
    slug
  )}/success?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${base}/${countryCode}/digital/${encodeURIComponent(slug)}`

  const stripe = new Stripe(secret, { typescript: true })

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: unitAmount,
          product_data: {
            name: product.name || "Digital product",
            description: product.description?.slice(0, 500) || undefined,
          },
        },
      },
    ],
    metadata: {
      slug,
      prediction_id: predictionId,
      minio_key: key,
      ...(slug === CYBERX_SLUG ? { effect_version: CYBERX_EFFECT_VERSION } : {}),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL" },
      { status: 502 }
    )
  }

  return NextResponse.json({ url: session.url })
}
