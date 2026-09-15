"use client"

import { motion } from "framer-motion"

import { Container } from "@modules/common/components/xyz/Container"
import type { AboutPageSanity } from "@/types/xyz"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const defaults = {
  label: "Identity & Form",
  title: "ABOUT US",
  leadQuote: "XYZ London is a fashion house built on intent.",
  bodyLeft: [
    {
      text: "In a world of noise, speed, and constant repetition, we choose restraint. We do not chase trends or mass attention. Instead, we focus on form, premium material, and proportion — the quiet elements that shape how identity is expressed.",
      isHighlighted: false,
    },
    {
      text: "XYZ London exists to uncover identity, not define it.",
      isHighlighted: true,
    },
    {
      text: "We believe expression emerges through form, movement, and proportion — not labels, not gender, not rules imposed from the outside.",
      isHighlighted: false,
    },
  ],
  bodyRight: [
    {
      text: 'Our garments are designed beyond gender, created to move naturally across different body forms. Each piece is considered for comfort, durability, and longevity — made to be lived in, (not replaced)*.',
      isHighlighted: false,
    },
    {
      text: "Alongside physical garments, XYZ London explores digital expression. Our virtual designs extend identity beyond physical constraints, allowing form and presence to exist in new spaces without limitation. Physical and digital are not opposites to us — they are parallel expressions of the same philosophy.",
      isHighlighted: false,
    },
  ],
  sustainabilityNote:
    "We work with premium sustainable materials and (responsible construction)*, prioritising quality over volume and intention over excess. Every decision is guided by clarity, discipline, and respect for the individual.",
  closingLine1: "XYZ London is not about fitting in.",
  closingLine2: "It is about standing as your original self.",
  tagline: "From the unknown to the known.",
}

function keepChooseRestraintTogether(text: string) {
  const phrase = "choose restraint"
  const parts = text.split(phrase)

  if (parts.length === 1) return text

  return parts.flatMap((part, index) =>
    index === parts.length - 1
      ? [part]
      : [
          part,
          <span key={`choose-restraint-${index}`} className="whitespace-nowrap">
            {phrase}
          </span>,
        ]
  )
}

interface AboutTemplateProps {
  content?: AboutPageSanity
}

export default function AboutTemplate({ content }: AboutTemplateProps) {
  const label = content?.label ?? defaults.label
  const title = content?.title ?? defaults.title
  const leadQuote = content?.leadQuote ?? defaults.leadQuote
  const sustainabilityNote =
    content?.sustainabilityNote ?? defaults.sustainabilityNote
  const closingLine1 = content?.closingLine1 ?? defaults.closingLine1
  const closingLine2 = content?.closingLine2 ?? defaults.closingLine2
  const tagline = content?.tagline ?? defaults.tagline

  const bodyParagraphs = content?.bodyParagraphs ?? []
  const hasBodyParagraphs = bodyParagraphs.length > 0
  const leftParagraphs = hasBodyParagraphs
    ? bodyParagraphs
        .filter((p) => p.column === "left" || !p.column)
        .map((p) => ({ text: p.text ?? "", isHighlighted: p.isHighlighted }))
    : defaults.bodyLeft
  const rightParagraphs = hasBodyParagraphs
    ? bodyParagraphs
        .filter((p) => p.column === "right")
        .map((p) => ({ text: p.text ?? "", isHighlighted: p.isHighlighted }))
    : defaults.bodyRight

  return (
    <section className="min-h-screen pt-32 pb-24 bg-white text-deepBlack">
      <Container>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-16">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-4">
              {label}
            </span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-12">
              {title}
            </h1>
            <div className="w-full h-px bg-neutral-200" />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mb-20 pl-0 md:pl-8 border-l-0 md:border-l-4 border-deepBlack"
          >
            <p className="text-2xl md:text-4xl font-light leading-tight">
              {leadQuote}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 text-lg text-neutral-600 font-light leading-relaxed">
            <div className="space-y-12">
              {leftParagraphs.map((para, idx) => (
                <motion.p
                  key={idx}
                  variants={itemVariants}
                  className={
                    para.isHighlighted
                      ? "text-deepBlack font-medium text-xl"
                      : ""
                  }
                >
                  {keepChooseRestraintTogether(para.text)}
                </motion.p>
              ))}
            </div>

            <div className="space-y-12">
              {rightParagraphs.map((para, idx) => (
                <motion.p
                  key={idx}
                  variants={itemVariants}
                  className={
                    para.isHighlighted
                      ? "text-deepBlack font-medium text-xl"
                      : ""
                  }
                >
                  {keepChooseRestraintTogether(para.text)}
                </motion.p>
              ))}
            </div>
          </div>

          <motion.div
            variants={itemVariants}
            className="mt-16 md:mt-24 p-8 md:p-12 bg-concrete border border-neutral-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <div className="w-24 h-24 border border-deepBlack rounded-full" />
            </div>
            <p className="text-base md:text-lg text-neutral-700 relative z-10">
              {sustainabilityNote}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-32 text-center flex flex-col items-center"
          >
            <p className="text-xl md:text-2xl text-deepBlack uppercase tracking-[0.2em] font-medium mb-4">
              {closingLine1}
            </p>
            <p className="text-xl md:text-2xl uppercase tracking-[0.2em] font-medium text-neutral-400">
              {closingLine2}
            </p>

            <div className="h-24 w-px bg-gradient-to-b from-deepBlack to-transparent my-12" />

            <p className="font-mono text-xs text-neutral-400">{tagline}</p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
