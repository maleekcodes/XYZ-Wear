import type { MetadataRoute } from "next"

import { getBaseURL } from "@lib/util/env"

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

type Entry = {
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[0]["changeFrequency"]>
  priority: number
}

/** Core storefront paths (aligned with xyz-london-v2 IA). */
const STATIC_PATHS: Entry[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/store", changeFrequency: "weekly", priority: 0.9 },
  { path: "/digital", changeFrequency: "weekly", priority: 0.9 },
  { path: "/virtual-try-on", changeFrequency: "monthly", priority: 0.85 },
  { path: "/journal", changeFrequency: "weekly", priority: 0.85 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/private-expressions", changeFrequency: "monthly", priority: 0.6 },
  { path: "/content/privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/content/terms-of-use", changeFrequency: "yearly", priority: 0.4 },
  { path: "/content/shipping-policy", changeFrequency: "yearly", priority: 0.4 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseURL().replace(/\/$/, "")
  const prefix = `${base}/${DEFAULT_REGION}`

  return STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${prefix}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
