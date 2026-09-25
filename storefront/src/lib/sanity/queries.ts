import "server-only"

import { cache } from "react"

import type {
  DigitalFormPageSanity,
  DigitalProductDetailSanity,
  JournalEntry,
  HomePageSanity,
  AboutPageSanity,
  ArFitPageSanity,
  PrivateExpressionsPageSanity,
  SiteFooterSanity,
  SiteSettingsSanity,
  StaticPageSeoSanity,
} from "@/types/xyz"

import {
  normalizeDigitalPdpSlug,
  resolveDigitalSlugFromCatalog,
} from "@lib/digital/normalize-digital-slug"

import { getSanityClient } from "./client"

const journalEntriesQuery = `{
  "editorials": *[_type == "journalPost" && category in ["Theory", "Process", "Dialogue"]] | order(publishedAt desc) {
    "id": _id,
    "slug": slug.current,
    title,
    category,
    "date": publishedAt,
    "shape": featuredShape,
    excerpt
  },
  "lookbooks": *[_type == "journalPost" && category in ["Lookbook", "Campaign"]] | order(publishedAt desc) {
    "id": _id,
    "slug": slug.current,
    title,
    category,
    "date": publishedAt,
    "shape": featuredShape,
    excerpt
  }
}`

const digitalFormPageQuery = `*[_type == "digitalFormPage"][0] {
  collectionLabel,
  title,
  description,
  seoTitle,
  seoDescription,
  digitalProducts[] {
    _key,
    "slug": slug.current,
    name,
    line,
    category,
    description,
    shape,
    statusLabel,
    price,
    currency,
    isFeatured,
    isComingSoon,
    platforms,
    medusaHandle,
    externalLinks,
    "previewImage": images[0].asset->url,
    "galleryImages": images[].asset->url
  }
}`

const digitalProductFields = `
    _key,
    "slug": coalesce(slug.current, _key),
    name,
    line,
    category,
    description,
    shape,
    statusLabel,
    price,
    currency,
    isFeatured,
    isComingSoon,
    platforms,
    medusaHandle,
    externalLinks,
    "previewImage": images[0].asset->url,
    "galleryImages": images[].asset->url
`

const digitalProductBySlugQuery = `*[_type == "digitalFormPage"][0] {
  collectionLabel,
  title,
  description,
  "product": digitalProducts[
    slug.current == $slug
    || _key == $slug
    || (defined(slug.current) && slug.current == "digital/" + $slug)
    || (defined(slug.current) && slug.current == "digital-" + $slug)
  ][0] {
    ${digitalProductFields}
  }
}`

const digitalProductByKeyQuery = `*[_type == "digitalFormPage"][0] {
  collectionLabel,
  title,
  description,
  "product": digitalProducts[_key == $key][0] {
    ${digitalProductFields}
  }
}`

const digitalFormProductSlugListQuery = `*[_type == "digitalFormPage"][0]{
  "items": digitalProducts[]{
    "_key": _key,
    "c": coalesce(slug.current, _key)
  }
}`

const journalPostQuery = `*[_type == "journalPost" && slug.current == $slug][0] {
  "id": _id,
  "slug": slug.current,
  seoTitle,
  seoDescription,
  title,
  category,
  "date": publishedAt,
  "shape": featuredShape,
  excerpt,
  body[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url,
      "dimensions": asset->metadata.dimensions
    }
  },
  "featuredImage": featuredImage.asset->url,
  "featuredImageAspect": featuredImage.asset->metadata.dimensions.aspectRatio,
  isFeatured
}`

export type JournalIndexResult = {
  editorials: JournalEntry[]
  lookbooks: JournalEntry[]
  sanityConfigured: boolean
  fetchError: boolean
}

export async function getJournalEntries(): Promise<JournalIndexResult> {
  const client = getSanityClient()
  if (!client) {
    return {
      editorials: [],
      lookbooks: [],
      sanityConfigured: false,
      fetchError: false,
    }
  }

  try {
    const data = await client.fetch<{
      editorials: JournalEntry[]
      lookbooks: JournalEntry[]
    }>(journalEntriesQuery)
    return {
      editorials: data?.editorials ?? [],
      lookbooks: data?.lookbooks ?? [],
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity journal entries fetch error:", e)
    return {
      editorials: [],
      lookbooks: [],
      sanityConfigured: true,
      fetchError: true,
    }
  }
}

export type DigitalFormPageResult = {
  page: DigitalFormPageSanity | null
  sanityConfigured: boolean
  fetchError: boolean
}

export async function getDigitalFormPage(): Promise<DigitalFormPageResult> {
  const client = getSanityClient()
  if (!client) {
    return { page: null, sanityConfigured: false, fetchError: false }
  }

  try {
    const page = await client.fetch<DigitalFormPageSanity | null>(
      digitalFormPageQuery
    )
    return {
      page: page ?? null,
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity digital form page fetch error:", e)
    return { page: null, sanityConfigured: true, fetchError: true }
  }
}

export type DigitalProductPageResult = {
  collectionLabel?: string | null
  title?: string | null
  description?: string | null
  product: DigitalProductDetailSanity | null
}

export async function getDigitalProductBySlug(
  slug: string
): Promise<{
  data: DigitalProductPageResult | null
  sanityConfigured: boolean
  fetchError: boolean
}> {
  const client = getSanityClient()
  if (!client) {
    return { data: null, sanityConfigured: false, fetchError: false }
  }

  const normalizedSlug = normalizeDigitalPdpSlug(slug)
  if (!normalizedSlug) {
    return { data: null, sanityConfigured: true, fetchError: false }
  }

  try {
    let data = await client.fetch<DigitalProductPageResult | null>(
      digitalProductBySlugQuery,
      { slug: normalizedSlug }
    )

    let slugRows: {
      items?: { _key?: string; c?: string | null }[] | null
    } | null = null

    if (!data?.product) {
      slugRows = await client.fetch<{
        items?: { _key?: string; c?: string | null }[] | null
      } | null>(digitalFormProductSlugListQuery)

      const items = slugRows?.items ?? []
      const hit = items.find((row) => {
        if (!row.c || typeof row.c !== "string") {
          return false
        }
        return normalizeDigitalPdpSlug(row.c) === normalizedSlug
      })
      if (hit?._key) {
        data = await client.fetch<DigitalProductPageResult | null>(
          digitalProductByKeyQuery,
          { key: hit._key }
        )
      }

      if (!data?.product) {
        const catalog = items
          .map((row) => row.c)
          .filter((c): c is string => typeof c === "string" && c.length > 0)
        const resolved = resolveDigitalSlugFromCatalog(
          normalizedSlug,
          catalog
        )
        if (resolved && resolved !== normalizedSlug) {
          data = await client.fetch<DigitalProductPageResult | null>(
            digitalProductBySlugQuery,
            { slug: resolved }
          )
        }
      }
    }

    if (!data?.product) {
      return { data: null, sanityConfigured: true, fetchError: false }
    }
    const canon =
      normalizeDigitalPdpSlug(
        (data.product.slug || data.product._key || "") as string
      ) || normalizedSlug
    return {
      data: {
        ...data,
        product: { ...data.product, slug: canon },
      },
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity digital product fetch error:", e)
    return { data: null, sanityConfigured: true, fetchError: true }
  }
}

export async function getJournalPost(
  slug: string
): Promise<JournalEntry | null> {
  const client = getSanityClient()
  if (!client) {
    return null
  }

  try {
    const post = await client.fetch<JournalEntry | null>(journalPostQuery, {
      slug,
    })
    return post
  } catch (e) {
    console.error("Sanity journal post fetch error:", e)
    return null
  }
}

// ============ Home Page ============

const homePageQuery = `*[_type == "homePage"][0] {
  seoTitle,
  seoDescription,
  heroHeadline,
  heroSubheadline,
  heroCta,
  heroFigureLabels {
    physical,
    digital
  },
  introLabel,
  introHeadline,
  introHeadlineAccent,
  introParagraph,
  introText,
  philosophyTitle,
  philosophyComingLabel,
  philosophyParagraph1,
  philosophyParagraph2,
  philosophyCtaLabel,
  manifestoLines,
  arFitLabel,
  arFitTitle,
  arFitParagraph,
  arFitCtaLabel
}`

export type HomePageResult = {
  page: HomePageSanity | null
  sanityConfigured: boolean
  fetchError: boolean
}

export const getHomePage = cache(async function getHomePage(): Promise<HomePageResult> {
  const client = getSanityClient()
  if (!client) {
    return { page: null, sanityConfigured: false, fetchError: false }
  }

  try {
    const page = await client.fetch<HomePageSanity | null>(homePageQuery)
    return {
      page: page ?? null,
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity home page fetch error:", e)
    return { page: null, sanityConfigured: true, fetchError: true }
  }
})

// ============ About Page ============

const aboutPageQuery = `*[_type == "aboutPage"][0] {
  label,
  title,
  leadQuote,
  bodyParagraphs[] {
    _key,
    text,
    column,
    isHighlighted
  },
  sustainabilityNote,
  closingLine1,
  closingLine2,
  tagline,
  seoTitle,
  seoDescription
}`

export type AboutPageResult = {
  page: AboutPageSanity | null
  sanityConfigured: boolean
  fetchError: boolean
}

export async function getAboutPage(): Promise<AboutPageResult> {
  const client = getSanityClient()
  if (!client) {
    return { page: null, sanityConfigured: false, fetchError: false }
  }

  try {
    const page = await client.fetch<AboutPageSanity | null>(aboutPageQuery)
    return {
      page: page ?? null,
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity about page fetch error:", e)
    return { page: null, sanityConfigured: true, fetchError: true }
  }
}

// ============ AR Fit (Virtual Try-On) Page ============

const arFitPageQuery = `*[_type == "arFitPage"][0] {
  label,
  title,
  subtitle,
  subtitleLine2,
  ctaLabel,
  philosophyHeadline,
  philosophyHeadlineLine2,
  philosophyParagraph1,
  philosophyParagraph2,
  stepsHeading,
  steps[] {
    _key,
    id,
    title,
    description,
    shape
  },
  privacyBadge,
  privacyText,
  versionLabel,
  seoTitle,
  seoDescription
}`

export type ArFitPageResult = {
  page: ArFitPageSanity | null
  sanityConfigured: boolean
  fetchError: boolean
}

export async function getArFitPage(): Promise<ArFitPageResult> {
  const client = getSanityClient()
  if (!client) {
    return { page: null, sanityConfigured: false, fetchError: false }
  }

  try {
    const page = await client.fetch<ArFitPageSanity | null>(arFitPageQuery)
    return {
      page: page ?? null,
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity AR fit page fetch error:", e)
    return { page: null, sanityConfigured: true, fetchError: true }
  }
}

// ============ Private expressions (OOO) ============

// Full document projections — avoids field mismatches vs Studio drafts / older payloads.
const privateExpressionsPageQuery = `*[_type == "privateExpressionsPage"][0]`


export type PrivateExpressionsPageResult = {
  page: PrivateExpressionsPageSanity | null
  sanityConfigured: boolean
  fetchError: boolean
}

export async function getPrivateExpressionsPage(): Promise<PrivateExpressionsPageResult> {
  const client = getSanityClient()
  if (!client) {
    return { page: null, sanityConfigured: false, fetchError: false }
  }

  try {
    const page = await client.fetch<PrivateExpressionsPageSanity | null>(
      privateExpressionsPageQuery
    )
    return {
      page: page ?? null,
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    const detail =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : String(e)
    console.error(
      "Sanity private expressions page fetch error:",
      detail,
      e instanceof Error ? e.stack : ""
    )
    return { page: null, sanityConfigured: true, fetchError: true }
  }
}

// ============ Site footer ============

const siteFooterQuery = `*[_type == "siteFooter"][0]`

export type SiteFooterResult = {
  footer: SiteFooterSanity | null
  sanityConfigured: boolean
  fetchError: boolean
}

export async function getSiteFooter(): Promise<SiteFooterResult> {
  const client = getSanityClient()
  if (!client) {
    return { footer: null, sanityConfigured: false, fetchError: false }
  }

  try {
    const footer = await client.fetch<SiteFooterSanity | null>(siteFooterQuery)
    return {
      footer: footer ?? null,
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity site footer fetch error:", e)
    return { footer: null, sanityConfigured: true, fetchError: true }
  }
}

// ============ Site settings (global SEO) ============

const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  title,
  description,
  seoTitle,
  seoDescription,
  organizationDescription,
  "logoUrl": logo.asset->url,
  "ogImage": ogImage.asset->url,
  "twitterImage": twitterImage.asset->url,
  socialLinks {
    instagram,
    tiktok,
    email
  }
}`

export type SiteSettingsResult = {
  settings: SiteSettingsSanity | null
  sanityConfigured: boolean
  fetchError: boolean
}

export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettingsResult> {
  const client = getSanityClient()
  if (!client) {
    return { settings: null, sanityConfigured: false, fetchError: false }
  }

  try {
    const settings = await client.fetch<SiteSettingsSanity | null>(
      siteSettingsQuery
    )
    return {
      settings: settings ?? null,
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity site settings fetch error:", e)
    return { settings: null, sanityConfigured: true, fetchError: true }
  }
})

// ============ Static page SEO ============

const staticPageSeoQuery = `*[_type == "staticPageSeo"][0] {
  store { seoTitle, seoDescription },
  journal { seoTitle, seoDescription },
  contact { seoTitle, seoDescription },
  termsOfUse { seoTitle, seoDescription },
  privacyPolicy { seoTitle, seoDescription },
  shippingPolicy { seoTitle, seoDescription },
  cart { seoTitle, seoDescription },
  checkout { seoTitle, seoDescription },
  search { seoTitle, seoDescription },
  notFound { seoTitle, seoDescription }
}`

export type StaticPageSeoResult = {
  pages: StaticPageSeoSanity | null
  sanityConfigured: boolean
  fetchError: boolean
}

export const getStaticPageSeo = cache(async function getStaticPageSeo(): Promise<StaticPageSeoResult> {
  const client = getSanityClient()
  if (!client) {
    return { pages: null, sanityConfigured: false, fetchError: false }
  }

  try {
    const pages = await client.fetch<StaticPageSeoSanity | null>(
      staticPageSeoQuery
    )
    return {
      pages: pages ?? null,
      sanityConfigured: true,
      fetchError: false,
    }
  } catch (e) {
    console.error("Sanity static page SEO fetch error:", e)
    return { pages: null, sanityConfigured: true, fetchError: true }
  }
})
