"use client"

import { PortableText } from "@portabletext/react"
import type { TypedObject } from "@portabletext/types"
import { motion } from "framer-motion"

import { Container } from "@modules/common/components/xyz/Container"
import { introPortableTextComponents } from "@modules/home/lib/intro-portable-text"

type IntroContent = TypedObject[] | string | null | undefined

interface IntroductionProps {
  text?: IntroContent
}

const defaultText =
  "XYZ London is a fashion house built on intent. In a world of noise, speed, and constant repetition, we choose restraint. We focus on form, premium material, and proportion — the quiet elements that shape how identity is expressed."

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

function isPortableText(value: IntroContent): value is TypedObject[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    "_type" in value[0]
  )
}

function IntroBody({ content }: { content: IntroContent }) {
  if (isPortableText(content)) {
    return (
      <div className="space-y-6">
        <PortableText
          value={content}
          components={introPortableTextComponents}
        />
      </div>
    )
  }

  const plain = (typeof content === "string" && content.trim()) || defaultText
  const paragraphs = plain.split(/\n\s*\n/).filter((p) => p.trim())

  return (
    <div className="space-y-6">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-xl md:text-2xl font-light leading-relaxed text-deepBlack"
        >
          {keepChooseRestraintTogether(paragraph.trim())}
        </p>
      ))}
    </div>
  )
}

export function Introduction({ text }: IntroductionProps) {
  return (
    <section className="py-32 bg-white">
      <Container className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center"
        >
          <IntroBody content={text} />
          <div className="w-px h-16 bg-neutral-200 mx-auto mt-12" />
        </motion.div>
      </Container>
    </section>
  )
}
