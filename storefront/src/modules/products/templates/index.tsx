import React, { Suspense } from "react"

import { getVirtualTryOnApiKey } from "@lib/digital/virtual-tryon-config"
import { Container } from "@modules/common/components/xyz/Container"
import ProductDetailAccordions from "@modules/products/components/product-detail-accordions"
import { ProductColorProvider } from "@modules/products/components/product-color-context"
import ProductImageGallery from "@modules/products/components/product-image-gallery"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
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

  return (
    <>
      <div
        className="bg-white text-deepBlack"
        data-testid="product-container"
      >
        <Container className="py-8 lg:py-12">
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
        </Container>
      </div>
      <div className="my-16 small:my-32" data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
