import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  DetailWidgetProps,
  HttpTypes,
} from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

const LINE_COLLECTION_HANDLES = new Set(["x", "y", "z"])

type AdminCategory = HttpTypes.AdminProductCategory

function isProductTypeCategory(category: AdminCategory): boolean {
  const handle = (category.handle ?? "").toLowerCase()
  const name = (category.name ?? "").trim().toLowerCase()
  return !LINE_COLLECTION_HANDLES.has(handle) && !LINE_COLLECTION_HANDLES.has(name)
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

const ProductStorefrontCategoriesWidget = ({
  data,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const [name, setName] = useState("")
  const [comingSoon, setComingSoon] = useState(false)
  const [saving, setSaving] = useState(false)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [assigned, setAssigned] = useState<AdminCategory[]>(
    (data.categories ?? []) as AdminCategory[]
  )

  const load = useCallback(async () => {
    const [categoryRes, productRes] = await Promise.all([
      adminFetch<{ product_categories: AdminCategory[] }>(
        "/admin/product-categories?limit=200&fields=id,name,handle,is_active,is_internal"
      ),
      adminFetch<{ product: HttpTypes.AdminProduct }>(
        `/admin/products/${data.id}?fields=*categories`
      ),
    ])
    setCategories(categoryRes.product_categories ?? [])
    setAssigned((productRes.product.categories ?? []) as AdminCategory[])
  }, [data.id])

  useEffect(() => {
    void load().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to load categories"
      toast.error(message)
    })
  }, [load])

  const assignedIds = useMemo(
    () => new Set(assigned.map((c) => c.id)),
    [assigned]
  )

  const available = useMemo(
    () =>
      categories
        .filter((c) => !assignedIds.has(c.id))
        .filter((c) => c.is_active !== false && c.is_internal !== true)
        .filter(isProductTypeCategory)
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [assignedIds, categories]
  )

  const assignCategory = async (categoryId: string) => {
    await adminFetch(`/admin/product-categories/${categoryId}/products`, {
      method: "POST",
      body: JSON.stringify({ add: [data.id] }),
    })
  }

  const onCreateAndAssign = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Enter a category name")
      return
    }

    setSaving(true)
    try {
      const created = await adminFetch<{
        product_category: AdminCategory
      }>("/admin/product-categories", {
        method: "POST",
        body: JSON.stringify({
          name: trimmed,
          is_active: true,
          is_internal: false,
          metadata: comingSoon ? { coming_soon: "true" } : undefined,
        }),
      })

      if (!comingSoon) {
        await assignCategory(created.product_category.id)
      }
      setName("")
      setComingSoon(false)
      await load()
      toast.success(
        comingSoon
          ? `"${trimmed}" created for Future Forms.`
          : `"${trimmed}" created and assigned. It will show on Physical Form.`
      )
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not create category"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const onAssignExisting = async (categoryId: string) => {
    setAssigningId(categoryId)
    try {
      await assignCategory(categoryId)
      await load()
      toast.success("Category assigned. It will show on Physical Form.")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not assign category"
      toast.error(message)
    } finally {
      setAssigningId(null)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Physical Form categories</Heading>
        <Text className="text-ui-fg-subtle mt-1" size="small">
          Assign the product type — Tees, Caps, Hoodies, and so on. Create new
          types here; they appear on Physical Form. Mark a category as Future
          Forms on the category page. Collections (X, Y, Z) are set below.
        </Text>
      </div>

      <div className="px-6 py-4 flex flex-col gap-3">
        {assigned.filter(isProductTypeCategory).length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {assigned.filter(isProductTypeCategory).map((category) => (
              <li
                key={category.id}
                className="rounded-full border border-ui-border-base px-3 py-1 text-xs"
              >
                {category.name}
              </li>
            ))}
          </ul>
        ) : (
          <Text size="small" className="text-ui-fg-muted">
            No categories assigned yet.
          </Text>
        )}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={comingSoon}
            onChange={(event) => setComingSoon(event.target.checked)}
          />
          <Text size="small">Show this type in Future Forms</Text>
        </label>

        <div className="flex gap-2">
          <Input
            placeholder="New category name, e.g. Hoodies"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void onCreateAndAssign()
              }
            }}
          />
          <Button
            variant="secondary"
            onClick={() => void onCreateAndAssign()}
            isLoading={saving}
            disabled={saving || !name.trim()}
          >
            Create & assign
          </Button>
        </div>

        {available.length > 0 && (
          <div className="flex flex-col gap-2">
            <Text size="small" className="text-ui-fg-subtle">
              Or assign an existing category
            </Text>
            <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {available.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between gap-2"
                >
                  <Text size="small">{category.name}</Text>
                  <Button
                    variant="transparent"
                    size="small"
                    isLoading={assigningId === category.id}
                    disabled={assigningId !== null}
                    onClick={() => void onAssignExisting(category.id)}
                  >
                    Assign
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductStorefrontCategoriesWidget
