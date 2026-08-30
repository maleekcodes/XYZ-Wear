import { readFileSync } from "fs"
import { join } from "path"
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  deleteProductVariantsWorkflow,
  updateProductOptionsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

const HANDLE = "x-money-orders-tee"

const IMAGES = [
  {
    filename: "x-money-orders-tee-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "x-money-orders-tee-back.jpg",
    mimeType: "image/jpeg",
  },
] as const

export default async function updateXMoneyOrdersTeeMedia({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  const fileModule = container.resolve(Modules.FILE)

  const [product] = await productModule.listProducts(
    { handle: HANDLE },
    {
      take: 1,
      relations: ["variants", "variants.options", "options", "options.values"],
    }
  )

  if (!product) {
    throw new Error(`Product not found: ${HANDLE}`)
  }

  const assetsDir = join(process.cwd(), "src/scripts/assets")
  const uploaded = await fileModule.createFiles(
    IMAGES.map((image) => ({
      filename: image.filename,
      mimeType: image.mimeType,
      access: "public" as const,
      content: readFileSync(join(assetsDir, image.filename)).toString("base64"),
    }))
  )

  const imageUrls = uploaded.map((file) =>
    file.url.replace("://localhost:9000/", "://localhost:9001/")
  )
  logger.info(`Uploaded ${uploaded.length} image(s): ${imageUrls.join(", ")}`)

  await updateProductsWorkflow(container).run({
    input: {
      selector: { id: product.id },
      update: {
        images: imageUrls.map((url) => ({ url })),
        thumbnail: imageUrls[0],
      },
    },
  })
  logger.info("Attached images (front, then back) and set thumbnail.")

  const whiteVariantIds = (product.variants ?? [])
    .filter((variant) =>
      (variant.options ?? []).some(
        (option) => option.value?.toLowerCase() === "white"
      )
    )
    .map((variant) => variant.id)
    .filter((id): id is string => Boolean(id))

  if (whiteVariantIds.length) {
    await deleteProductVariantsWorkflow(container).run({
      input: { ids: whiteVariantIds },
    })
    logger.info(`Deleted ${whiteVariantIds.length} White variant(s).`)
  }

  const colorOption = (product.options ?? []).find(
    (option) => option.title?.toLowerCase() === "color"
  )
  if (colorOption?.id) {
    await updateProductOptionsWorkflow(container).run({
      input: {
        selector: { id: colorOption.id },
        update: { values: ["Black"] },
      },
    })
    logger.info("Color option is now Black only.")
  }

  logger.info("Done.")
}
