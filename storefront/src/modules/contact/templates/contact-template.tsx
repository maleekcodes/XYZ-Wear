"use client"

import { motion } from "framer-motion"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container } from "@modules/common/components/xyz/Container"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

export default function ContactTemplate() {
  return (
    <section className="min-h-screen bg-white pb-24 pt-28 text-deepBlack md:pt-32">
      <Container>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
          className="mx-auto max-w-4xl"
        >
          <motion.div variants={itemVariants} className="mb-12 md:mb-16">
            <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-neutral-400">
              XYZ London
            </span>
            <h1 className="mb-8 text-5xl font-bold tracking-tighter md:text-7xl">
              CONTACT
            </h1>
            <div className="h-px w-full bg-neutral-200" />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mb-12 max-w-2xl text-lg font-light leading-relaxed text-neutral-600 md:text-xl"
          >
            Questions about an order, sizing, or our digital pieces — send us a
            note. We aim to reply within two business days.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mb-10 border border-neutral-200 bg-concrete p-8 md:p-10"
          >
            <h2 className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
              Email
            </h2>
            <a
              href="mailto:contact@wearxyz.co"
              className="text-xl font-semibold text-deepBlack underline decoration-neutral-300 underline-offset-[6px] transition-colors hover:decoration-deepBlack md:text-2xl"
            >
              contact@wearxyz.co
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
                Orders &amp; support
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Include your order number if you have one. For shipping updates,
                we&apos;ll reply from the same thread.
              </p>
            </div>
            <div id="returns">
              <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
                Returns &amp; exchanges
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Tell us what you bought and what you&apos;d like to do — we&apos;ll
                walk you through the next steps.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-14 border-t border-neutral-200 pt-12 md:mt-16 md:pt-16"
          >
            <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
              Elsewhere
            </h2>
            <ul className="flex flex-col gap-4 text-sm text-neutral-600 sm:flex-row sm:gap-10">
              <li>
                <a
                  href="https://www.instagram.com/xyzlondonofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-neutral-300 pb-0.5 transition-colors hover:border-deepBlack hover:text-deepBlack"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@xyzlondon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-neutral-300 pb-0.5 transition-colors hover:border-deepBlack hover:text-deepBlack"
                >
                  TikTok
                </a>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="border-b border-neutral-300 pb-0.5 transition-colors hover:border-deepBlack hover:text-deepBlack"
                >
                  Shop
                </LocalizedClientLink>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 text-center md:mt-20">
            <LocalizedClientLink
              href="/"
              className="inline-block w-full border border-deepBlack bg-deepBlack py-4 text-center text-sm font-mono uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 md:max-w-xs"
            >
              Back to home
            </LocalizedClientLink>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
