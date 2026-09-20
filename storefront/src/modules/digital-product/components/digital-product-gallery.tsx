"use client"

import { useMemo, useState } from "react"

type Props = {
  images: string[]
  productName: string
}

export function DigitalProductGallery({ images, productName }: Props) {
  const list = useMemo(
    () => images.filter((u) => typeof u === "string" && u.length > 0),
    [images]
  )
  const [active, setActive] = useState(0)
  const main = list[active] ?? null

  if (!main) {
    return (
      <div className="aspect-[3/4] w-full max-h-[min(80vh,720px)] border border-neutral-800 bg-neutral-950 flex items-center justify-center text-neutral-600 text-sm font-mono">
        No preview images in CMS
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] w-full max-h-[min(80vh,720px)] overflow-hidden rounded-sm border border-neutral-800 bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={productName}
          className="h-full w-full object-contain"
        />
      </div>
      {list.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 overflow-hidden border bg-neutral-900 ${
                i === active ? "border-blue-500/60" : "border-neutral-800"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.05)_6px,rgba(255,255,255,0.05)_12px)]" />
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
