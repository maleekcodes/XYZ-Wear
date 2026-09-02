import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

const SHAPES = [
  "hexagon",
  "square",
  "rhombus",
  "trapezoid",
  "circle",
  "triangle",
  "pentagon",
  "octagon",
  "ellipse",
  "curve",
  "stackedSquares",
  "pairedSquares",
  "tallRect",
  "wideRect",
] as const

function isTruthy(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "true" || normalized === "1" || normalized === "yes"
  }
  return false
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  const body = (await res.json().catch(() => ({}))) as {
    message?: string
  } & T
  if (!res.ok) {
    throw new Error(body.message || `Request failed (${res.status})`)
  }
  return body
}

const CategoryStorefrontSettingsWidget = ({
  data,
}: DetailWidgetProps<HttpTypes.AdminProductCategory>) => {
  const [comingSoon, setComingSoon] = useState(false)
  const [hideOnStore, setHideOnStore] = useState(false)
  const [shape, setShape] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [saving, setSaving] = useState(false)

  const hydrate = useCallback((metadata: Record<string, unknown> | null | undefined) => {
    setComingSoon(isTruthy(metadata?.coming_soon))
    setHideOnStore(isTruthy(metadata?.hide_on_store))
    setShape(asString(metadata?.shape))
    setSubtitle(asString(metadata?.subtitle))
  }, [])

  const load = useCallback(async () => {
    const res = await adminFetch<{
      product_category: HttpTypes.AdminProductCategory
    }>(`/admin/product-categories/${data.id}?fields=id,metadata`)
    hydrate(res.product_category.metadata as Record<string, unknown> | null)
  }, [data.id, hydrate])

  useEffect(() => {
    void load().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to load category settings"
      toast.error(message)
    })
  }, [load])

  const onSave = async () => {
    setSaving(true)
    try {
      const current = await adminFetch<{
        product_category: HttpTypes.AdminProductCategory
      }>(`/admin/product-categories/${data.id}?fields=id,metadata`)
      const next: Record<string, unknown> = {
        ...((current.product_category.metadata as Record<string, unknown> | null) ??
          {}),
      }

      if (comingSoon) next.coming_soon = "true"
      else delete next.coming_soon
      if (hideOnStore) next.hide_on_store = "true"
      else delete next.hide_on_store
      if (shape.trim()) next.shape = shape.trim()
      else delete next.shape
      if (subtitle.trim()) next.subtitle = subtitle.trim()
      else delete next.subtitle

      await adminFetch(`/admin/product-categories/${data.id}`, {
        method: "POST",
        body: JSON.stringify({ metadata: next }),
      })
      await load()
      toast.success("Category storefront settings saved.")
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not save category settings"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h2">Storefront display</Heading>
          <Text className="text-ui-fg-subtle mt-1" size="small">
            Control how this type appears on Physical Form and Future Forms.
            Create types in Categories — Hoodies, Caps, Tees — instead of
            hardcoding them.
          </Text>
        </div>
        <Button onClick={() => void onSave()} isLoading={saving} disabled={saving}>
          Save
        </Button>
      </div>

      <div className="px-6 py-4 flex flex-col gap-4">
        <label className="flex items-start justify-between gap-4">
          <span>
            <Text size="small" weight="plus">
              Show in Future Forms
            </Text>
            <Text size="xsmall" className="text-ui-fg-muted">
              Use this for types that are not ready to sell yet.
            </Text>
          </span>
          <input
            type="checkbox"
            checked={comingSoon}
            onChange={(event) => setComingSoon(event.target.checked)}
          />
        </label>

        <label className="flex items-start justify-between gap-4">
          <span>
            <Text size="small" weight="plus">
              Hide on store
            </Text>
            <Text size="xsmall" className="text-ui-fg-muted">
              Keep the category in Admin but off the storefront.
            </Text>
          </span>
          <input
            type="checkbox"
            checked={hideOnStore}
            onChange={(event) => setHideOnStore(event.target.checked)}
          />
        </label>

        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="category-shape">Future Forms shape</Label>
          <select
            id="category-shape"
            value={shape}
            onChange={(event) => setShape(event.target.value)}
            className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm"
          >
            <option value="">Automatic</option>
            {SHAPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="category-subtitle">Subtitle</Label>
          <Input
            id="category-subtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            placeholder="Optional line under the category name"
          />
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details.after",
})

export default CategoryStorefrontSettingsWidget
