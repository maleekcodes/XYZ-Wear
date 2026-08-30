import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="mb-10 h-10 w-48 animate-pulse bg-neutral-100 md:mb-14" />
      <ul className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {repeat(3).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
