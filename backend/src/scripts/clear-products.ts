import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  deleteCollectionsWorkflow,
  deleteProductsWorkflow,
  deleteReservationsWorkflow,
} from "@medusajs/medusa/core-flows"

const PAGE_SIZE = 100

export default async function clearProductCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  const inventoryModule = container.resolve(Modules.INVENTORY)

  const reservations = await inventoryModule.listReservationItems(
    {},
    { select: ["id"], take: 1000 }
  )

  if (reservations.length) {
    logger.info(
      `Deleting ${reservations.length} inventory reservation(s) so products can be removed...`
    )
    await deleteReservationsWorkflow(container).run({
      input: { ids: reservations.map((reservation) => reservation.id) },
    })
  }

  let deletedProducts = 0

  while (true) {
    const [products, remaining] = await productModule.listAndCountProducts(
      {},
      { select: ["id", "title", "handle"], take: PAGE_SIZE, skip: 0 }
    )

    if (!products.length) {
      break
    }

    logger.info(`Deleting ${products.length} of ${remaining} product(s)...`)
    for (const product of products) {
      logger.info(`  - ${product.handle ?? product.id} (${product.title})`)
    }

    await deleteProductsWorkflow(container).run({
      input: { ids: products.map((product) => product.id) },
    })

    deletedProducts += products.length
  }

  const collections = await productModule.listProductCollections(
    {},
    { select: ["id", "title", "handle"] }
  )

  if (collections.length) {
    logger.info(`Deleting ${collections.length} collection(s)...`)
    await deleteCollectionsWorkflow(container).run({
      input: { ids: collections.map((collection) => collection.id) },
    })
  }

  const [, leftover] = await productModule.listAndCountProducts()
  logger.info(
    `Cleared ${deletedProducts} product(s) and ${collections.length} collection(s). Remaining products: ${leftover}.`
  )
}
