"use client"

import { motion } from "framer-motion"
import { Lock } from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container } from "@modules/common/components/xyz/Container"

interface PrivateGateProps {
  /** Main headline — large white (e.g. “Highest Expression”) */
  title?: string
  teaserLine1?: string
  teaserLine2?: string
  /** Fallback when teaser lines omitted (two paragraphs separated by blank line) */
  paragraph?: string
  buttonLabel?: string
}

const DEFAULT_LINES = [
  "OOO is the highest expression of XYZ London.",
  "Quiet. Personal. Defined.",
]

function resolveLines(props: PrivateGateProps): string[] {
  const a = props.teaserLine1?.trim()
  const b = props.teaserLine2?.trim()
  if (a || b) {
    return [a, b].filter((x): x is string => Boolean(x?.length))
  }
  const p = props.paragraph?.trim()
  if (p) {
    const chunks = p
      .split(/\n\s*\n/)
      .map((x) => x.trim())
      .filter(Boolean)
    return chunks.length > 0 ? chunks : [p]
  }
  return DEFAULT_LINES
}

export function PrivateGate({
  title,
  teaserLine1,
  teaserLine2,
  paragraph,
  buttonLabel,
}: PrivateGateProps) {
  const headline = title?.trim() || "Highest Expression"
  const lines = resolveLines({
    teaserLine1,
    teaserLine2,
    paragraph,
  })
  const [sub1, sub2] = lines
  const btn = buttonLabel?.trim() || "Proceed"

  return (
    <section className="relative bg-black py-24 text-white antialiased small:py-32">
      <Container className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="max-w-4xl"
        >
          <Lock
            className="mx-auto mb-10 h-11 w-11 stroke-[1.25] text-white/70"
            aria-hidden
          />

          <h2
            className="mb-10 max-w-[min(100%,20ch)] text-balance font-bold leading-[1.06] tracking-tighter text-white"
            style={{
              fontSize: "clamp(2.125rem, 5.75vw + 0.65rem, min(4.25rem, 11vw))",
            }}
          >
            {headline}
          </h2>

          <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-5 px-4">
            {sub1 ? (
              <p className="text-[15px] font-normal leading-relaxed tracking-tight text-white md:text-base">
                {sub1}
              </p>
            ) : null}
            {sub2 ? (
              <p className="text-[15px] font-normal leading-relaxed tracking-tight text-white md:text-base">
                {sub2}
              </p>
            ) : null}
          </div>

          <LocalizedClientLink
            href="/private-expressions"
            className="inline-block rounded-none bg-white px-14 py-[1.125rem] text-sm font-medium tracking-wide text-black transition-opacity hover:opacity-85"
          >
            {btn}
          </LocalizedClientLink>
        </motion.div>
      </Container>
    </section>
  )
}
