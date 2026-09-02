import { HttpTypes } from "@medusajs/types"
import { isLineCollectionHandle } from "@lib/util/line-collections"
import {
  productCollectionLine,
  productDisplayTitle,
  productLineCollectionLabel,
} from "@lib/util/physical-product-copy"
import { productTypeCategory } from "@lib/util/product-type-category"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductTagline from "@modules/products/components/product-tagline"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  /** When true, omit long description (shown in PDP accordions instead). */
  compact?: boolean
}

function lineCollectionHref(product: HttpTypes.StoreProduct): string | null {
  const category = productTypeCategory(product)
  const collectionHandle = product.collection?.handle ?? null
  if (category?.handle && isLineCollectionHandle(collectionHandle)) {
    return `/categories/${category.handle}?collection=${collectionHandle}`
  }
  if (collectionHandle) return `/collections/${collectionHandle}`
  return null
}

function Breadcrumb({ product }: { product: HttpTypes.StoreProduct }) {
  const category = productTypeCategory(product)
  if (!category) return null

  return (
    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">
      <LocalizedClientLink
        href={`/categories/${category.handle}`}
        className="hover:text-deepBlack transition-colors"
      >
        {category.name}
      </LocalizedClientLink>
    </p>
  )
}

const ProductInfo = ({ product, compact }: ProductInfoProps) => {
  const line = productLineCollectionLabel(product)
  const title = productDisplayTitle(product)
  const collectionLine = productCollectionLine(product)
  const collectionHref = lineCollectionHref(product)

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
          className="mt-4 flex flex-col text-deepBlack"
          data-testid="product-title"
        >
          {line &&
            (collectionHref ? (
              <LocalizedClientLink
                href={collectionHref}
                className="font-bold uppercase tracking-tighter leading-none text-3xl md:text-4xl hover:opacity-70 transition-opacity w-fit"
              >
                {line}
              </LocalizedClientLink>
            ) : (
              <span className="font-bold uppercase tracking-tighter leading-none text-3xl md:text-4xl">
                {line}
              </span>
            ))}
          <span
            className={`font-medium tracking-tight text-pretty ${
              line ? "mt-2" : ""
            } ${compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"}`}
          >
            {title}
          </span>
        </h2>
        <div className="mt-3 flex flex-col gap-1 text-sm leading-relaxed text-neutral-600">
          <ProductTagline product={product} />
          {collectionLine && (
            <p className="italic text-pretty">{collectionLine}</p>
          )}
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
