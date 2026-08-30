"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { CATALOG_SCROLL_ID } from "@modules/store/lib/catalog-scroll"
import { scrollToCatalog } from "@modules/store/lib/scroll-to-catalog"

export function ScrollToCatalog() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (window.location.hash !== `#${CATALOG_SCROLL_ID}`) return

    const timer = window.setTimeout(scrollToCatalog, 50)
    return () => window.clearTimeout(timer)
  }, [pathname, searchParams])

  return null
}
