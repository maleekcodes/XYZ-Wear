"use client"

import { ScanFace } from "lucide-react"

import { Container } from "@modules/common/components/xyz/Container"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface VirtualTryOnSectionProps {
  label?: string
  title?: string
  paragraph?: string
  ctaLabel?: string
  visualLabels?: { photo?: string | null; preview?: string | null; status?: string | null }
}

export function VirtualTryOnSection({
  label,
  title,
  paragraph,
  ctaLabel,
  visualLabels,
}: VirtualTryOnSectionProps) {
  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="border border-neutral-300 p-8 md:p-16 relative overflow-hidden group hover:border-deepBlack transition-colors duration-500">
          {/* Decorative Grid Lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start md:items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-6 text-deepBlack">
                <ScanFace className="stroke-1" size={32} />
                <span className="font-mono text-sm uppercase tracking-widest">
                  {label || "Try-on"}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                {title || "See it on you—garments and digital pieces."}
              </h2>
              <p className="text-neutral-600 max-w-md leading-relaxed mb-8">
                {paragraph ||
                  "Try-on helps you decide with more context: upload a photo on eligible physical or digital product pages and we composite the piece onto you. You get a better read on proportion and presence than catalog shots alone—not a replacement for in-person fitting, but a clearer starting point online."}
              </p>

              <LocalizedClientLink
                href="/virtual-try-on"
                className="bg-deepBlack text-white border border-deepBlack px-8 py-4 text-xs uppercase tracking-[0.15em] hover:bg-white hover:text-deepBlack transition-colors inline-block"
              >
                {ctaLabel || "How it works"}
              </LocalizedClientLink>
            </div>

            {/* Technical Visual */}
            <div className="flex-1 w-full flex justify-center">
              <div className="relative w-64 h-80 border-[1px] border-deepBlack flex flex-col bg-white">
                <div className="absolute top-0 left-0 -mt-1 -ml-1 w-2 h-2 bg-deepBlack" />
                <div className="absolute top-0 right-0 -mt-1 -mr-1 w-2 h-2 bg-deepBlack" />
                <div className="absolute bottom-0 left-0 -mb-1 -ml-1 w-2 h-2 bg-deepBlack" />
                <div className="absolute bottom-0 right-0 -mb-1 -mr-1 w-2 h-2 bg-deepBlack" />

                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                  <div className="w-32 h-48 border border-dashed border-neutral-400 rounded-full relative group-hover:scale-105 transition-transform duration-700">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-200" />
                    <div className="absolute top-0 left-1/2 h-full w-[1px] bg-neutral-200" />

                    <div className="absolute top-0 left-0 w-full h-1 bg-deepBlack/20 animate-scan" />
                  </div>
                </div>

                <div className="h-12 border-t border-deepBlack flex items-center justify-between px-4 font-mono text-[10px] bg-concrete">
                  <span>{visualLabels?.photo || "PHOTO"}</span>
                  <span>{visualLabels?.preview || "PREVIEW"}</span>
                  <span className="animate-pulse">{visualLabels?.status || "VT ON"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
