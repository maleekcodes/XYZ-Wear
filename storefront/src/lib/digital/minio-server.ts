import "server-only"

import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { parsePhysicalTryonSlugKey } from "./physical-tryon-slug"

function parseEndpoint(): string | null {
  const raw =
    process.env.MINIO_SERVER_URL?.trim() ||
    process.env.MINIO_ENDPOINT?.trim() ||
    process.env.DIGITAL_MINIO_ENDPOINT?.trim()
  if (!raw) {
    return null
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw
  }
  const proto = process.env.MINIO_USE_SSL === "false" ? "http" : "https"
  return `${proto}://${raw}`
}

let clientRef: S3Client | null = null

export function isMinioConfigured(): boolean {
  return !!(
    parseEndpoint() &&
    process.env.MINIO_ACCESS_KEY?.trim() &&
    process.env.MINIO_SECRET_KEY?.trim()
  )
}

export function getDigitalS3Client(): S3Client {
  if (clientRef) {
    return clientRef
  }
  const endpoint = parseEndpoint()
  if (!endpoint) {
    throw new Error("MinIO endpoint not configured")
  }
  clientRef = new S3Client({
    endpoint,
    region: process.env.MINIO_REGION?.trim() || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  })
  return clientRef
}

export function digitalTryonBucket(): string {
  return process.env.MINIO_BUCKET?.trim() || "medusa-media"
}

export function digitalTryonObjectKey(
  slug: string,
  predictionId: string
): string {
  const safeSlug = slug.replace(/[^a-z0-9-_]/gi, "")
  return `digital-tryon/${safeSlug}/${predictionId}.png`
}

export function physicalTryonObjectKey(
  countryCode: string,
  handle: string,
  predictionId: string
): string {
  const cc = countryCode.toLowerCase().replace(/[^a-z]/g, "").slice(0, 2) || "us"
  const safeHandle = handle.replace(/[^a-z0-9-_]/gi, "")
  return `physical-tryon/${cc}/${safeHandle}/${predictionId}.png`
}

/** Resolve MinIO object key from try-on slug (digital Sanity slug vs `pt-{cc}-{handle}`). */
export function tryonObjectKeyFromSlug(slug: string, predictionId: string): string {
  const p = parsePhysicalTryonSlugKey(slug)
  if (p) {
    return physicalTryonObjectKey(p.countryCode, p.handle, predictionId)
  }
  return digitalTryonObjectKey(slug, predictionId)
}

export async function putTryonImageFromUrl(
  key: string,
  sourceUrl: string
): Promise<void> {
  const res = await fetch(sourceUrl)
  if (!res.ok) {
    throw new Error(`Failed to fetch try-on output: ${res.status}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get("content-type") || "image/png"
  const client = getDigitalS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: digitalTryonBucket(),
      Key: key,
      Body: buf,
      ContentType: contentType,
    })
  )
}

export async function putTryonImageBuffer(
  key: string,
  image: Buffer,
  effectVersion?: string
): Promise<void> {
  await getDigitalS3Client().send(
    new PutObjectCommand({
      Bucket: digitalTryonBucket(),
      Key: key,
      Body: image,
      ContentType: "image/png",
      ...(effectVersion ? { Metadata: { "effect-version": effectVersion } } : {}),
    })
  )
}

export async function tryonObjectExists(key: string): Promise<boolean> {
  if (!isMinioConfigured()) {
    return false
  }
  try {
    const client = getDigitalS3Client()
    await client.send(
      new HeadObjectCommand({
        Bucket: digitalTryonBucket(),
        Key: key,
      })
    )
    return true
  } catch {
    return false
  }
}

export async function tryonObjectEffectVersion(key: string): Promise<string | null> {
  if (!isMinioConfigured()) return null
  try {
    const head = await getDigitalS3Client().send(
      new HeadObjectCommand({ Bucket: digitalTryonBucket(), Key: key })
    )
    return head.Metadata?.["effect-version"] || null
  } catch {
    return null
  }
}

export async function getTryonObjectBuffer(key: string): Promise<Buffer | null> {
  if (!isMinioConfigured()) {
    return null
  }
  try {
    const client = getDigitalS3Client()
    const res = await client.send(
      new GetObjectCommand({
        Bucket: digitalTryonBucket(),
        Key: key,
      })
    )
    const stream = res.Body
    if (!stream) {
      return null
    }
    const chunks: Uint8Array[] = []
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  } catch {
    return null
  }
}

export async function presignTryonDownload(
  key: string,
  expiresSeconds = 300
): Promise<string> {
  const client = getDigitalS3Client()
  const cmd = new GetObjectCommand({
    Bucket: digitalTryonBucket(),
    Key: key,
  })
  return getSignedUrl(client, cmd, { expiresIn: expiresSeconds })
}
