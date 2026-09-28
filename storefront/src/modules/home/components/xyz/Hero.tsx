"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"

interface HeroProps {
  headline?: string
  subheadline?: string
  cta?: string
  figureLabels?: {
    physical?: string
    digital?: string
  }
}

export function Hero({ headline, subheadline, cta, figureLabels }: HeroProps) {
  const scrollToIntro = () => {
    document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" })
  }

  const titleContent: ReactNode = headline || (
    <>
      From the unknown
      <br />
      to the known.
    </>
  )

  return (
    <section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left: Physical (Solid) */}
      <div className="flex-1 bg-concrete flex flex-col justify-center items-center p-12 relative border-r border-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-48 h-48 md:w-80 md:h-80 bg-deepBlack shadow-2xl rotate-45"
        />
        <div className="absolute left-8 top-8 z-20 md:bottom-8 md:top-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-700">
            {figureLabels?.physical || "Fig 01. Physical"}
          </span>
        </div>
      </div>

      {/* Right: Digital (Wireframe) */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-12 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="w-48 h-48 md:w-80 md:h-80 border-[1px] border-deepBlack rotate-45 flex items-center justify-center relative"
        >
          <div className="absolute inset-0 border-[0.5px] border-neutral-300 transform scale-75" />
          <div className="absolute inset-0 border-[0.5px] border-neutral-200 transform scale-50" />
          <div className="absolute inset-0 border-[0.5px] border-neutral-100 transform scale-[0.25]" />
        </motion.div>
        <div className="absolute bottom-8 right-8 text-right">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            {figureLabels?.digital || "Fig 02. Digital"}
          </span>
        </div>
      </div>

      {/* Overlay Content */}
      <div className="absolute  inset-0 flex flex-col justify-center items-center pointer-events-none mix-blend-difference text-white px-4 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl md:text-7xl font-bold tracking-tighter leading-tight max-w-2xl"
        >
          {titleContent}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-6 text-sm md:text-base font-light tracking-wide max-w-md mx-auto"
        >
          {subheadline ||
            "A fashion house exploring identity through physical and digital expression."}
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-auto"
      >
        <button
          type="button"
          onClick={scrollToIntro}
          className="group flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-deepBlack hover:text-neutral-500 transition-colors"
        >
          <span>{cta || "Explore Form"}</span>
          <ArrowDown
            size={16}
            className="group-hover:translate-y-1 transition-transform"
          />
        </button>
      </motion.div>
    </section>
  )
}
