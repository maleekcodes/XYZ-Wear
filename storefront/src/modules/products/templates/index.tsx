import React, { Suspense } from "react"

import { getVirtualTryOnApiKey } from "@lib/digital/virtual-tryon-config"
import { Container } from "@modules/common/components/xyz/Container"
import ProductDetailAccordions from "@modules/products/components/product-detail-accordions"
import { ProductColorProvider } from "@modules/products/components/product-color-context"
import ProductImageGallery from "@modules/products/components/product-image-gallery"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import PhysicalFormPdpCatalog from "@modules/products/components/physical-form-pdp-catalog"
import { productTypeCategory } from "@lib/util/product-type-category"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const tryOnEnabled = Boolean(getVirtualTryOnApiKey())
  const category = productTypeCategory(product)

  console.log("[DEBUG] ProductTemplate rendering:", {
    tryOnEnabled,
    key: getVirtualTryOnApiKey(),
  })

  return (
    <>
      <div
        className="bg-white text-deepBlack pt-16 pb-24 min-h-screen"
        data-testid="product-container"
      >
        <Container>
          {category && (
            <h1
              className="mb-10 text-4xl font-bold tracking-tighter text-balance md:text-5xl"
              data-testid="category-page-title"
            >
              {category.name}
            </h1>
          )}

          <div className="mb-8 flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              Full detail
            </span>
          </div>

          <ProductColorProvider product={product}>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
              <div className="flex flex-col gap-10 lg:col-span-7 xl:col-span-8">
                <ProductImageGallery
                  product={product}
                  images={product.images ?? []}
                  thumbnail={product.thumbnail}
                  productTitle={product.title ?? "Product"}
                />
                <ProductDetailAccordions product={product} />
              </div>

              <aside className="flex flex-col gap-8 lg:col-span-5 lg:sticky lg:top-24 lg:max-w-md lg:self-start xl:col-span-4">
                <ProductInfo product={product} compact />
                <ProductOnboardingCta />
                <Suspense
                  fallback={
                    <div className="flex flex-col gap-y-6" aria-hidden>
                      <div className="h-10 w-32 animate-pulse bg-concrete" />
                      <div className="h-10 w-full animate-pulse bg-concrete" />
                      <div className="h-10 w-full animate-pulse bg-concrete" />
                      <div className="h-12 w-full animate-pulse bg-concrete" />
                    </div>
                  }
                >
                  <ProductActionsWrapper
                    id={product.id}
                    region={region}
                    tryOnEnabled={tryOnEnabled}
                  />
                </Suspense>
              </aside>
            </div>
          </ProductColorProvider>

          {category ? (
            <Suspense fallback={null}>
              <PhysicalFormPdpCatalog
                product={product}
                countryCode={countryCode}
              />
            </Suspense>
          ) : (
            <div
              className="mt-16"
              data-testid="related-products-container"
            >
              <Suspense fallback={<SkeletonRelatedProducts />}>
                <RelatedProducts product={product} countryCode={countryCode} />
              </Suspense>
            </div>
          )}
        </Container>
      </div>
    </>
  )
}

export default ProductTemplate
