import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

type Field = {
  key: string
  label: string
  hint?: string
  multiline?: boolean
  rows?: number
}

const FIELD_GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: "Storefront copy",
    fields: [
      {
        key: "display_title",
        label: "Storefront title",
        hint: "Overrides the product title on the storefront. Leave blank to strip any X_ / Y_ / Z_ prefix automatically.",
      },
      {
        key: "tagline",
        label: "Tagline",
        hint: "Shown under the title. Color names swap with the selected color.",
      },
      {
        key: "collection_line",
        label: "Collection line",
        hint: "Italic line under the tagline, e.g. X | XYZ London.",
      },
      { key: "overview", label: "Overview", multiline: true, rows: 3 },
      { key: "type_label", label: "Type label" },
      {
        key: "origin_label",
        label: "Country of origin label",
        hint: "Shown in Details. Leave blank to use the product Origin country field.",
      },
      {
        key: "fit_label",
        label: "Card fit label",
        hint: "Short footer on catalog cards, e.g. Regular Fit or One Size.",
      },
    ],
  },
  {
    title: "Details & materials",
    fields: [
      { key: "composition", label: "Composition" },
      { key: "fabric_weight", label: "Fabric weight" },
      {
        key: "design_details",
        label: "Design details",
        multiline: true,
        rows: 3,
      },
      { key: "core_product_id", label: "Core product ID" },
      { key: "item_number", label: "Item number" },
    ],
  },
  {
    title: "Fit & care",
    fields: [
      { key: "fit", label: "Fit", multiline: true, rows: 3 },
      { key: "care", label: "Care", multiline: true, rows: 4 },
      { key: "size_info", label: "Size info" },
      {
        key: "size_info_detail",
        label: "Size info detail",
        multiline: true,
        rows: 2,
      },
    ],
  },
  {
    title: "Shipping, returns & size guide",
    fields: [
      {
        key: "shipping_copy",
        label: "Shipping copy",
        hint: "Leave blank to hide shipping copy on the product page.",
        multiline: true,
        rows: 4,
      },
      {
        key: "returns_copy",
        label: "Returns copy",
        hint: "Leave blank to hide returns copy on the product page.",
        multiline: true,
        rows: 3,
      },
      { key: "size_guide_title", label: "Size guide title" },
      {
        key: "size_guide_intro",
        label: "Size guide intro",
        multiline: true,
        rows: 2,
      },
      {
        key: "size_guide",
        label: "Size guide table (JSON)",
        hint: '{"columns":["Fit","Notes"],"rows":[["One Size","Adjustable"]]}',
        multiline: true,
        rows: 4,
      },
    ],
  },
]

const KNOWN_KEYS = new Set(FIELD_GROUPS.flatMap((group) => group.fields.map((field) => field.key)))

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

function asEditableString(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return ""
}

function valuesFromMetadata(metadata: Record<string, unknown> | null | undefined) {
  const values: Record<string, string> = {}
  for (const key of KNOWN_KEYS) {
    values[key] = asEditableString(metadata?.[key])
  }
  return values
}

function extrasFromMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return []
  return Object.entries(metadata)
    .filter(([key, value]) => !KNOWN_KEYS.has(key) && typeof value === "string")
    .map(([key, value]) => ({
      id: key,
      key,
      value: value as string,
    }))
}

const ProductStorefrontCopyWidget = ({
  data,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const [values, setValues] = useState(() =>
    valuesFromMetadata(data.metadata as Record<string, unknown> | null)
  )
  const [extras, setExtras] = useState(() =>
    extrasFromMetadata(data.metadata as Record<string, unknown> | null)
  )
  const [newKey, setNewKey] = useState("")
  const [saving, setSaving] = useState(false)

  const hydrate = useCallback((metadata: Record<string, unknown> | null | undefined) => {
    setValues(valuesFromMetadata(metadata))
    setExtras(extrasFromMetadata(metadata))
  }, [])

  const load = useCallback(async () => {
    const res = await adminFetch<{ product: HttpTypes.AdminProduct }>(
      `/admin/products/${data.id}?fields=id,metadata`
    )
    hydrate(res.product.metadata as Record<string, unknown> | null)
  }, [data.id, hydrate])

  useEffect(() => {
    void load().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to load product copy"
      toast.error(message)
    })
  }, [load])

  const extraKeys = useMemo(
    () => new Set(extras.map((row) => row.key.trim()).filter(Boolean)),
    [extras]
  )

  const setField = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const addCustomField = () => {
    const key = newKey.trim()
    if (!key) {
      toast.error("Enter a field key")
      return
    }
    if (KNOWN_KEYS.has(key) || extraKeys.has(key)) {
      toast.error("That field already exists")
      return
    }
    setExtras((current) => [...current, { id: `${key}-${Date.now()}`, key, value: "" }])
    setNewKey("")
  }

  const onSave = async () => {
    setSaving(true)
    try {
      const current = await adminFetch<{ product: HttpTypes.AdminProduct }>(
        `/admin/products/${data.id}?fields=id,metadata`
      )
      const next: Record<string, unknown> = {
        ...((current.product.metadata as Record<string, unknown> | null) ?? {}),
      }

      for (const key of KNOWN_KEYS) {
        const trimmed = (values[key] ?? "").trim()
        if (trimmed) next[key] = trimmed
        else delete next[key]
      }

      const keptExtraKeys = new Set<string>()
      for (const row of extras) {
        const key = row.key.trim()
        if (!key || KNOWN_KEYS.has(key)) continue
        keptExtraKeys.add(key)
        const trimmed = row.value.trim()
        if (trimmed) next[key] = trimmed
        else delete next[key]
      }

      for (const key of Object.keys(next)) {
        if (!KNOWN_KEYS.has(key) && typeof next[key] === "string" && !keptExtraKeys.has(key)) {
          delete next[key]
        }
      }

      await adminFetch(`/admin/products/${data.id}`, {
        method: "POST",
        body: JSON.stringify({ metadata: next }),
      })
      await load()
      toast.success("Storefront copy saved. Refresh the product page to see it.")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not save storefront copy"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between gap-4 px-6 py-4">
        <div>
          <Heading level="h2">Storefront copy</Heading>
          <Text className="text-ui-fg-subtle mt-1" size="small">
            Edit tagline, materials, fit, and shipping text. These fields drive
            the product page and can be changed anytime.
          </Text>
        </div>
        <Button onClick={() => void onSave()} isLoading={saving} disabled={saving}>
          Save copy
        </Button>
      </div>

      {FIELD_GROUPS.map((group) => (
        <div key={group.title} className="px-6 py-4 flex flex-col gap-4">
          <Text size="small" weight="plus" className="text-ui-fg-subtle">
            {group.title}
          </Text>
          <div className="grid grid-cols-1 gap-4 medium:grid-cols-2">
            {group.fields.map((field) => (
              <div
                key={field.key}
                className={field.multiline ? "flex flex-col gap-y-1.5 medium:col-span-2" : "flex flex-col gap-y-1.5"}
              >
                <Label htmlFor={`storefront-${field.key}`}>{field.label}</Label>
                {field.hint && (
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {field.hint}
                  </Text>
                )}
                {field.multiline ? (
                  <Textarea
                    id={`storefront-${field.key}`}
                    rows={field.rows ?? 3}
                    value={values[field.key] ?? ""}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                ) : (
                  <Input
                    id={`storefront-${field.key}`}
                    value={values[field.key] ?? ""}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="px-6 py-4 flex flex-col gap-4">
        <Text size="small" weight="plus" className="text-ui-fg-subtle">
          Custom fields
        </Text>
        <Text size="xsmall" className="text-ui-fg-muted">
          Add any extra metadata key. Use tagline_green or tagline_purple for a
          color-specific tagline.
        </Text>

        {extras.map((row) => (
          <div key={row.id} className="grid grid-cols-1 gap-2 medium:grid-cols-[12rem_1fr_auto]">
            <Input
              placeholder="key"
              value={row.key}
              onChange={(event) =>
                setExtras((current) =>
                  current.map((item) =>
                    item.id === row.id ? { ...item, key: event.target.value } : item
                  )
                )
              }
            />
            <Textarea
              rows={2}
              placeholder="value"
              value={row.value}
              onChange={(event) =>
                setExtras((current) =>
                  current.map((item) =>
                    item.id === row.id ? { ...item, value: event.target.value } : item
                  )
                )
              }
            />
            <Button
              variant="transparent"
              onClick={() =>
                setExtras((current) => current.filter((item) => item.id !== row.id))
              }
            >
              Remove
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Input
            placeholder="New field key, e.g. tagline_green"
            value={newKey}
            onChange={(event) => setNewKey(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                addCustomField()
              }
            }}
          />
          <Button variant="secondary" onClick={addCustomField}>
            Add field
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductStorefrontCopyWidget
