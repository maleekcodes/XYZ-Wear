import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  updateProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"

const LINE_COLLECTIONS = [
  { title: "X", handle: "x" },
  { title: "Y", handle: "y" },
  { title: "Z", handle: "z" },
] as const

const TEE_HANDLE = "x-money-orders-tee"

export default async function ensureXyzCollections({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)

  const existing = await productModule.listProductCollections(
    {},
    { take: 50, select: ["id", "title", "handle"] }
  )
  const byHandle = new Map(
    existing.map((collection) => [collection.handle, collection])
  )

  const missing = LINE_COLLECTIONS.filter(
    (line) => !byHandle.has(line.handle)
  )
  if (missing.length) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: missing.map((line) => ({ ...line })) },
    })
    for (const collection of result) {
      byHandle.set(collection.handle, collection)
      logger.info(`Created collection ${collection.title} (${collection.handle})`)
    }
  }

  const categories = await productModule.listProductCategories(
    {},
    { take: 100, select: ["id", "name", "handle", "is_internal"] }
  )
  for (const category of categories) {
    const handle = (category.handle ?? "").toLowerCase()
    const name = (category.name ?? "").trim().toLowerCase()
    const isLineCategory = ["x", "y", "z"].includes(handle) || ["x", "y", "z"].includes(name)
    if (!isLineCategory || category.is_internal) {
      continue
    }
    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: { id: category.id },
        update: { is_internal: true },
      },
    })
    logger.info(
      `Hid category "${category.name}" — X/Y/Z are collections, not categories`
    )
  }

  const tees = categories.find(
    (category) => (category.name ?? "").trim().toLowerCase() === "tees"
  )
  if (tees && tees.handle !== "tees") {
    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: { id: tees.id },
        update: { handle: "tees" },
      },
    })
    logger.info(`Renamed Tees handle ${tees.handle} → tees`)
  }

  const xCollection = byHandle.get("x")
  if (!xCollection) {
    throw new Error("X collection was not created")
  }

  const [tee] = await productModule.listProducts(
    { handle: TEE_HANDLE },
    { take: 1, select: ["id", "title", "metadata", "collection_id"] }
  )
  if (!tee) {
    logger.info(`No ${TEE_HANDLE} product found. Collections are ready.`)
    return
  }

  const metadata = {
    ...((tee.metadata as Record<string, unknown> | null) ?? {}),
    collection_line: "X | XYZ London",
  }
  await productModule.updateProducts(tee.id, {
    collection_id: xCollection.id,
    metadata,
  })
  logger.info(`Assigned ${tee.title} to collection X`)
}
