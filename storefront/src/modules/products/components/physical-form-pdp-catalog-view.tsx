"use client"

import { useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  FUTURE_FORMS_HANDLE,
  PhysicalFormCategoryTabs,
} from "@modules/store/components/physical-form-category-tabs"
import { PhysicalFutureForms } from "@modules/store/components/physical-future-forms"
import {
  PhysicalProductCard,
  type PhysicalProductCardProps,
} from "@modules/store/components/physical-product-card"
import { CATALOG_SCROLL_ID } from "@modules/store/lib/catalog-scroll"
import type { ComingSoonCategory } from "@modules/store/lib/group-products-by-category"

export type PdpCatalogCard = PhysicalProductCardProps & {
  id: string
  isLatest?: boolean
}

export type PdpCatalogGroup = {
  id: string
  title: string
  handle?: string | null
  cards: PdpCatalogCard[]
}

export type PdpCatalog = {
  handle: string
  groups: PdpCatalogGroup[]
}

export function PhysicalFormPdpCatalogView({
  tabs,
  initialHandle,
  catalogs,
  comingSoon,
}: {
  tabs: { name: string; handle: string }[]
  initialHandle: string
  catalogs: PdpCatalog[]
  comingSoon: ComingSoonCategory[]
}) {
  const [activeHandle, setActiveHandle] = useState(initialHandle)
  const futureActive = activeHandle === FUTURE_FORMS_HANDLE
  const catalog = catalogs.find((item) => item.handle === activeHandle)

  const selectTab = (handle: string) => {
    setActiveHandle(handle)
    document
      .getElementById(CATALOG_SCROLL_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="mt-12 md:mt-16">
      <PhysicalFormCategoryTabs
        tabs={tabs}
        activeHandle={activeHandle}
        showFuture
        onSelect={selectTab}
      />

      <section
        id={CATALOG_SCROLL_ID}
        className="scroll-mt-[10.5rem] mt-12 space-y-16 md:mt-16 md:space-y-20"
        data-testid="products-list"
      >
        {futureActive ? (
          <PhysicalFutureForms items={comingSoon} />
        ) : (
          catalog?.groups?.map((group) => (
            <div
              key={group.id}
              id={group.handle ? `line-${group.handle}` : undefined}
            >
              <div className="mb-6 flex items-baseline justify-between gap-3">
                {group.handle && catalog.handle ? (
                  <LocalizedClientLink
                    href={`/categories/${catalog.handle}?collection=${group.handle}`}
                    className="text-lg font-bold tracking-tight text-deepBlack hover:opacity-70 transition-opacity md:text-xl"
                  >
                    {group.title}
                  </LocalizedClientLink>
                ) : (
                  <span className="text-lg font-bold tracking-tight text-deepBlack md:text-xl">
                    {group.title}
                  </span>
                )}
                {group.cards.length > 0 && (
                  <span className="font-mono text-[10px] text-neutral-400">
                    {group.cards.length}
                  </span>
                )}
              </div>
              {group.cards.length > 0 ? (
                <ul className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                  {group.cards.map((card) => (
                    <li key={card.id}>
                      <PhysicalProductCard {...card} compact />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Coming soon
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
