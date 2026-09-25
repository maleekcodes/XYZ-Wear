import { NextResponse } from "next/server"

import { assertTryOnProductResolvable } from "@lib/digital/load-product-for-api"
import { composeCyberxStill } from "@lib/digital/compose-cyberx-still"
import { CYBERX_EFFECT_VERSION, CYBERX_SLUG } from "@lib/digital/cyberx-effects"
import { normalizeDigitalPdpSlug } from "@lib/digital/normalize-digital-slug"
import {
  isMinioConfigured,
  putTryonImageBuffer,
  putTryonImageFromUrl,
  tryonObjectExists,
  tryonObjectKeyFromSlug,
} from "@lib/digital/minio-server"
import { issueSignedPreviewPath } from "@lib/digital/preview-token"
import {
  getVirtualTryOnApiKey,
  getVirtualTryOnProviderBaseUrl,
} from "@lib/digital/virtual-tryon-config"

export const runtime = "nodejs"
export const maxDuration = 60

type TryOnProviderStatus = {
  id?: string
  status?: string
  output?: string[] | null
  error?: string | null
}

export async function GET(request: Request) {
  const apiKey = getVirtualTryOnApiKey()
  if (!apiKey) {
    return NextResponse.json(
      { error: "Try-on is not configured" },
      { status: 503 }
    )
  }

  const url = new URL(request.url)
  const id = url.searchParams.get("id")?.trim()
  const slug = normalizeDigitalPdpSlug(url.searchParams.get("slug")?.trim() || "")

  if (!id || !slug) {
    return NextResponse.json(
      { error: "id and slug query params are required" },
      { status: 400 }
    )
  }

  try {
    await assertTryOnProductResolvable(slug)
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const statusRes = await fetch(
    `${getVirtualTryOnProviderBaseUrl()}/status/${id}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    }
  )

  const data = (await statusRes.json().catch(() => ({}))) as TryOnProviderStatus

  if (!statusRes.ok) {
    return NextResponse.json(
      { error: "Try-on status request failed", status: "failed" },
      { status: 502 }
    )
  }

  const status = data.status ?? "unknown"
  const output = Array.isArray(data.output) ? data.output : []

  // Only treat the job as failed when the provider reports a failed status.
  // Some payloads may include an `error` field even while processing; gating on
  // `data.error` alone caused HTTP 200 responses that looked like hard failures.
  if (status === "failed") {
    const err =
      typeof data.error === "string" && data.error.trim()
        ? data.error.trim()
        : "Try-on failed"
    return NextResponse.json({
      status: "failed",
      error: err,
    })
  }

  if (status === "completed" && output[0]) {
    // Exact XYZ lettering is drawn locally before preview or purchase.
    if (slug === CYBERX_SLUG) {
      try {
        const sourceRes = await fetch(output[0], { cache: "no-store" })
        if (!sourceRes.ok) throw new Error("Could not load the try-on output")
        const enhanced = await composeCyberxStill(
          Buffer.from(await sourceRes.arrayBuffer())
        )
        if (process.env.NODE_ENV === "development" && !isMinioConfigured()) {
          return NextResponse.json({
            status: "completed",
            persisted: false,
            predictionId: id,
            effectVersion: CYBERX_EFFECT_VERSION,
            previewUrl: `data:image/png;base64,${enhanced.toString("base64")}`,
          })
        }
        if (!isMinioConfigured()) {
          throw new Error("Storage is not configured for enhanced try-on checkout")
        }
        await putTryonImageBuffer(
          tryonObjectKeyFromSlug(slug, id),
          enhanced,
          CYBERX_EFFECT_VERSION
        )
        return NextResponse.json({
          status: "completed",
          persisted: true,
          predictionId: id,
          effectVersion: CYBERX_EFFECT_VERSION,
          previewUrl: issueSignedPreviewPath(slug, id),
        })
      } catch (error) {
        console.error("CyberX effect composition failed:", error)
        return NextResponse.json({
          status: "failed",
          error: "Could not place jacket effects accurately. Try another photo.",
        })
      }
    }

    if (process.env.NODE_ENV === "development" && !isMinioConfigured()) {
      return NextResponse.json({
        status: "completed",
        persisted: false,
        predictionId: id,
        previewUrl: output[0],
      })
    }

    const key = tryonObjectKeyFromSlug(slug, id)
    if (isMinioConfigured()) {
      const exists = await tryonObjectExists(key)
      if (!exists) {
        try {
          await putTryonImageFromUrl(key, output[0])
        } catch (e) {
          console.error("MinIO upload failed:", e)
          return NextResponse.json({
            status: "completed",
            persisted: false,
            error:
              "Could not persist try-on image. Configure MinIO to enable checkout.",
          })
        }
      }
      let previewUrl: string | undefined
      try {
        previewUrl = issueSignedPreviewPath(slug, id)
      } catch (e) {
        console.error("Signed preview URL failed:", e)
        return NextResponse.json({
          status: "completed",
          persisted: true,
          predictionId: id,
          error:
            "Could not build preview URL. Set DIGITAL_PREVIEW_HMAC_SECRET, or STRIPE_WEBHOOK_SECRET / MINIO_SECRET_KEY for signing (and ensure MinIO is reachable).",
        })
      }
      return NextResponse.json({
        status: "completed",
        persisted: true,
        predictionId: id,
        previewUrl,
      })
    }

    return NextResponse.json({
      status: "completed",
      persisted: false,
      predictionId: id,
      error:
        "MinIO is not configured. Set MINIO_* for persisted try-on, preview, and checkout. Raw provider URLs are not exposed to the browser.",
    })
  }

  return NextResponse.json({
    status,
    predictionId: id,
  })
}
