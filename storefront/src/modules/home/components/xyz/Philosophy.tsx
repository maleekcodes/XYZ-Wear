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
          className="hidden max-w-4xl md:block"
        >
          <div className="space-y-3 md:space-y-5">
            {manifestoLines.map((line, index) => (
              <h3
                key={index}
                className={`text-3xl font-light uppercase leading-tight tracking-tight md:text-5xl ${
                  index === 1 ? "text-neutral-500" : "text-deepBlack"
                }`}
              >
                {line}
              </h3>
            ))}
          </div>
          <div className="mt-6 h-px w-12 bg-neutral-300" />
        </motion.div>
        <div className="space-y-2.5 md:hidden">
          {manifestoLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <h3
                className={`text-2xl font-light uppercase leading-tight tracking-tight sm:text-3xl ${
                  index === 1 ? "text-neutral-500" : "text-deepBlack"
                }`}
              >
                {line}
              </h3>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
