"use client"

import { useId, useState } from "react"

import styles from "./cyberx-visual.module.css"

const CYBERX_IMAGE_ID = "1a018cc8f0ab5d06efafdb4f93d27d23323ad108"

export function isCyberxVisual(slug: string | null | undefined, image: string) {
  return slug === "cyberx-jacket" && image.includes(CYBERX_IMAGE_ID)
}

type Props = {
  image: string
  alt: string
  controls?: boolean
}

export function CyberxVisual({ image, alt, controls = false }: Props) {
  const [paused, setPaused] = useState(false)
  const id = useId().replace(/:/g, "")

  return (
    <div className={`${styles.frame} ${paused ? styles.paused : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={alt} className={styles.image} />
      <svg
        className={styles.effects}
        viewBox="0 0 992 1067"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={`${id}-jacket`}>
            <path d="M429 39 Q493 32 563 39 L610 77 Q728 107 804 204 Q881 249 922 379 Q964 525 967 675 Q967 807 899 923 L850 990 L745 1017 L697 963 L562 955 L430 955 L295 963 L243 1016 L133 992 L94 938 Q32 839 20 719 Q14 589 54 410 Q91 273 181 212 Q258 112 377 78 Z" />
          </clipPath>
          <linearGradient id={`${id}-shift`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#53e6f4" stopOpacity="0" />
            <stop offset=".45" stopColor="#65f2ff" stopOpacity=".44" />
            <stop offset=".65" stopColor="#e462ee" stopOpacity=".38" />
            <stop offset="1" stopColor="#e462ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-trace`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#57e8f0" />
            <stop offset=".5" stopColor="#e16bed" />
            <stop offset="1" stopColor="#57e8f0" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${id}-jacket)`} className={styles.shift}>
          <rect
            x="-520"
            y="0"
            width="630"
            height="1067"
            fill={`url(#${id}-shift)`}
            className={styles.sweep}
          />
        </g>

        <g
          fill="none"
          stroke={`url(#${id}-trace)`}
          strokeLinecap="round"
          strokeWidth="4"
          className={styles.traces}
        >
          <path d="M197 211 Q283 101 382 81" />
          <path d="M610 79 Q738 118 805 210" />
          <path d="M182 316 Q93 491 83 690 Q72 837 133 936" />
          <path d="M807 317 Q899 496 914 675 Q925 832 858 942" />
          <path d="M493 242 L493 921" />
        </g>

      </svg>
      <span className={styles.logoLeft} aria-hidden="true" />
      <span className={styles.logoRight} aria-hidden="true" />
      {controls ? (
        <button
          type="button"
          className={styles.control}
          aria-label={paused ? "Play jacket effects" : "Pause jacket effects"}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play effects" : "Pause effects"}
        </button>
      ) : null}
    </div>
  )
}
