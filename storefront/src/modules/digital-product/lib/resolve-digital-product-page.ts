import { getDigitalProductBySlug, type DigitalProductPageResult } from "@lib/sanity/queries"
import { digitalProductDescription } from "@lib/digital/cyberx-product-copy"

export type ResolvedDigitalProductPage = {
  context: DigitalProductPageResult
  fetchError: boolean
}

export async function resolveDigitalProductPage(
  slug: string
): Promise<ResolvedDigitalProductPage | null> {
  const { data, fetchError } = await getDigitalProductBySlug(slug)

  if (data?.product?.slug) {
    return {
      context: {
        collectionLabel: data.collectionLabel,
        title: data.title,
        description: data.description,
        product: {
          ...data.product,
          description: digitalProductDescription(
            data.product.slug,
            data.product.description
          ),
        },
      },
      fetchError,
    }
  }

  return null
}
