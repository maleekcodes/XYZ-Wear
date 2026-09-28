"use client"

import { type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { HttpTypes } from "@medusajs/types"
import { isDigitalRoute } from "@lib/util/is-digital-route"
import { isOOORoute } from "@lib/util/is-ooo-route"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"
import { Logo } from "@modules/common/components/xyz/Logo"

type NavChromeProps = {
  regions: HttpTypes.StoreRegion[]
  cartDesktop: ReactNode
  cartMobile: ReactNode
}

export default function NavChrome({
  regions,
  cartDesktop,
  cartMobile,
}: NavChromeProps) {
  const pathname = usePathname()
  const digital = isDigitalRoute(pathname)
  const ooo = isOOORoute(pathname)

  const link = digital
    ? "text-neutral-400 hover:text-white hover:opacity-90 transition-opacity"
    : "text-neutral-500 hover:text-deepBlack hover:opacity-70 transition-opacity"

  const header = ooo
    ? "bg-oooLight text-deepBlack border-neutral-200 border-b"
    : digital
      ? "bg-deepBlack text-white border-neutral-800 border-b"
      : "bg-white text-deepBlack border-neutral-100 border-b"

  const logoClass = digital
    ? "flex items-center text-white"
    : "flex items-center text-deepBlack"

  const sideMenuVariant = digital ? "digital" : "light"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${header}`}
    >
      <div className="grid w-full grid-cols-3 items-center h-24 px-6 md:px-12 max-w-[90rem] mx-auto">
        <div className="flex min-w-0 items-center justify-start">
          <nav className="hidden min-w-0 flex-nowrap items-center gap-2 whitespace-nowrap text-xs font-medium tracking-wide md:flex lg:gap-8 lg:text-sm [&_a]:shrink-0">
            <LocalizedClientLink href="/store" className={link}>
              Physical Form
            </LocalizedClientLink>
            <LocalizedClientLink href="/digital" className={link}>
              Digital Form
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/private-expressions"
              className={link}
              data-testid="nav-ooo-link"
            >
              OOO
            </LocalizedClientLink>
          </nav>

          <div className="md:hidden flex h-full items-center">
            <SideMenu regions={regions} variant={sideMenuVariant} />
          </div>
        </div>

        <div className="flex justify-center">
          <LocalizedClientLink
            href="/"
            className={logoClass}
            data-testid="nav-store-link"
          >
            <Logo className="h-20 aspect-[187/150]" />
          </LocalizedClientLink>
        </div>

        <div className="flex min-w-0 items-center justify-end">
          <nav className="hidden md:flex min-w-0 justify-end items-center gap-5 lg:gap-8 text-sm font-medium tracking-wide flex-nowrap whitespace-nowrap [&_a]:shrink-0">
            <LocalizedClientLink href="/journal" className={link}>
              Journal
            </LocalizedClientLink>
            <LocalizedClientLink href="/virtual-try-on" className={link}>
              Try-on
            </LocalizedClientLink>
            {process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED && (
              <LocalizedClientLink
                href="/search"
                className={link}
                scroll={false}
                data-testid="nav-search-link"
              >
                Search
              </LocalizedClientLink>
            )}
            <LocalizedClientLink
              href="/account"
              className={link}
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            {cartDesktop}
          </nav>
          <div className="flex md:hidden justify-end">{cartMobile}</div>
        </div>
      </div>
    </header>
  )
}
