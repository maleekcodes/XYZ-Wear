"use client"

import { CATALOG_SCROLL_ID } from "@modules/store/lib/catalog-scroll"

const NAV_HEIGHT_PX = 96

export function scrollToCatalog() {
  const node = document.getElementById(CATALOG_SCROLL_ID)
  if (!node) return

  const tabs = document.querySelector<HTMLElement>(
    '[aria-label="Physical Form categories"]'
  )
  const tabHeight = tabs?.getBoundingClientRect().height ?? 72
  const top =
    node.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT_PX - tabHeight
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  window.scrollTo({
    top: Math.max(0, Math.round(top)),
    behavior: reduce ? "auto" : "smooth",
  })
}
