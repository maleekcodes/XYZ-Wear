"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import type { SiteFooterSanity } from "@/types/xyz"

import { isDigitalRoute } from "@lib/util/is-digital-route"
import { isOOORoute } from "@lib/util/is-ooo-route"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container } from "@modules/common/components/xyz/Container"

const BRAND_PHILOSOPHY_LINES = [
  "From the unknown to the known.",
  "XYZ London exists to reveal identity through form, not define it.",
  "We believe fashion is more than fabric and seasonal trends. It is an extension of identity.",
  "Expression emerges through form and proportion, beyond labels, gender, and convention.",
  "We see physical and digital fashion as parallel expressions of the same philosophy, extending how identity can be expressed.",
]

const OUR_APPROACH = [
  "Our garments are designed beyond gender for natural movement, comfort, and longevity, with silhouettes and proportions developed to adapt naturally across different body frames through our engineered fit and sizing philosophy.",
  "We select responsibly sourced materials with consideration for quality, longevity, environmental impact, prioritising intention over volume and fleeting trend.",
  "Every decision is guided by craftsmanship, restraint, discipline, and respect — from construction and proportion to our evolving colour language.",
]

const DEFAULT_FOOTER = {
  brandSectionHeading: "Brand Philosophy",
  brandBodyLines: BRAND_PHILOSOPHY_LINES,
  approachHeading: "Our Approach",
  approachBodyLines: OUR_APPROACH,
  socialHeading: "Follow us",
  legalLinks: [
    { label: "Terms of Service", path: "/content/terms-of-use" },
    { label: "Privacy Policy", path: "/content/privacy-policy" },
    { label: "Shipping Policy", path: "/content/shipping-policy" },
    {
      label: "Cookie Settings",
      path: "/content/privacy-policy#cookies",
    },
  ],
  bottomTagline: "Physical / Digital",
  copyrightName: "XYZ London",
} satisfies SiteFooterSanity

function mergeFooter(site?: SiteFooterSanity | null): SiteFooterSanity {
  const d = DEFAULT_FOOTER
  const configuredLegalLinks =
    site?.legalLinks && site.legalLinks.length > 0
      ? site.legalLinks
      : (d.legalLinks ?? [])
  const legalLinks = configuredLegalLinks.filter(
    (item) => !/(^|\/)about(?:\/|$)/i.test(item.path ?? "")
  )

  return {
    brandSectionHeading: site?.brandSectionHeading?.trim() || d.brandSectionHeading,
    brandBodyLines: site?.brandBodyLines?.length ? site.brandBodyLines : d.brandBodyLines,
    approachHeading: site?.approachHeading?.trim() || d.approachHeading,
    approachBodyLines: site?.approachBodyLines?.length ? site.approachBodyLines : d.approachBodyLines,
    socialHeading: site?.socialHeading?.trim() || d.socialHeading,
    legalLinks,
    bottomTagline: site?.bottomTagline?.trim() ?? d.bottomTagline ?? undefined,
    copyrightName: site?.copyrightName?.trim() ?? d.copyrightName ?? undefined,
  }
}

type Props = {
  siteFooter?: SiteFooterSanity | null
}

type FooterIcon = "pinterest" | "instagram" | "tiktok" | "email" | "gdpr"
type FooterIconCrop = { width: number; height: number; x: number; y: number }

const FOOTER_ICON_SPRITE: Record<Exclude<FooterIcon, "pinterest">, FooterIconCrop> = {
  instagram: { width: 37, height: 36, x: 44, y: 1 },
  tiktok: { width: 37, height: 36, x: 81, y: 1 },
  email: { width: 32, height: 24, x: 120, y: 8 },
  gdpr: { width: 34, height: 36, x: 157, y: 1 },
}

function FooterIconImage({
  icon,
  invert = false,
}: {
  icon: FooterIcon
  invert?: boolean
}) {
  if (icon === "pinterest") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="block h-9 w-9 shrink-0"
        focusable="false"
      >
        <circle cx="12" cy="12" r="12" fill={invert ? "#fff" : "#000"} />
        <path
          fill={invert ? "#000" : "#fff"}
          d="M12.2 4.5c-4.2 0-6.3 3-6.3 5.5 0 1.5.6 2.9 1.9 3.4.2.1.4 0 .5-.2l.2-.8c.1-.2 0-.3-.1-.5-.4-.5-.7-1.1-.7-2 0-2.5 1.8-4.3 4.5-4.3 2.5 0 3.8 1.5 3.8 3.5 0 2.7-1.2 5-3 5-1 0-1.8-.9-1.5-1.9.3-1.2.9-2.5.9-3.4 0-.8-.4-1.5-1.3-1.5-1 0-1.9 1.1-1.9 2.5 0 .9.3 1.5.3 1.5l-1.2 5.2c-.4 1.5-.1 3.3-.1 3.5 0 .1.2.2.3.1.1-.1 1.2-1.5 1.6-3l.7-2.6c.4.7 1.4 1.3 2.5 1.3 3.2 0 5.3-2.9 5.3-6.7 0-2.9-2.5-5.1-5.9-5.1z"
        />
      </svg>
    )
  }

  if (icon === "instagram") {
    const circle = invert ? "#fff" : "#000"
    const mark = invert ? "#000" : "#fff"

    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 128 128"
        className="block h-9 w-9 shrink-0"
        focusable="false"
      >
        <circle cx="64" cy="64" r="64" fill={circle} />
        <rect
          x="29"
          y="29"
          width="70"
          height="70"
          rx="17"
          fill="none"
          stroke={mark}
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r="20"
          fill="none"
          stroke={mark}
          strokeWidth="8"
        />
        <circle cx="87" cy="42" r="5.5" fill={mark} />
      </svg>
    )
  }

  if (icon === "email") {
    const circle = invert ? "#fff" : "#000"
    const envelope = invert ? "#000" : "#fff"
    const detail = invert ? "#fff" : "#000"

    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 128 128"
        className="block h-9 w-9 shrink-0"
        focusable="false"
      >
        <circle cx="64" cy="64" r="64" fill={circle} />
        <path
          d="M22 34h84v60H22z"
          fill={envelope}
          stroke={detail}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="m24 38 34 31c4 4 8 4 12 0l34-31M24 92l32-29m48 29L72 63"
          fill="none"
          stroke={detail}
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  const crop = FOOTER_ICON_SPRITE[icon]

  return (
    <span
      aria-hidden="true"
      className="block shrink-0 bg-no-repeat"
      style={{
        width: `${crop.width}px`,
        height: `${crop.height}px`,
        backgroundImage: "url('/footer-icon-sprite.png')",
        backgroundSize: "202px auto",
        backgroundPosition: `-${crop.x}px -${crop.y}px`,
        filter: invert ? "invert(1)" : undefined,
        mixBlendMode: invert ? "screen" : "multiply",
      }}
    />
  )
}

function FooterIconLink({
  href,
  label,
  icon,
  invert = false,
}: {
  href: string
  label: string
  icon: FooterIcon
  invert?: boolean
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-10 items-center justify-center transition-opacity hover:opacity-60"
      {...(href.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      <FooterIconImage icon={icon} invert={invert} />
    </a>
  )
}

export default function FooterChrome({ siteFooter }: Props) {
  const pathname = usePathname()
  const digital = isDigitalRoute(pathname)
  const ooo = isOOORoute(pathname)

  const f = mergeFooter(siteFooter ?? null)

  const shell = ooo
    ? "bg-oooLight pt-24 pb-12 border-t border-neutral-200 transition-colors duration-300"
    : digital
      ? "bg-deepBlack pt-24 pb-12 border-t border-neutral-800 transition-colors duration-300"
      : "bg-white pt-24 pb-12 border-t border-neutral-100 transition-colors duration-300"

  const heading = digital ? "text-white" : "text-deepBlack"
  const body = digital ? "text-neutral-400" : "text-neutral-500"
  const bottomBorder = digital ? "border-neutral-800" : "border-neutral-200"
  const copyrightClass = digital ? "text-neutral-500" : "text-neutral-400"
  const taglineClass = digital ? "text-neutral-500" : "text-neutral-300"
  return (
    <footer className={shell}>
      <Container className="md:px-14">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-16">
          <div className="space-y-1">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${heading}`}>
              {f.brandSectionHeading}
            </h4>
            <div className={`space-y-2 text-[13px] leading-[1.4] ${body}`}>
              {f.brandBodyLines?.map((line, index) => (
                <p
                  key={index}
                  className={index === 0 ? `italic ${digital ? "text-neutral-500" : "text-neutral-400"}` : index === 1 ? `font-bold ${heading}` : undefined}
                >
                  {line.trim()}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${heading}`}>
              {f.approachHeading}
            </h4>
            <div className={`space-y-2 text-[13px] leading-[1.4] ${body}`}>
              {f.approachBodyLines?.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-5 pt-0 sm:grid-cols-[1fr_auto_1fr]">
          <LocalizedClientLink
            href="/content/privacy-policy"
            className={`inline-flex items-center gap-1 justify-self-start text-xs hover:opacity-70 ${digital ? "text-emerald-300" : "text-emerald-700"}`}
          >
            <FooterIconImage icon="gdpr" invert={digital} />
            <span>GDPR Compliant</span>
          </LocalizedClientLink>
          <div className="flex flex-col items-start gap-1">
            <p className={`text-sm ${heading}`}>{f.socialHeading}</p>
            <nav
              aria-label="Social media"
              className="flex items-center gap-3"
            >
              <FooterIconLink
                href="https://www.pinterest.com/xyzlondon/"
                label="Pinterest"
                icon="pinterest"
                invert={digital}
              />
              <FooterIconLink
                href="https://www.instagram.com/xyzlondonofficial/"
                label="Instagram"
                icon="instagram"
                invert={digital}
              />
              <FooterIconLink
                href="https://www.tiktok.com/@xyzlondon"
                label="TikTok"
                icon="tiktok"
                invert={digital}
              />
              <FooterIconLink
                href="mailto:contact@wearxyz.co"
                label="Email XYZ London"
                icon="email"
                invert={digital}
              />
            </nav>
          </div>
          <span aria-hidden="true" />
        </div>

        <nav
          aria-label="Legal links"
          className={`flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-t py-3 text-[13px] text-deepBlack ${bottomBorder}`}
        >
          {f.legalLinks?.map((item, idx) =>
            item.path?.trim() ? (
              <LocalizedClientLink
                key={item._key ?? `l-${idx}`}
                href={item.path.trim()}
                className="hover:opacity-70"
              >
                {item.label}
              </LocalizedClientLink>
            ) : (
              <span key={item._key ?? `l-${idx}`}>{item.label}</span>
            )
          )}
        </nav>

        <div
          className="flex flex-col items-center justify-between pt-4 md:flex-row"
        >
          <span
            className={`text-[10px] uppercase tracking-widest md:text-xs ${copyrightClass}`}
          >
            © {new Date().getFullYear()} {f.copyrightName}. All rights reserved.
          </span>
          <span
            className={`mt-2 text-[10px] uppercase tracking-widest md:mt-0 md:text-xs ${taglineClass}`}
          >
            {f.bottomTagline}
          </span>
        </div>
      </Container>
    </footer>
  )
}
