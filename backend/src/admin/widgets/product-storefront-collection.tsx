import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

const LINE_COLLECTION_HANDLES = ["x", "y", "z"] as const

type AdminCollection = HttpTypes.AdminCollection

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

function collectionLineLabel(title?: string | null): string {
  const name = (title ?? "").trim() || "Collection"
  return `${name} | XYZ London`
}

const ProductStorefrontCollectionWidget = ({
  data,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const [savingId, setSavingId] = useState<string | null>(null)
  const [collections, setCollections] = useState<AdminCollection[]>([])
  const [assignedId, setAssignedId] = useState<string | null>(
    data.collection_id ?? data.collection?.id ?? null
  )

  const load = useCallback(async () => {
    const [collectionRes, productRes] = await Promise.all([
      adminFetch<{ collections: AdminCollection[] }>(
        "/admin/collections?limit=100&fields=id,title,handle"
      ),
      adminFetch<{ product: HttpTypes.AdminProduct }>(
        `/admin/products/${data.id}?fields=id,collection_id,*collection,*metadata`
      ),
    ])
    setCollections(collectionRes.collections ?? [])
    setAssignedId(
      productRes.product.collection_id ??
        productRes.product.collection?.id ??
        null
    )
  }, [data.id])

  useEffect(() => {
    void load().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to load collections"
      toast.error(message)
    })
  }, [load])

  const lineCollections = useMemo(() => {
    const byHandle = new Map(
      collections.map((collection) => [
        (collection.handle ?? "").toLowerCase(),
        collection,
      ])
    )
    return LINE_COLLECTION_HANDLES.map((handle) => byHandle.get(handle)).filter(
      (collection): collection is AdminCollection => Boolean(collection)
    )
  }, [collections])

  const assignCollection = async (collection: AdminCollection | null) => {
    const productRes = await adminFetch<{ product: HttpTypes.AdminProduct }>(
      `/admin/products/${data.id}?fields=*metadata`
    )
    const metadata = {
      ...((productRes.product.metadata as Record<string, unknown> | null) ??
        {}),
      collection_line: collection
        ? collectionLineLabel(collection.title)
        : "",
    }

    await adminFetch(`/admin/products/${data.id}`, {
      method: "POST",
      body: JSON.stringify({
        collection_id: collection?.id ?? null,
        metadata,
      }),
    })
  }

  const onAssign = async (collection: AdminCollection | null) => {
    const key = collection?.id ?? "__none__"
    setSavingId(key)
    try {
      await assignCollection(collection)
      await load()
      toast.success(
        collection
          ? `Assigned to collection ${collection.title}`
          : "Collection cleared"
      )
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not assign collection"
      toast.error(message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Line collection</Heading>
        <Text className="text-ui-fg-subtle mt-1" size="small">
          Every product belongs to one collection — X, Y, or Z — on top of its
          category.
        </Text>
      </div>

      <div className="px-6 py-4 flex flex-col gap-2">
        {lineCollections.length === 0 ? (
          <Text size="small" className="text-ui-fg-muted">
            Collections X, Y, and Z are not in the catalog yet. Run the
            ensure-xyz-collections script.
          </Text>
        ) : (
          <ul className="flex flex-col gap-1">
            {lineCollections.map((collection) => {
              const selected = assignedId === collection.id
              return (
                <li
                  key={collection.id}
                  className="flex items-center justify-between gap-2"
                >
                  <Text size="small">
                    {collection.title}
                    {selected ? " (assigned)" : ""}
                  </Text>
                  <Button
                    variant={selected ? "secondary" : "transparent"}
                    size="small"
                    isLoading={savingId === collection.id}
                    disabled={savingId !== null || selected}
                    onClick={() => void onAssign(collection)}
                  >
                    {selected ? "Assigned" : "Assign"}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}

        {assignedId && (
          <Button
            variant="transparent"
            size="small"
            isLoading={savingId === "__none__"}
            disabled={savingId !== null}
            onClick={() => void onAssign(null)}
          >
            Clear collection
          </Button>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductStorefrontCollectionWidget
