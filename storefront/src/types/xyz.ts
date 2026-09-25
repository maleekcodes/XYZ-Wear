export type ShapeType =
  | "circle"
  | "square"
  | "triangle"
  | "rhombus"
  | "trapezoid"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "ellipse"
  | "curve"

export interface JournalEntry extends PageSeoFields {
  id: string
  slug: string
  title: string
  category: string
  date: string
  shape?: ShapeType
  excerpt?: string
  body?: unknown[]
  featuredImage?: string
  featuredImageAspect?: number
  isFeatured?: boolean
}

export type DigitalExternalLinks = {
  opensea?: string | null
  rarible?: string | null
  foundation?: string | null
  custom?: string | null
}

/** Raw `digitalProducts[]` item from GROQ (before Medusa enrichment). */
export type DigitalFormProductSanity = {
  _key?: string
  /** Echo of `_key` for client link fallback (optional in GROQ). */
  sanityKey?: string | null
  /** URL segment for `/digital/[slug]` when set in Sanity. */
  slug?: string | null
  name?: string
  line?: string
  category?: string
  description?: string
  shape?: ShapeType
  statusLabel?: string
  price?: number | null
  currency?: string | null
  previewImage?: string | null
  galleryImages?: string[] | null
  platforms?: string[] | null
  medusaHandle?: string | null
  externalLinks?: DigitalExternalLinks | null
  isFeatured?: boolean | null
  isComingSoon?: boolean | null
}

/** Full digital product for PDP (Sanity). */
export type DigitalProductDetailSanity = DigitalFormProductSanity & {
  slug: string
}

/** Product row used by Digital Form UI (xyz-london-v2 parity). */
export type DigitalFormProductDisplay = {
  id: string
  /** Sanity array item key; used as PDP URL fallback when `slug` is empty and there is no Medusa handle. */
  sanityKey?: string | null
  name: string
  /** When set, links to `/digital/[slug]` for try-on / Stripe purchase. */
  slug?: string | null
  productType: string
  category: string
  shape?: ShapeType
  description?: string
  previewImage?: string | null
  platforms?: string[]
  price?: number | null
  currency?: string | null
  medusaHandle?: string | null
  externalLinks?: DigitalExternalLinks | null
  isFeatured?: boolean
  isComingSoon?: boolean
  statusLabel?: string
  /** When linked to Medusa, cheapest variant formatted price. */
  medusaFromPrice?: string | null
}

export type DigitalFormPageSanity = {
  collectionLabel?: string | null
  title?: string | null
  description?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  digitalProducts?: DigitalFormProductSanity[] | null
}

// ============ Page Content Types ============

export type PageSeoFields = {
  seoTitle?: string | null
  seoDescription?: string | null
}

export type SiteSettingsSanity = {
  title?: string | null
  description?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  logoUrl?: string | null
  ogImage?: string | null
  twitterImage?: string | null
  organizationDescription?: string | null
  socialLinks?: {
    instagram?: string | null
    tiktok?: string | null
    email?: string | null
  } | null
}

export type StaticPageSeoSanity = {
  store?: PageSeoFields | null
  journal?: PageSeoFields | null
  contact?: PageSeoFields | null
  termsOfUse?: PageSeoFields | null
  privacyPolicy?: PageSeoFields | null
  shippingPolicy?: PageSeoFields | null
  cart?: PageSeoFields | null
  checkout?: PageSeoFields | null
  search?: PageSeoFields | null
  notFound?: PageSeoFields | null
}

/** Full home page content from Sanity */
export type HomePageSanity = PageSeoFields & {
  // Hero
  heroHeadline?: string | null
  heroSubheadline?: string | null
  heroCta?: string | null
  heroFigureLabels?: {
    physical?: string | null
    digital?: string | null
  } | null
  // Introduction
  introLabel?: string | null
  introHeadline?: string | null
  introHeadlineAccent?: string | null
  introParagraph?: string | null
  introText?: unknown[] | string | null
  // Philosophy
  philosophyTitle?: string | null
  philosophyComingLabel?: string | null
  philosophyParagraph1?: string | null
  philosophyParagraph2?: string | null
  philosophyCtaLabel?: string | null
  manifestoLines?: string[] | null
  // Try-on section
  arFitLabel?: string | null
  arFitTitle?: string | null
  arFitParagraph?: string | null
  arFitCtaLabel?: string | null
}

/** Singleton: `/private-expressions` + home PrivateGate teaser — source of truth in Studio */
export type PrivateExpressionsPageSanity = {
  seoTitle?: string | null
  seoDescription?: string | null
  eyebrowLabel?: string | null
  headline?: string | null
  focalLine?: string | null
  narrativeParagraph1?: string | null
  narrativeParagraph2?: string | null
  closingLine?: string | null
  formIntro?: string | null
  hubspotFormUrl?: string | null
  contactEmail?: string | null
  backToHomeLabel?: string | null
  homeTeaserTitle?: string | null
  homeTeaserLine1?: string | null
  homeTeaserLine2?: string | null
  homeTeaserButtonLabel?: string | null
}

export type SiteFooterProductItem = {
  _key?: string
  label?: string | null
  internalPath?: string | null
}

export type SiteFooterLegalLink = {
  _key?: string
  label?: string | null
  path?: string | null
}

export type SiteFooterConnectLink = {
  _key?: string
  label?: string | null
  href?: string | null
}

/** Singleton — global footer chrome */
export type SiteFooterSanity = {
  brandSectionHeading?: string | null
  brandBodyLines?: string[] | null
  brandStoryLinkLabel?: string | null
  brandStoryLinkPath?: string | null
  productSectionHeading?: string | null
  productItems?: SiteFooterProductItem[] | null
  legalSectionHeading?: string | null
  legalLinks?: SiteFooterLegalLink[] | null
  connectSectionHeading?: string | null
  connectLinks?: SiteFooterConnectLink[] | null
  bottomTagline?: string | null
  copyrightName?: string | null
}

/** About page body paragraph item */
export type AboutBodyParagraph = {
  _key?: string
  text?: string | null
  column?: "left" | "right" | null
  isHighlighted?: boolean | null
}

/** Full about page content from Sanity */
export type AboutPageSanity = {
  label?: string | null
  title?: string | null
  leadQuote?: string | null
  bodyParagraphs?: AboutBodyParagraph[] | null
  sustainabilityNote?: string | null
  closingLine1?: string | null
  closingLine2?: string | null
  tagline?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
}

/** AR Fit (Virtual Try-On) page step item */
export type ArFitStep = {
  _key?: string
  id?: string | null
  title?: string | null
  description?: string | null
  shape?: ShapeType | null
}

/** Full AR Fit page content from Sanity */
export type ArFitPageSanity = {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  subtitleLine2?: string | null
  ctaLabel?: string | null
  // Philosophy section
  philosophyHeadline?: string | null
  philosophyHeadlineLine2?: string | null
  philosophyParagraph1?: string | null
  philosophyParagraph2?: string | null
  // Steps
  stepsHeading?: string | null
  steps?: ArFitStep[] | null
  // Privacy
  privacyBadge?: string | null
  privacyText?: string | null
  versionLabel?: string | null
  // SEO
  seoTitle?: string | null
  seoDescription?: string | null
}
