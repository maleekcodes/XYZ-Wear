import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

type OptionValue = {
  id?: string
  value?: string
}

function isAppearanceOption(title?: string | null): boolean {
  const t = title?.toLowerCase() ?? ""
  return t.includes("color") || t.includes("colour") || t.includes("finish")
}

function asHex(value: string): string | null {
  const trimmed = value.trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return trimmed
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return `#${trimmed}`
  return null
}

function parseMap(raw: unknown): Record<string, string> {
  if (!raw) return {}
  let data: unknown = raw
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (!data || typeof data !== "object") return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof value === "string" && asHex(value)) out[key] = asHex(value)!
  }
  return out
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

const ProductStorefrontSwatchesWidget = ({
  data,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const [labels, setLabels] = useState<string[]>([])
  const [colors, setColors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await adminFetch<{ product: HttpTypes.AdminProduct }>(
      `/admin/products/${data.id}?fields=id,metadata,*options,*options.values`
    )
    const option = (res.product.options ?? []).find((item) =>
      isAppearanceOption(item.title)
    )
    const values = ((option?.values ?? []) as OptionValue[])
      .map((item) => item.value?.trim())
      .filter((value): value is string => Boolean(value))
    const unique = [...new Set(values)]
    setLabels(unique)
    setColors(parseMap(res.product.metadata?.swatch_colors))
  }, [data.id])

  useEffect(() => {
    void load().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to load color swatches"
      toast.error(message)
    })
  }, [load])

  const rows = useMemo(
    () =>
      labels.map((label) => ({
        label,
        hex: colors[label] ?? "",
      })),
    [colors, labels]
  )

  const onSave = async () => {
    setSaving(true)
    try {
      const current = await adminFetch<{ product: HttpTypes.AdminProduct }>(
        `/admin/products/${data.id}?fields=id,metadata`
      )
      const next: Record<string, unknown> = {
        ...((current.product.metadata as Record<string, unknown> | null) ?? {}),
      }
      const map: Record<string, string> = {}
      for (const row of rows) {
        const hex = asHex(colors[row.label] ?? "")
        if (hex) map[row.label] = hex
      }
      if (Object.keys(map).length) next.swatch_colors = map
      else delete next.swatch_colors

      await adminFetch(`/admin/products/${data.id}`, {
        method: "POST",
        body: JSON.stringify({ metadata: next }),
      })
      await load()
      toast.success("Color swatches saved. Refresh the storefront to see them.")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not save color swatches"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h2">Color swatches</Heading>
          <Text className="text-ui-fg-subtle mt-1" size="small">
            These circles appear on catalog cards. Pick the hex for each Color
            option — they are not taken from product photos.
          </Text>
        </div>
        <Button onClick={() => void onSave()} isLoading={saving} disabled={saving}>
          Save swatches
        </Button>
      </div>

      <div className="px-6 py-4 flex flex-col gap-3">
        {rows.length === 0 ? (
          <Text size="small" className="text-ui-fg-muted">
            Add a Color (or Colour / Finish) option on this product first.
          </Text>
        ) : (
          rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_auto_8rem] items-center gap-3"
            >
              <Label>{row.label}</Label>
              <input
                type="color"
                aria-label={`${row.label} color`}
                value={asHex(row.hex) ?? "#d4d4d4"}
                onChange={(event) =>
                  setColors((current) => ({
                    ...current,
                    [row.label]: event.target.value,
                  }))
                }
                className="h-8 w-10 cursor-pointer rounded border border-ui-border-base bg-transparent p-0"
              />
              <Input
                placeholder="#171717"
                value={row.hex}
                onChange={(event) =>
                  setColors((current) => ({
                    ...current,
                    [row.label]: event.target.value,
                  }))
                }
              />
            </div>
          ))
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductStorefrontSwatchesWidget
