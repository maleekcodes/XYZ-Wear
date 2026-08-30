import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function listProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)

  const [products, count] = await productModule.listAndCountProducts(
    {},
    { select: ["id", "title", "handle"], take: 100 }
  )

  logger.info(`Catalog has ${count} product(s)`)
  for (const product of products) {
    logger.info(`- ${product.handle ?? product.id} | ${product.title}`)
  }
}
