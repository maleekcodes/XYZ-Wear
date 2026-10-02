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

  const titleContent: ReactNode = headline ? (
    <>
      <span className="min-[700px]:max-large:hidden">{headline}</span>
      <span className="hidden whitespace-pre-line min-[700px]:max-large:inline">
        {headline.replace(/\s+(the known\.?\s*)$/i, "\n$1")}
      </span>
    </>
  ) : (
    <>
      <span className="min-[700px]:max-large:hidden">
        From the unknown
        <br />
        to the known.
      </span>
      <span className="hidden min-[700px]:max-large:inline">
        From the unknown to
        <br />
        the known.
      </span>
    </>
  )

  return (
    <section className="relative min-h-screen min-[700px]:max-[1439px]:min-h-[55svh] [@media(hover:hover)_and_(pointer:fine)]:min-[1200px]:max-[1439px]:min-h-[80svh] min-[1440px]:min-h-[100svh] flex flex-col min-[700px]:flex-row overflow-hidden">
      {/* Left: Physical (Solid) */}
      <div className="flex-1 bg-concrete flex flex-col justify-center items-center p-12 relative border-r border-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-48 h-48 bg-deepBlack shadow-2xl rotate-45 min-[700px]:max-[1439px]:h-[clamp(6rem,min(25vw,calc(55svh-6.3rem)),20rem)] min-[700px]:max-[1439px]:w-[clamp(6rem,min(25vw,calc(55svh-6.3rem)),20rem)] min-[1440px]:w-80 min-[1440px]:h-80"
        />
        <div className="absolute bottom-8 left-8 max-[699px]:top-8 max-[699px]:bottom-auto max-[699px]:z-20">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 max-[699px]:text-neutral-700">
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
          className="relative flex h-48 w-48 rotate-45 items-center justify-center border-[1px] border-deepBlack min-[700px]:max-[1439px]:h-[clamp(6rem,min(25vw,calc(55svh-6.3rem)),20rem)] min-[700px]:max-[1439px]:w-[clamp(6rem,min(25vw,calc(55svh-6.3rem)),20rem)] min-[1440px]:h-80 min-[1440px]:w-80"
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
          className="max-w-2xl text-4xl font-bold leading-tight tracking-tighter min-[700px]:max-large:text-[clamp(2.5rem,5vw,4.5rem)] min-[1440px]:text-7xl"
        >
          {titleContent}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mx-auto mt-6 max-w-md text-sm font-light tracking-wide min-[700px]:max-large:text-[clamp(0.875rem,1.5vw,1rem)] min-[1440px]:text-base"
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
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-auto [@media(min-width:700px)_and_(max-width:820px)_and_(min-height:650px)_and_(max-height:820px)_and_(hover:none)]:bottom-4"
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
