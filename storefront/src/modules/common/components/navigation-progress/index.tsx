"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { isDigitalRoute } from "@lib/util/is-digital-route"

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false
  if (anchor.hasAttribute("download")) return false
  if (anchor.getAttribute("rel")?.includes("external")) return false

  const next = new URL(anchor.href, window.location.href)
  if (next.origin !== window.location.origin) return false

  const current = `${window.location.pathname}${window.location.search}`
  const target = `${next.pathname}${next.search}`
  if (current === target) return false

  return true
}

function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = `${pathname}?${searchParams.toString()}`
  const [active, setActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const timers = useRef<number[]>([])
  const activeRef = useRef(false)
  const skipFirstRoute = useRef(true)

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }

  const start = () => {
    clearTimers()
    activeRef.current = true
    setActive(true)

    if (prefersReducedMotion()) {
      setProgress(80)
      return
    }

    setProgress(12)
    timers.current.push(window.setTimeout(() => setProgress(42), 140))
    timers.current.push(window.setTimeout(() => setProgress(68), 420))
    timers.current.push(window.setTimeout(() => setProgress(82), 1100))
    timers.current.push(window.setTimeout(() => setProgress(90), 2400))
    timers.current.push(window.setTimeout(finish, 10000))
  }

  const finish = () => {
    if (!activeRef.current) return
    clearTimers()
    setProgress(100)
    timers.current.push(
      window.setTimeout(() => {
        activeRef.current = false
        setActive(false)
        setProgress(0)
      }, prefersReducedMotion() ? 80 : 280)
    )
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest("a")
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (!isInternalNavigation(anchor)) return

      start()
    }

    const onPopState = () => start()

    document.addEventListener("click", onClick, true)
    window.addEventListener("popstate", onPopState)

    return () => {
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("popstate", onPopState)
      clearTimers()
    }
  }, [])

  useEffect(() => {
    if (skipFirstRoute.current) {
      skipFirstRoute.current = false
      return
    }
    finish()
  }, [routeKey])

  const digital = isDigitalRoute(pathname)

  return (
    <div
      role="progressbar"
      aria-label="Navigating"
      aria-hidden={!active}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={active ? Math.round(progress) : 0}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
    >
      <div
        className={`h-[2px] origin-left will-change-transform transition-[transform,opacity] duration-300 ease-out ${
          digital
            ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.45)]"
            : "bg-deepBlack shadow-[0_0_8px_rgba(15,15,15,0.35)]"
        }`}
        style={{
          transform: `scaleX(${progress / 100})`,
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  )
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  )
}
