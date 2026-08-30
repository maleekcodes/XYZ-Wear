"use client"

import { motion, type Variants } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

import { Container } from "@modules/common/components/xyz/Container"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type {
  CollectionShape,
  HomeCategorySection,
  HomeCollectionItem,
  HomeCollectionLayout,
} from "@modules/home/lib/map-categories-to-collection"

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

const cardVariants: Variants = {
  hover: {
    y: -8,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const ctaVariants: Variants = {
  initial: { x: 0, opacity: 0 },
  hover: { x: 5, opacity: 1, transition: { duration: 0.3 } },
}

function CollectionCard({ item }: { item: HomeCollectionItem }) {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      variants={cardVariants}
      className="group relative bg-concrete h-[500px] flex flex-col p-8 md:p-10 cursor-pointer overflow-hidden col-span-1 md:col-span-4"
    >
      <LocalizedClientLink href={item.href} className="absolute inset-0 z-10" />

      <div className="flex justify-between items-start w-full relative z-10 shrink-0">
        <span
          className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-mono tracking-wide ${
            item.isLatest
              ? "border border-deepBlack bg-deepBlack text-white"
              : "border border-deepBlack bg-transparent"
          }`}
        >
          {item.line}
        </span>

        <motion.div
          variants={ctaVariants}
          className="flex items-center gap-2 text-deepBlack"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest hidden md:inline-block">
            {item.comingSoon ? "Soon" : "View"}
          </span>
          <ArrowRight size={18} />
        </motion.div>
      </div>

      <div className="relative flex-1 min-h-0 my-5 flex items-center justify-center pointer-events-none">
        {item.imageUrl ? (
          <div className="relative aspect-square h-full max-h-[240px] w-auto max-w-[72%] overflow-hidden bg-white shadow-sm outline outline-1 outline-black/10 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            <Image
              src={item.imageUrl}
              alt={item.description || item.title}
              fill
              className="object-contain object-center"
              sizes="(min-width: 768px) 28vw, 90vw"
              quality={75}
            />
          </div>
        ) : (
          <CollectionShapeGraphic shape={item.shape} />
        )}
      </div>

      <div className="relative z-10 shrink-0 min-h-[5.5rem]">
        <h3 className="text-2xl font-bold tracking-tight mb-2 text-balance line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm text-neutral-500 font-medium text-pretty line-clamp-2">
          {item.description}
        </p>
      </div>
    </motion.div>
  )
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {section.items.map((item) => (
          <CollectionCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export function Collection({
  layout,
  items = [],
}: {
  layout?: HomeCollectionLayout
  items?: HomeCollectionItem[]
}) {
  const categories = layout?.categories ?? []
  const future = layout?.future ?? []
  const fallback = !layout && items.length > 0 ? items : []

  if (!categories.length && !future.length && !fallback.length) {
    return null
  }

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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {fallback.map((item) => (
              <CollectionCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="space-y-24 md:space-y-28">
          {categories.map((section) => (
            <CategoryBlock key={section.id} section={section} />
          ))}
        </div>

        {future.length > 0 && (
          <section className="mt-28 border-t border-neutral-100 pt-20">
            <div className="mb-16 text-center">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest border border-neutral-300 px-3 py-1 rounded-full">
                Coming Soon
              </span>
              <h3 className="mt-6 text-4xl font-bold tracking-tighter">
                Future Forms
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {future.map((item) => (
                <CollectionCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </section>
  )
}
