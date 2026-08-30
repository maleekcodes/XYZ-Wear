import { Metadata } from "next"

import { buildPageMetadata } from "@lib/seo/metadata"
import { getGlobalSeoSettings, getStaticPageSeoFields } from "@lib/seo/sanity"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export async function generateMetadata(): Promise<Metadata> {
  const [global, seo] = await Promise.all([
    getGlobalSeoSettings(),
    getStaticPageSeoFields("store"),
  ])

  return buildPageMetadata(
    {
      title: seo?.seoTitle ?? "Physical Form | XYZ London",
      description:
        seo?.seoDescription ??
        "Tangible expressions of identity. Architectural fluidity tailored for the human form.",
      path: "/store",
    },
    global
  )
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    category?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage({ searchParams, params }: Params) {
  const [{ sortBy, page, category }, { countryCode }] = await Promise.all([
    searchParams,
    params,
  ])

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      categoryHandle={category}
    />
  )
}
