/**
 * Sanity CMS Seed Script
 *
 * Migrates static data from the original XYZ London site to Sanity CMS.
 * Safe to re-run: existing Studio documents (and their images) are never replaced.
 *
 * Usage:
 *   SANITY_TOKEN=<write-token> npx tsx seed.ts
 *
 * Or via npm script:
 *   SANITY_TOKEN=<write-token> npm run seed
 *
 * To get a write token:
 *   1. Go to https://sanity.io/manage/project/bff91fb2
 *   2. Navigate to API > Tokens
 *   3. Create a token with "Editor" or "Admin" permissions
 */

import { createClient } from '@sanity/client'

// Configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'bff91fb2'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_TOKEN

if (!token) {
  console.error('Error: SANITY_TOKEN environment variable is required')
  console.error('Usage: SANITY_TOKEN=<your-token> npx tsx seed.ts')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ============================================================================
// DATA DEFINITIONS
// ============================================================================

// Journal Posts - migrated from Journal.tsx
const journalPosts = [
  // Editorials
  {
    _id: 'journal-architecture-of-void',
    _type: 'journalPost',
    title: 'The Architecture of Void',
    slug: { _type: 'slug', current: 'the-architecture-of-void' },
    category: 'Theory',
    featuredShape: 'triangle',
    excerpt: 'Exploring the negative space between form and function, where identity exists in absence rather than presence.',
    publishedAt: '2026-12-01T00:00:00Z',
    isFeatured: true,
    body: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'intro-span',
            text: 'Coming soon.',
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _id: 'journal-material-and-memory',
    _type: 'journalPost',
    title: 'Material & Memory',
    slug: { _type: 'slug', current: 'material-and-memory' },
    category: 'Process',
    featuredShape: 'square',
    excerpt: 'How fabric holds history. An investigation into the relationship between textile and time.',
    publishedAt: '2027-01-15T00:00:00Z',
    isFeatured: false,
    body: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'intro-span',
            text: 'Coming soon.',
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _id: 'journal-post-digital-identity',
    _type: 'journalPost',
    title: 'Post-Digital Identity',
    slug: { _type: 'slug', current: 'post-digital-identity' },
    category: 'Dialogue',
    featuredShape: 'circle',
    excerpt: 'A conversation about self-expression in an age where physical and digital selves blur into one.',
    publishedAt: '2027-02-01T00:00:00Z',
    isFeatured: false,
    body: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'intro-span',
            text: 'Coming soon.',
            marks: [],
          },
        ],
      },
    ],
  },
  // Lookbooks
  {
    _id: 'journal-collection-01-genesis',
    _type: 'journalPost',
    title: 'Collection 01: Genesis',
    slug: { _type: 'slug', current: 'collection-01-genesis' },
    category: 'Lookbook',
    featuredShape: 'trapezoid',
    excerpt: 'The inaugural collection. A visual narrative of beginnings, structures, and the birth of form.',
    publishedAt: '2026-09-01T00:00:00Z',
    isFeatured: true,
    body: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'intro-span',
            text: 'Coming soon.',
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _id: 'journal-x-line-kinetic',
    _type: 'journalPost',
    title: 'X Line: Kinetic',
    slug: { _type: 'slug', current: 'x-line-kinetic' },
    category: 'Campaign',
    featuredShape: 'rhombus',
    excerpt: 'Movement captured. The X Line campaign explores form in motion.',
    publishedAt: '2027-03-01T00:00:00Z',
    isFeatured: false,
    body: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'intro-span',
            text: 'Coming soon.',
            marks: [],
          },
        ],
      },
    ],
  },
]

// Site Settings - migrated from Hero.tsx and Footer.tsx
const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  title: 'XYZ London',
  description:
    'Premium luxury garments and refined headwear designed through craftsmanship, timeless form, elevated proportions, and minimalist expression.',
  seoTitle: 'XYZ London | Premium Luxury Streetwear & Refined Headwear',
  seoDescription:
    'Premium luxury garments and refined headwear designed through craftsmanship, timeless form, elevated proportions, and minimalist expression.',
  organizationDescription:
    'Premium luxury fashion house focused on premium streetwear, refined craftsmanship, elevated garments, headwear, sneakers, and digital fashion innovation.',
  heroHeadline: 'From the unknown to the known.',
  heroSubheadline: 'A fashion house exploring identity through physical and digital expression.',
  socialLinks: {
    instagram: 'https://instagram.com/xyzlondon',
    twitter: 'https://x.com/xyzlondon',
    pinterest: 'https://pinterest.com/xyzlondon',
    email: 'contact@xyzwear.com',
  },
}

// Home Page - migrated from Hero.tsx, Introduction.tsx, Philosophy.tsx, VirtualTryOnSection.tsx, PrivateGate.tsx
const homePage = {
  _id: 'homePage',
  _type: 'homePage',
  seoTitle: 'XYZ London | Premium Luxury Streetwear & Refined Headwear',
  seoDescription:
    'Premium luxury garments and refined headwear designed through craftsmanship, timeless form, elevated proportions, and minimalist expression.',
  // Hero
  heroHeadline: 'From the unknown to the known.',
  heroSubheadline: 'A fashion house exploring identity through physical and digital expression.',
  heroCta: 'Explore Form',
  heroFigureLabels: {
    physical: 'Fig 01. Physical',
    digital: 'Fig 02. Digital',
  },
  // Introduction - v1 single paragraph style
  introText: [
    {
      _type: 'block',
      _key: 'intro-1',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'intro-1-span',
          text: 'XYZ London is a fashion house built on intent. In a world of noise, speed, and constant repetition, we choose restraint. We focus on form, premium material, and proportion — the quiet elements that shape how identity is expressed.',
          marks: [],
        },
      ],
    },
  ],
  // Philosophy / Manifesto section - v1 style with 4 lines
  manifestoLines: [
    'XYZ London exists to uncover identity, not define it.',
    'We believe expression emerges through form, movement, and proportion.',
    'Physical and digital are not opposites — they are parallel expressions.',
    'The greatest discoveries are always found in the unknown.',
  ],
  philosophyCtaLabel: 'DIGITAL FORM PREVIEW',
  // Try-on section
  arFitLabel: 'Try-on',
  arFitTitle: 'See it on you—garments and digital pieces.',
  arFitParagraph:
    'Try-on helps you decide with more context: upload a photo on eligible physical or digital product pages and we composite the piece onto you. A clearer starting point online than catalog shots alone.',
  arFitCtaLabel: 'How it works',
}

const privateExpressionsPage = {
  _id: 'privateExpressionsPage',
  _type: 'privateExpressionsPage',
  seoTitle: 'OOO — Highest Expression | XYZ London',
  seoDescription:
    'OOO is the highest expression of XYZ London. Beyond season and trend—reserved for those who recognise intention.',
  eyebrowLabel: 'OOO',
  headline: 'OOO is the highest expression of XYZ London.',
  focalLine: 'The Few.',
  narrativeParagraph1:
    'OOO exists beyond season and trend. Each piece is formed with deliberate craftsmanship—guided by precision, restraint, and uncompromising standards, released in rare quantity.',
  narrativeParagraph2:
    'Reserved for those who recognise intention and value substance without the need for acknowledgement.',
  closingLine: 'Quiet. Personal. Defined.',
  formIntro: 'Complete the form to express interest',
  hubspotFormUrl: 'https://2fu564.share-eu1.hsforms.com/2QJmK62N_R1miIbA3scmoaw',
  contactEmail: 'contact@wearxyz.co',
  backToHomeLabel: 'Back to home',
  homeTeaserTitle: 'Highest Expression',
  homeTeaserLine1: 'OOO is the highest expression of XYZ London.',
  homeTeaserLine2: 'Quiet. Personal. Defined.',
  homeTeaserButtonLabel: 'Proceed',
}

const siteFooter = {
  _id: 'siteFooter',
  _type: 'siteFooter',
  brandSectionHeading: 'Brand Philosophy',
  brandBodyLines: [
    'XYZ London exists to uncover identity through form.',
    'We believe in expression through movement, proportion, and restraint.',
    'Our garments are designed for longevity, not trends.',
    'Our digital expressions explore identity beyond physical constraints.',
  ],
  brandStoryLinkLabel: 'Read Our Story',
  brandStoryLinkPath: '/about',
  productSectionHeading: 'Product',
  productItems: [
    { _key: 'p1', label: 'Highest Expression', internalPath: '/private-expressions' },
    { _key: 'p2', label: 'Materials: Sustainable fabrics' },
    { _key: 'p3', label: 'Care: Longevity focused' },
    { _key: 'p4', label: 'Archive: 2024 - 2026' },
  ],
  legalSectionHeading: 'Legal',
  legalLinks: [
    { _key: 'l1', label: 'Terms of Service', path: '/content/terms-of-use' },
    { _key: 'l2', label: 'Privacy Policy', path: '/content/privacy-policy' },
    { _key: 'l3', label: 'Shipping Policy', path: '/content/shipping-policy' },
    { _key: 'l4', label: 'Cookie Settings', path: '/content/privacy-policy#cookies' },
  ],
  connectSectionHeading: 'Connect',
  connectLinks: [
    { _key: 'c1', label: 'Contact', href: '/contact' },
    { _key: 'c2', label: 'Instagram', href: 'https://instagram.com' },
    { _key: 'c3', label: 'Twitter / X', href: 'https://x.com' },
    { _key: 'c4', label: 'contact@wearxyz.co', href: 'mailto:contact@wearxyz.co' },
  ],
  bottomTagline: 'Physical / Digital',
  copyrightName: 'XYZ London',
}

const aboutPage = {
  _id: 'aboutPage',
  _type: 'aboutPage',
  label: 'Identity & Form',
  title: 'ABOUT US',
  leadQuote: 'XYZ London is a fashion house built on intent.',
  bodyParagraphs: [
    {
      _key: 'body-1',
      column: 'left',
      text: 'In a world of noise, speed, and constant repetition, we choose restraint. We do not chase trends or mass attention. Instead, we focus on form, premium material, and proportion — the quiet elements that shape how identity is expressed.',
    },
    {
      _key: 'body-2',
      column: 'left',
      text: 'XYZ London exists to uncover identity, not define it.',
      isHighlighted: true,
    },
    {
      _key: 'body-3',
      column: 'left',
      text: 'We believe expression emerges through form, movement, and proportion — not labels, not gender, not rules imposed from the outside.',
    },
    {
      _key: 'body-4',
      column: 'right',
      text: 'Our garments are designed beyond gender, created to move naturally across different body forms. Each piece is considered for comfort, durability, and longevity — made to be lived in, (not replaced)*.',
    },
    {
      _key: 'body-5',
      column: 'right',
      text: 'Alongside physical garments, XYZ London explores digital expression. Our virtual designs extend identity beyond physical constraints, allowing form and presence to exist in new spaces without limitation. Physical and digital are not opposites to us — they are parallel expressions of the same philosophy.',
    },
  ],
  sustainabilityNote: 'We work with premium sustainable materials and (responsible construction)*, prioritising quality over volume and intention over excess. Every decision is guided by clarity, discipline, and respect for the individual.',
  closingLine1: 'XYZ London is not about fitting in.',
  closingLine2: 'It is about standing as your original self.',
  tagline: 'From the unknown to the known.',
  seoTitle: 'About | XYZ London',
  seoDescription: 'Learn about XYZ London - a fashion house exploring identity through physical and digital expression.',
}

// Try-on page — Sanity document (storefront uses Next.js template at /virtual-try-on)
const arFitPage = {
  _id: 'arFitPage',
  _type: 'arFitPage',
  label: 'Try-on',
  title: 'SEE IT ON YOU FIRST.',
  subtitle: 'Physical garments and digital expressions—upload a photo, get a composite preview,',
  subtitleLine2: 'and decide with more context than flat photos alone.',
  ctaLabel: 'Physical collection',
  philosophyHeadline: 'What try-on does',
  philosophyHeadlineLine2: 'for you',
  philosophyParagraph1:
    'You see the piece on your frame, not only on a model. The same upload-and-preview flow applies on eligible physical PDPs and digital expression pages where enabled.',
  philosophyParagraph2:
    'Use the preview to shortlist, compare, or feel more confident at checkout—especially when you can’t visit in person first.',
  stepsHeading: 'How it works',
  steps: [
    { _key: 'step-1', id: '01', title: 'Upload a photo', description: 'On any product where try-on is available—physical or digital—choose a clear, well-lit picture.', shape: 'circle' },
    { _key: 'step-2', id: '02', title: 'Get a composite preview', description: 'The piece is rendered onto your image so you can judge proportion and presence.', shape: 'hexagon' },
    { _key: 'step-3', id: '03', title: 'Decide with more context', description: 'Add a garment to your bag, or complete checkout on a digital work, with a clearer preview than imagery alone.', shape: 'rhombus' },
  ],
  privacyBadge: 'Privacy-minded',
  privacyText:
    'Try-on uses your photo to generate a preview via our partner service. We don’t use it for marketing or sell your data.',
  versionLabel: 'Availability varies by product and region.',
  seoTitle: 'Try-on | XYZ London',
  seoDescription:
    'How XYZ try-on works for physical and digital pieces: upload a photo, preview the composite, shop with more context.',
}

// Digital Form Page - migrated from DigitalForm.tsx (v1 full content)
const digitalFormPage = {
  _id: 'digitalFormPage',
  _type: 'digitalFormPage',
  collectionLabel: 'Meta / Virtual',
  title: 'DIGITAL FORM',
  description: 'Identity beyond physical constraints. Assets for virtual environments and digital expression.',
  digitalProducts: [
    {
      _key: 'd1',
      slug: { _type: 'slug', current: 'digital-cap-v1' },
      name: 'Digital Cap V1',
      line: 'NFT / Skin',
      category: 'Headwear',
      shape: 'pentagon',
      price: 45,
      currency: 'GBP',
      isFeatured: true,
      platforms: ['Roblox', 'VRChat', 'Ready Player Me'],
    },
    {
      _key: 'd2',
      slug: { _type: 'slug', current: 'digital-cap-v2' },
      name: 'Digital Cap V2',
      line: 'NFT / Skin',
      category: 'Headwear',
      shape: 'hexagon',
      price: 45,
      currency: 'GBP',
      isFeatured: true,
      platforms: ['Roblox', 'Fortnite'],
    },
    {
      _key: 'd3',
      slug: { _type: 'slug', current: 'digital-beanie' },
      name: 'Digital Beanie',
      line: 'Accessory',
      category: 'Headwear',
      shape: 'circle',
      price: 35,
      currency: 'GBP',
      platforms: ['VRChat'],
    },
    {
      _key: 'd4',
      slug: { _type: 'slug', current: 'shell-jacket-a' },
      name: 'Shell Jacket A',
      line: 'Outerwear',
      category: 'Body',
      shape: 'trapezoid',
      price: 85,
      currency: 'GBP',
    },
    {
      _key: 'd5',
      slug: { _type: 'slug', current: 'shell-jacket-b' },
      name: 'Shell Jacket B',
      line: 'Outerwear',
      category: 'Body',
      shape: 'rhombus',
      price: 85,
      currency: 'GBP',
      isComingSoon: true,
    },
    {
      _key: 'd6',
      slug: { _type: 'slug', current: 'kinetics-sneaker' },
      name: 'Kinetics Sneaker',
      line: 'Footwear',
      category: 'Shoes',
      shape: 'triangle',
      price: 65,
      currency: 'GBP',
      isComingSoon: true,
    },
  ],
  seoTitle: 'Digital Form | XYZ London',
  seoDescription: 'Digital expressions exploring identity beyond physical constraints.',
}

const staticPageSeo = {
  _id: 'staticPageSeo',
  _type: 'staticPageSeo',
  store: {
    seoTitle: 'Physical Form | XYZ London',
    seoDescription:
      'Tangible expressions of identity. Architectural fluidity tailored for the human form.',
  },
  journal: {
    seoTitle: 'Journal | XYZ London',
    seoDescription:
      'The narrative of form. A visual archive of our process, inspiration, and dialogue.',
  },
  contact: {
    seoTitle: 'Contact | XYZ London',
    seoDescription:
      'Get in touch with XYZ London — orders, support, returns, and general enquiries.',
  },
  termsOfUse: {
    seoTitle: 'Terms of Service | XYZ London',
    seoDescription:
      'Terms governing use of the XYZ London website and services, including OOO.',
  },
  privacyPolicy: {
    seoTitle: 'Privacy Policy | XYZ London',
    seoDescription:
      'How XYZ London collects, uses, and protects your personal data when you use our website and services, including OOO.',
  },
  shippingPolicy: {
    seoTitle: 'Shipping Policy | XYZ London',
    seoDescription:
      'Shipping, processing, duties, tracking, and OOO timelines for XYZ London orders.',
  },
  cart: {
    seoTitle: 'Cart | XYZ London',
    seoDescription: 'Review items in your XYZ London cart before checkout.',
  },
  checkout: {
    seoTitle: 'Checkout | XYZ London',
    seoDescription:
      'Complete your XYZ London order — shipping and secure payment.',
  },
  search: {
    seoTitle: 'Search | XYZ London',
    seoDescription:
      'Explore premium luxury streetwear and refined headwear from XYZ London.',
  },
  notFound: {
    seoTitle: 'Page Not Found | XYZ London',
    seoDescription: 'The page you tried to access does not exist.',
  },
}


// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Never replace an existing Studio document. createOrReplace wipes fields the
 * seed payload omits (especially images), which looks like Sanity "deleted"
 * assets even though the files are still in the dataset, unreferenced.
 */
async function createIfMissing(
  doc: { _id: string },
  label: string
): Promise<'created' | 'skipped'> {
  const existingId = await client.fetch<string | null>(`*[_id == $id][0]._id`, {
    id: doc._id,
  })
  if (existingId) {
    console.log(`  [SKIP] ${label} already exists — keeping Studio edits (including images)`)
    return 'skipped'
  }
  await client.create(doc)
  console.log(`  [OK] ${label}`)
  return 'created'
}

async function seedJournalPosts() {
  console.log('\n--- Seeding Journal Posts ---')

  for (const post of journalPosts) {
    try {
      await createIfMissing(post, `${post.title} (${post.category})`)
    } catch (error) {
      console.error(`  [FAIL] ${post.title}:`, error)
    }
  }

  console.log(`\nJournal Posts: ${journalPosts.length} documents`)
}

async function seedSiteSettings() {
  console.log('\n--- Seeding Site Settings ---')

  try {
    await createIfMissing(siteSettings, 'Site Settings')
  } catch (error) {
    console.error(`  [FAIL] Site Settings:`, error)
  }

  console.log(`\nSite Settings: 1 document`)
}

async function seedHomePage() {
  console.log('\n--- Seeding Home Page ---')

  try {
    await createIfMissing(homePage, 'Home Page')
  } catch (error) {
    console.error(`  [FAIL] Home Page:`, error)
  }
}

async function seedAboutPage() {
  console.log('\n--- Seeding About Page ---')

  try {
    await createIfMissing(aboutPage, 'About Page')
  } catch (error) {
    console.error(`  [FAIL] About Page:`, error)
  }
}

async function seedArFitPage() {
  console.log('\n--- Seeding Try-on page ---')

  try {
    await createIfMissing(arFitPage, 'Try-on page')
  } catch (error) {
    console.error(`  [FAIL] Try-on page:`, error)
  }
}

type SeededDigitalProduct = (typeof digitalFormPage.digitalProducts)[number]

async function seedDigitalFormPage() {
  console.log('\n--- Seeding Digital Form Page ---')

  try {
    const existing = await client.fetch<{
      _id: string
      digitalProducts?: { _key?: string }[]
    } | null>(`*[_id == $id][0]{ _id, digitalProducts[]{ _key } }`, {
      id: digitalFormPage._id,
    })

    if (!existing) {
      await client.create(digitalFormPage)
      console.log(`  [OK] Digital Form Page`)
      return
    }

    const existingKeys = new Set(
      (existing.digitalProducts ?? [])
        .map((p) => p._key)
        .filter((k): k is string => typeof k === 'string' && k.length > 0)
    )
    const toAdd = digitalFormPage.digitalProducts.filter(
      (p: SeededDigitalProduct) => !existingKeys.has(p._key)
    )

    if (toAdd.length === 0) {
      console.log(
        '  [SKIP] Digital Form Page already exists — keeping Studio images and product edits'
      )
      return
    }

    await client
      .patch(digitalFormPage._id)
      .setIfMissing({ digitalProducts: [] })
      .insert('after', 'digitalProducts[-1]', toAdd)
      .commit()
    console.log(
      `  [OK] Digital Form Page — added ${toAdd.length} missing product(s), left existing images untouched`
    )
  } catch (error) {
    console.error(`  [FAIL] Digital Form Page:`, error)
  }
}

async function seedPrivateExpressionsPage() {
  console.log('\n--- Seeding Private Expressions (OOO) ---')

  try {
    await createIfMissing(privateExpressionsPage, 'Private Expressions')
  } catch (error) {
    console.error(`  [FAIL] Private Expressions:`, error)
  }
}

async function seedSiteFooterDoc() {
  console.log('\n--- Seeding Site footer ---')

  try {
    await createIfMissing(siteFooter, 'Site footer')
  } catch (error) {
    console.error(`  [FAIL] Site footer:`, error)
  }
}

async function seedStaticPageSeo() {
  console.log('\n--- Seeding Static Page SEO ---')

  try {
    await createIfMissing(staticPageSeo, 'Static Page SEO')
  } catch (error) {
    console.error(`  [FAIL] Static Page SEO:`, error)
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60))
  console.log('XYZ London - Sanity CMS Seed Script')
  console.log('='.repeat(60))
  console.log(`\nProject ID: ${projectId}`)
  console.log(`Dataset: ${dataset}`)
  console.log(`API Version: 2024-01-01`)

  const startTime = Date.now()

  await seedJournalPosts()
  await seedSiteSettings()
  await seedHomePage()
  await seedAboutPage()
  await seedArFitPage()
  await seedDigitalFormPage()
  await seedPrivateExpressionsPage()
  await seedSiteFooterDoc()
  await seedStaticPageSeo()

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

  const totalDocuments = journalPosts.length + 8

  console.log('\n' + '='.repeat(60))
  console.log('SEED COMPLETE')
  console.log('='.repeat(60))
  console.log('\nDocument Summary:')
  console.log(`  - Journal Posts: ${journalPosts.length}`)
  console.log(`  - Site Settings: 1`)
  console.log(`  - Home Page: 1`)
  console.log(`  - About Page: 1`)
  console.log(`  - Try-on page: 1`)
  console.log(`  - Digital Form Page: 1`)
  console.log(`  - Private Expressions (OOO): 1`)
  console.log(`  - Site footer: 1`)
  console.log(`  - Static Page SEO: 1`)
  console.log(`\nTotal documents: ${totalDocuments}`)
  console.log(`Time: ${elapsed}s`)
  console.log('\nNext steps:')
  console.log('  1. Open Sanity Studio: npm run dev')
  console.log('  2. Verify content in the CMS')
  console.log('  3. Add images via the Studio')
  console.log('  4. Update frontend components to fetch from Sanity')
}

main().catch((error) => {
  console.error('\nSeed script failed:', error)
  process.exit(1)
})
