"use client"

import { motion } from "framer-motion"
import { Container } from "@modules/common/components/xyz/Container"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface PhilosophyProps {
  lines?: string[]
  ctaLabel?: string
}

const defaultManifestoLines = [
  "XYZ London, for those who explore, question, and move beyond familiarity.",
  "The greatest discoveries are always found in the unknown.",
]

const statementBreaks: Record<string, [string, string]> = {
  [defaultManifestoLines[0]]: [
    "XYZ London, for those who explore,",
    "question, and move beyond familiarity.",
  ],
  [defaultManifestoLines[1]]: [
    "The greatest discoveries are always",
    "found in the unknown.",
  ],
}

function renderStatement(line: string) {
  const parts = statementBreaks[line]

  return parts ? (
    <>
      <span className="block whitespace-nowrap">{parts[0]}</span>
      <span className="block whitespace-nowrap">{parts[1]}</span>
    </>
  ) : (
    line
  )
}

export function Philosophy({ lines, ctaLabel }: PhilosophyProps) {
  const manifestoLines =
    lines && lines.length > 0 ? lines : defaultManifestoLines
  const previewLabel = ctaLabel?.trim() || "Digital Form Preview"

  return (
    <section className="py-48 bg-white overflow-hidden" id="philosophy">
      <Container>
        <div className="flex justify-end mb-16">
          <LocalizedClientLink
            href="/digital"
            className="font-mono text-xs text-neutral-400 hover:text-deepBlack transition-colors uppercase tracking-widest"
          >
            {previewLabel}
          </LocalizedClientLink>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:block"
        >
          <div className="space-y-6">
            {manifestoLines.map((line, index) => (
              <h3
                key={index}
                className={`text-balance text-[14.4px] font-normal uppercase leading-[1.35] tracking-normal md:text-[clamp(20px,2.5vw,38.4px)] ${
                  index === 1 ? "text-[#aaa]" : "text-[#111]"
                }`}
              >
                {renderStatement(line)}
              </h3>
            ))}
          </div>
          <div className="mt-6 h-px w-12 bg-neutral-300" />
        </motion.div>
        <div className="space-y-5 md:hidden">
          {manifestoLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full"
            >
              <h3
                className={`text-balance text-[clamp(10px,3.2vw,20px)] font-normal uppercase leading-[1.35] tracking-normal sm:text-[24px] ${
                  index === 1 ? "text-[#aaa]" : "text-[#111]"
                }`}
              >
                {renderStatement(line)}
              </h3>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
