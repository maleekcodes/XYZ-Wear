import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CATALOG_SCROLL_ID } from "@modules/store/lib/catalog-scroll"

import { CatalogTabLink } from "./catalog-tab-link"

export const FUTURE_FORMS_HANDLE = "future"
export { CATALOG_SCROLL_ID }

export type PhysicalFormTab = {
  name: string
  handle: string
  href?: string
}

function tabClass(active: boolean) {
  return `inline-flex min-h-10 items-center rounded-full px-5 py-2 text-[11px] font-mono uppercase tracking-[0.18em] transition-colors ${
    active
      ? "bg-deepBlack text-white"
      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-deepBlack"
  }`
}

function defaultTabHref(handle: string) {
  return handle === "all" ? "/store" : `/store?category=${handle}`
}

export function PhysicalFormCategoryTabs({
  tabs,
  activeHandle,
  showFuture,
  futureHref,
  scrollToCatalogOnClick = false,
}: {
  tabs: PhysicalFormTab[]
  activeHandle?: string | null
  showFuture: boolean
  futureHref?: string
  scrollToCatalogOnClick?: boolean
}) {
  const futureActive = activeHandle === FUTURE_FORMS_HANDLE
  const LinkComponent = scrollToCatalogOnClick
    ? CatalogTabLink
    : LocalizedClientLink

  return (
    <nav
      aria-label="Physical Form categories"
      className="sticky top-24 z-40 -mx-6 mt-10 flex flex-wrap items-center justify-end gap-2 bg-white/95 px-6 py-4 backdrop-blur-sm md:-mx-12 md:px-12"
    >
      {tabs.map((tab) => {
        const active = !futureActive && tab.handle === activeHandle
        return (
          <LinkComponent
            key={tab.handle}
            href={tab.href ?? defaultTabHref(tab.handle)}
            className={tabClass(active)}
          >
            {tab.name}
          </LinkComponent>
        )
      })}
      {showFuture && (
        <LinkComponent
          href={futureHref ?? defaultTabHref(FUTURE_FORMS_HANDLE)}
          className={tabClass(futureActive)}
        >
          Future Forms
        </LinkComponent>
      )}
    </nav>
  )
}
