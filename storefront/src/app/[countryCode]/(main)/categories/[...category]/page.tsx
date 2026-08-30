import { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLineCollectionHandle } from "@lib/util/line-collections"
import { buildPageMetadata } from "@lib/seo/metadata"
import { getGlobalSeoSettings } from "@lib/seo/sanity"
import { SITE_NAME } from "@lib/seo/site"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreProductCategory, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    featured?: string
    collection?: string
    view?: string
  }>
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories
    .filter((category: StoreProductCategory) => !isLineCollectionHandle(category.handle))
    .map((category: StoreProductCategory) => category.handle)

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: any) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { category, countryCode } = await params
    const [global, { product_categories }] = await Promise.all([
      getGlobalSeoSettings(),
      getCategoryByHandle(category),
    ])

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .join(" | ")

    const description =
      product_categories[product_categories.length - 1].description ??
      `${title} — premium luxury category from ${SITE_NAME}.`

    return buildPageMetadata(
      {
        title: `${title} | ${SITE_NAME}`,
        description,
        path: `/${countryCode}/categories/${category.join("/")}`,
      },
      global
    )
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ category, countryCode }, { sortBy, page, featured, collection, view }] =
    await Promise.all([params, searchParams])

  const { product_categories } = await getCategoryByHandle(category)

  if (!product_categories) {
    notFound()
  }

  return (
    <CategoryTemplate
      categories={product_categories}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
      featuredHandle={featured}
      collectionHandle={collection}
      viewHandle={view}
    />
  )
}
