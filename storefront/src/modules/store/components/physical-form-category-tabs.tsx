"use client"

import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CATALOG_SCROLL_ID } from "@modules/store/lib/catalog-scroll"
import { FUTURE_FORMS_SECTION_ID } from "@modules/store/components/physical-future-forms"

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

function sectionId(handle: string) {
  if (handle === FUTURE_FORMS_HANDLE) return FUTURE_FORMS_SECTION_ID
  return `physical-cat-${handle}`
}

function scrollToHandle(handle: string) {
  if (handle === "all") {
    window.scrollTo({ top: 0, behavior: "smooth" })
    return
  }
  document
    .getElementById(sectionId(handle))
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function storePath(countryCode: string | string[] | undefined, hash?: string) {
  const country = Array.isArray(countryCode) ? countryCode[0] : countryCode
  const path = country ? `/${country}/store` : "/store"
  return hash ? `${path}#${hash}` : path
}

function useScrollSpy(enabled: boolean, handles: string[]) {
  const [spyHandle, setSpyHandle] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || handles.length === 0) {
      setSpyHandle(null)
      return
    }

    const update = () => {
      const allThreshold = 220
      const activateLine = window.innerHeight * 0.72
      const first = handles[0]
      if (first) {
        const firstEl = document.getElementById(sectionId(first))
        if (firstEl && firstEl.getBoundingClientRect().top > allThreshold) {
          setSpyHandle("all")
          return
        }
      }

      let current = first ?? "all"
      for (const handle of handles) {
        const el = document.getElementById(sectionId(handle))
        if (!el) continue
        if (el.getBoundingClientRect().top <= activateLine) current = handle
      }
      setSpyHandle(current)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)

    const resizeObserver = new ResizeObserver(update)
    const intersectionObserver = new IntersectionObserver(update, {
      threshold: [0, 0.15, 0.4, 0.7, 1],
    })
    for (const handle of handles) {
      const el = document.getElementById(sectionId(handle))
      if (!el) continue
      resizeObserver.observe(el)
      intersectionObserver.observe(el)
    }

    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [enabled, handles])

  return spyHandle
}

export function PhysicalFormCategoryTabs({
  tabs,
  activeHandle,
  showFuture,
  futureHref,
  scrollToCatalogOnClick = false,
  scrollSpy = false,
  onSelect,
}: {
  tabs: PhysicalFormTab[]
  activeHandle?: string | null
  showFuture: boolean
  futureHref?: string
  scrollToCatalogOnClick?: boolean
  scrollSpy?: boolean
  onSelect?: (handle: string) => void
}) {
  const spyHandles = useMemo(() => {
    const handles = tabs
      .map((tab) => tab.handle)
      .filter((handle) => handle && handle !== "all")
    if (showFuture) handles.push(FUTURE_FORMS_HANDLE)
    return handles
  }, [showFuture, tabs])

  const { countryCode } = useParams()
  const spyHandle = useScrollSpy(scrollSpy, spyHandles)
  const current = scrollSpy ? spyHandle ?? activeHandle : activeHandle
  const futureActive = current === FUTURE_FORMS_HANDLE
  const LinkComponent = scrollToCatalogOnClick
    ? CatalogTabLink
    : LocalizedClientLink

  useEffect(() => {
    if (!scrollSpy) return
    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) return
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" })
    })
  }, [scrollSpy])

  return (
    <nav
      aria-label="Physical Form categories"
      className="sticky top-24 z-40 -mx-6 mt-10 flex flex-wrap items-center justify-end gap-2 bg-white/95 px-6 py-4 backdrop-blur-sm md:-mx-12 md:px-12"
    >
      {tabs.map((tab) => {
        const active = !futureActive && tab.handle === current
        if (onSelect) {
          return (
            <button
              key={tab.handle}
              type="button"
              className={tabClass(active)}
              onClick={() => onSelect(tab.handle)}
            >
              {tab.name}
            </button>
          )
        }
        if (scrollSpy) {
          const hash = tab.handle === "all" ? undefined : sectionId(tab.handle)
          return (
            <a
              key={tab.handle}
              href={storePath(countryCode, hash)}
              className={tabClass(active)}
              onClick={(event) => {
                event.preventDefault()
                scrollToHandle(tab.handle)
                window.history.replaceState(null, "", storePath(countryCode, hash))
              }}
            >
              {tab.name}
            </a>
          )
        }

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
      {showFuture &&
        (onSelect ? (
          <button
            type="button"
            className={tabClass(futureActive)}
            onClick={() => onSelect(FUTURE_FORMS_HANDLE)}
          >
            Future Forms
          </button>
        ) : scrollSpy ? (
          <a
            href={storePath(countryCode, FUTURE_FORMS_SECTION_ID)}
            className={tabClass(futureActive)}
            onClick={(event) => {
              event.preventDefault()
              scrollToHandle(FUTURE_FORMS_HANDLE)
              window.history.replaceState(
                null,
                "",
                storePath(countryCode, FUTURE_FORMS_SECTION_ID)
              )
            }}
          >
            Future Forms
          </a>
        ) : (
          <LinkComponent
            href={futureHref ?? defaultTabHref(FUTURE_FORMS_HANDLE)}
            className={tabClass(futureActive)}
          >
            Future Forms
          </LinkComponent>
        ))}
    </nav>
  )
}
