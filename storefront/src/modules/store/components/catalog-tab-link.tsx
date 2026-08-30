"use client"

import type { ReactNode } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { scrollToCatalog } from "@modules/store/lib/scroll-to-catalog"

export function CatalogTabLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  return (
    <LocalizedClientLink
      href={href}
      className={className}
      scroll={false}
      onClick={scrollToCatalog}
    >
      {children}
    </LocalizedClientLink>
  )
}
