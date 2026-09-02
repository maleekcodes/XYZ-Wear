"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Container } from "@modules/common/components/xyz/Container"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type {
  CollectionShape,
  HomeCategorySection,
  HomeCollectionItem,
  HomeCollectionLayout,
} from "@modules/home/lib/map-categories-to-collection"
import { PhysicalFutureForms } from "@modules/store/components/physical-future-forms"
import { PhysicalProductCard } from "@modules/store/components/physical-product-card"
import type { ComingSoonCategory } from "@modules/store/lib/group-products-by-category"

function CollectionShapeGraphic({ shape }: { shape: CollectionShape }) {
  if (shape === "x") {
    return (
      <div className="w-40 h-20 bg-neutral-200 rounded-t-full opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out" />
    )
  }

  if (shape === "y") {
    return (
      <div className="flex gap-8 h-40 group-hover:gap-12 transition-all duration-700 ease-out">
        <div className="w-px h-full bg-neutral-300" />
        <div className="w-px h-full bg-neutral-300" />
      </div>
    )
  }

  return (
    <div className="relative w-40 h-32 border border-neutral-200 transform -skew-x-12 group-hover:-skew-x-6 transition-transform duration-700 ease-out flex items-center justify-center">
      <div className="w-3 h-3 bg-deepBlack rounded-full" />
    </div>
  )
}

function ComingSoonCard({ item }: { item: HomeCollectionItem }) {
  return (
    <LocalizedClientLink href={item.href} className="block h-full min-h-[360px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4 }}
        className="group flex h-full min-h-[360px] flex-col justify-between bg-concrete p-3"
      >
        <div className="flex items-start justify-between">
          <span className="rounded-full border border-neutral-300 bg-white/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">
            {item.line}
          </span>
          <Plus size={18} className="text-neutral-400" aria-hidden />
        </div>

        <div className="flex flex-grow items-center justify-center py-3">
          <div className="relative flex aspect-[3/4] w-full max-w-[14rem] items-center justify-center overflow-hidden border border-neutral-100 bg-white">
            <CollectionShapeGraphic shape={item.shape} />
          </div>
        </div>

        <div>
          <h3 className="truncate text-xs font-bold tracking-tight">Coming soon</h3>
          <span className="mt-1 block text-xs text-neutral-500">
            {item.line} releases are on the way.
          </span>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-200/60 pt-4 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            <span>Soon</span>
            <span>—</span>
          </div>
        </div>
      </motion.div>
    </LocalizedClientLink>
  )
}

function CollectionCard({ item }: { item: HomeCollectionItem }) {
  if (item.card) {
    return (
      <PhysicalProductCard
        {...item.card}
        compact
        className="max-w-none w-full"
      />
    )
  }

  return <ComingSoonCard item={item} />
}

function CategoryBlock({ section }: { section: HomeCategorySection }) {
  return (
    <section aria-labelledby={`home-cat-${section.id}`}>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h3
          id={`home-cat-${section.id}`}
          className="text-3xl font-bold tracking-tighter text-deepBlack md:text-4xl"
        >
          {section.handle ? (
            <LocalizedClientLink
              href={`/categories/${section.handle}`}
              className="hover:opacity-70 transition-opacity"
            >
              {section.name}
            </LocalizedClientLink>
          ) : (
            section.name
          )}
        </h3>
        {section.handle && (
          <LocalizedClientLink
            href={`/categories/${section.handle}`}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400 hover:text-deepBlack transition-colors"
          >
            Shop {section.name}
          </LocalizedClientLink>
        )}
      </div>

      <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {section.items.map((item) => (
          <li key={item.id}>
            <CollectionCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Collection({
  layout,
  items = [],
  futureForms,
}: {
  layout?: HomeCollectionLayout
  items?: HomeCollectionItem[]
  futureForms?: ComingSoonCategory[]
}) {
  const categories = layout?.categories ?? []
  const fallback = !layout && items.length > 0 ? items : []

  return (
    <section className="py-32 bg-white" id="collection">
      <Container>
        <div className="flex justify-between items-end mb-20 border-b border-neutral-100 pb-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-balance">
            The Collection
          </h2>
          <span className="font-mono text-xs text-neutral-400">
            Latest releases
          </span>
        </div>

        {fallback.length > 0 && (
          <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {fallback.map((item) => (
              <li key={item.id}>
                <CollectionCard item={item} />
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-24 md:space-y-28">
          {categories.map((section) => (
            <CategoryBlock key={section.id} section={section} />
          ))}
        </div>

        <PhysicalFutureForms items={futureForms ?? layout?.futureForms} />
      </Container>
    </section>
  )
}
