import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"

import {
  digitalTryonObjectKey,
  presignTryonDownload,
  tryonObjectExists,
} from "@lib/digital/minio-server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured" },
      { status: 503 }
    )
  }

  const url = new URL(request.url)
  const sessionId = url.searchParams.get("session_id")?.trim()
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 })
  }

  const stripe = new Stripe(secret, { typescript: true })
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 })
  }

  if (
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid"
  ) {
    return NextResponse.json({ error: "Payment not completed" }, { status: 403 })
  }

  const slug = session.metadata?.slug?.trim()
  const predictionId = session.metadata?.prediction_id?.trim()
  if (!slug || !predictionId) {
    return NextResponse.json({ error: "Session metadata incomplete" }, { status: 400 })
  }

  const key =
    session.metadata?.minio_key?.trim() ||
    digitalTryonObjectKey(slug, predictionId)

  const exists = await tryonObjectExists(key)
  if (!exists) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const hdrs = await headers()
  const accept = hdrs.get("accept") || ""
  const signed = await presignTryonDownload(key, 600)

  if (accept.includes("application/json")) {
    return NextResponse.json({ url: signed })
  }

  return NextResponse.redirect(signed)
}
