export const LINE_COLLECTION_HANDLES = ["x", "y", "z"] as const

export type LineCollectionHandle = (typeof LINE_COLLECTION_HANDLES)[number]

export function normalizeHandle(value?: string | null): string {
  return (value ?? "").trim().toLowerCase()
}

export function isLineCollectionHandle(
  value?: string | null
): value is LineCollectionHandle {
  return LINE_COLLECTION_HANDLES.includes(
    normalizeHandle(value) as LineCollectionHandle
  )
}

export function lineCollectionLabel(handle?: string | null): string {
  const normalized = normalizeHandle(handle)
  if (isLineCollectionHandle(normalized)) return normalized.toUpperCase()
  return (handle ?? "").trim() || "Collection"
}

export function lineCollectionSectionLabel(handle?: string | null): string {
  const normalized = normalizeHandle(handle)
  if (isLineCollectionHandle(normalized)) return `${normalized.toUpperCase()}-Line`
  return lineCollectionLabel(handle)
}
