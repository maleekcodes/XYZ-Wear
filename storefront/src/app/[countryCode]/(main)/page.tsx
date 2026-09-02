import { buildPageMetadata } from "@lib/seo/metadata"
import { getGlobalSeoSettings } from "@lib/seo/sanity"
import { SITE_DESCRIPTION, SITE_TITLE_DEFAULT } from "@lib/seo/site"
import { Metadata } from "next"

import { Hero } from "@modules/home/components/xyz/Hero"
import { Introduction } from "@modules/home/components/xyz/Introduction"
import { Collection } from "@modules/home/components/xyz/Collection"
import { Philosophy } from "@modules/home/components/xyz/Philosophy"
import { VirtualTryOnSection } from "@modules/home/components/xyz/VirtualTryOnSection"
import { PrivateGate } from "@modules/home/components/xyz/PrivateGate"
import { listCategories } from "@lib/data/categories"
import {
  getPhysicalStoreCatalogProducts,
  getProductsById,
} from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  getHomePage,
  getPrivateExpressionsPage,
} from "@lib/sanity/queries"
import { mapPhysicalHomeCollection } from "@modules/home/lib/map-categories-to-collection"

export async function generateMetadata(): Promise<Metadata> {
  const [global, homePageResult] = await Promise.all([
    getGlobalSeoSettings(),
    getHomePage(),
  ])
  const page = homePageResult.page

  return buildPageMetadata(
    {
      title: page?.seoTitle?.trim() || SITE_TITLE_DEFAULT,
      description: page?.seoDescription?.trim() || SITE_DESCRIPTION,
      path: "/",
    },
    global
  )
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  const [homePageResult, peeResult, categories, products] = await Promise.all([
    getHomePage(),
    getPrivateExpressionsPage(),
    listCategories(),
    getPhysicalStoreCatalogProducts({
      sortBy: "created_at",
      countryCode,
    }),
  ])

  const page = homePageResult.page
  const pee = peeResult.page
  const region = await getRegion(countryCode)
  const ids = products.map((product) => product.id).filter(Boolean) as string[]
  const priced =
    region && ids.length > 0
      ? await getProductsById({ ids, regionId: region.id })
      : products
  const pricedById = new Map(priced.map((product) => [product.id, product]))
  const enriched = products.map(
    (product) => (product.id ? pricedById.get(product.id) : null) ?? product
  )
  const homeCollection = mapPhysicalHomeCollection(enriched, categories)

  return (
    <>
      <div id="hero">
        <Hero
          headline={page?.heroHeadline ?? undefined}
          subheadline={page?.heroSubheadline ?? undefined}
          cta={page?.heroCta ?? undefined}
          figureLabels={
            page?.heroFigureLabels
              ? {
                  physical: page.heroFigureLabels.physical ?? undefined,
                  digital: page.heroFigureLabels.digital ?? undefined,
                }
              : undefined
          }
        />
      </div>
      <div id="intro">
        <Introduction text={page?.introText ?? undefined} />
      </div>
      <div id="physical">
        <Collection layout={homeCollection} />
      </div>

      <div id="digital">
        <Philosophy
          lines={page?.manifestoLines ?? undefined}
          ctaLabel={page?.philosophyCtaLabel ?? undefined}
        />
      </div>
      <div id="virtual-try-on">
        <VirtualTryOnSection
          label={page?.arFitLabel ?? undefined}
          title={page?.arFitTitle ?? undefined}
          paragraph={page?.arFitParagraph ?? undefined}
          ctaLabel={page?.arFitCtaLabel ?? undefined}
        />
      </div>
      <div id="private">
        <PrivateGate
          title={pee?.homeTeaserTitle ?? undefined}
          teaserLine1={pee?.homeTeaserLine1 ?? undefined}
          teaserLine2={pee?.homeTeaserLine2 ?? undefined}
          buttonLabel={pee?.homeTeaserButtonLabel ?? undefined}
        />
      </div>
    </>
  )
}
