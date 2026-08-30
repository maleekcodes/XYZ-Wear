import { HttpTypes } from "@medusajs/types"
import {
  isLineCollectionHandle,
  lineCollectionLabel,
} from "@lib/util/line-collections"
import { productMetadataString } from "@lib/util/physical-product-copy"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductTagline from "@modules/products/components/product-tagline"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  /** When true, omit long description (shown in PDP accordions instead). */
  compact?: boolean
}

function Breadcrumb({ product }: { product: HttpTypes.StoreProduct }) {
  const category = (product.categories ?? []).find(
    (c) => c?.handle && !isLineCollectionHandle(c.handle)
  )
  const collection = product.collection
  const collectionHandle = collection?.handle ?? null
  const collectionHref =
    category?.handle && isLineCollectionHandle(collectionHandle)
      ? `/categories/${category.handle}?collection=${collectionHandle}`
      : collectionHandle
        ? `/collections/${collectionHandle}`
        : null

  if (!category && !collection) return null

  return (
    <p className="text-xs font-mono uppercase tracking-[0.15em] text-neutral-400">
      {category && (
        <LocalizedClientLink
          href={`/categories/${category.handle}`}
          className="hover:text-deepBlack transition-colors"
        >
          {category.name}
        </LocalizedClientLink>
      )}
      {category && collection && (
        <span className="text-neutral-300"> · </span>
      )}
      {collection &&
        (collectionHref ? (
          <LocalizedClientLink
            href={collectionHref}
            className="hover:text-deepBlack transition-colors"
          >
            {isLineCollectionHandle(collectionHandle)
              ? lineCollectionLabel(collectionHandle)
              : collection.title}
          </LocalizedClientLink>
        ) : (
          collection.title
        ))}
    </p>
  )
}

const ProductInfo = ({ product, compact }: ProductInfoProps) => {
  const collectionLine =
    productMetadataString(product, "collection_line") ??
    (product.collection?.title
      ? `${product.collection.title} | XYZ London`
      : null)
  return (
    <div id="product-info">
      <div
        className={
          compact
            ? "flex flex-col"
            : "mx-auto flex max-w-[500px] flex-col lg:max-w-[500px]"
        }
      >
        <Breadcrumb product={product} />
        <h2
          className={`mt-3 font-bold tracking-tighter text-deepBlack ${
            compact
              ? "text-2xl leading-tight md:text-3xl"
              : "text-3xl leading-10"
          }`}
          data-testid="product-title"
        >
          {product.title}
        </h2>

        <div className="mt-6 flex flex-col gap-y-5 text-sm leading-relaxed text-neutral-600">
          {collectionLine && <p>{collectionLine}</p>}
          <ProductTagline product={product} />
        </div>

        {!compact && product.description && (
          <p
            className="mt-6 text-medium whitespace-pre-line text-ui-fg-subtle"
            data-testid="product-description"
          >
            {product.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
