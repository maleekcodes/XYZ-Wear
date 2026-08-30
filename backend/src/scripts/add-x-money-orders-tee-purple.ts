import { readFileSync } from "fs"
import { join } from "path"
import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductVariantsWorkflow,
  updateProductOptionsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

const HANDLE = "x-money-orders-tee"
const COLOR = "Purple"
const COLOR_TOKEN = "purple"
const SIZES = ["S", "M", "L", "XL"] as const

const PURPLE_IMAGES = [
  {
    filename: "x-money-orders-tee-purple-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "x-money-orders-tee-purple-back.jpg",
    mimeType: "image/jpeg",
  },
] as const

function variantSku(size: string, color: string) {
  return `XYZ1215-${size}-${color.toUpperCase()}`
}

function publicImageUrl(url: string) {
  return url.replace("://localhost:9000/", "://localhost:9001/")
}

export default async function addXMoneyOrdersTeePurple({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const fileModule = container.resolve(Modules.FILE)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

  const [product] = await productModule.listProducts(
    { handle: HANDLE },
    {
      take: 1,
      relations: [
        "variants",
        "variants.options",
        "options",
        "options.values",
        "images",
      ],
    }
  )

  if (!product) {
    throw new Error(`Product not found: ${HANDLE}`)
  }

  const colorOption = (product.options ?? []).find(
    (option) => option.title?.toLowerCase() === "color"
  )
  if (!colorOption?.id) {
    throw new Error("Color option not found on product.")
  }

  const colorValues = new Set(
    (colorOption.values ?? [])
      .map((value) => value.value)
      .filter((value): value is string => Boolean(value))
  )
  colorValues.add("Black")
  colorValues.add("Green")
  colorValues.add(COLOR)

  await updateProductOptionsWorkflow(container).run({
    input: {
      selector: { id: colorOption.id },
      update: { values: [...colorValues] },
    },
  })
  logger.info(`Color option values: ${[...colorValues].join(", ")}`)

  const existingColorSkus = new Set(
    (product.variants ?? [])
      .filter((variant) =>
        (variant.options ?? []).some(
          (option) => option.value?.toLowerCase() === COLOR.toLowerCase()
        )
      )
      .map((variant) => variant.sku)
      .filter((sku): sku is string => Boolean(sku))
  )

  const variantsToCreate = SIZES.filter(
    (size) => !existingColorSkus.has(variantSku(size, COLOR))
  ).map((size) => ({
    product_id: product.id,
    title: `${size} / ${COLOR}`,
    sku: variantSku(size, COLOR),
    options: {
      Color: COLOR,
      Size: size,
    },
    prices: [
      { amount: 10, currency_code: "eur" },
      { amount: 15, currency_code: "usd" },
    ],
  }))

  if (variantsToCreate.length) {
    await createProductVariantsWorkflow(container).run({
      input: {
        product_variants: variantsToCreate,
      },
    })
    logger.info(`Created ${variantsToCreate.length} Purple variant(s).`)
  } else {
    logger.info("Purple variants already exist.")
  }

  const [location] = await stockLocationModule.listStockLocations(
    {},
    { take: 1 }
  )
  if (location && variantsToCreate.length) {
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
      filters: {
        sku: variantsToCreate.map((variant) => variant.sku),
      },
    })

    const inventoryLevels: CreateInventoryLevelInput[] = (
      inventoryItems as { id: string }[]
    ).map((item) => ({
      location_id: location.id,
      stocked_quantity: 100,
      inventory_item_id: item.id,
    }))

    if (inventoryLevels.length) {
      await createInventoryLevelsWorkflow(container).run({
        input: { inventory_levels: inventoryLevels },
      })
      logger.info(
        `Set inventory on ${inventoryLevels.length} Purple variant(s).`
      )
    }
  } else if (!location) {
    logger.warn("No stock location found — skipping inventory levels.")
  }

  const existingUrls = (product.images ?? [])
    .map((image) => image.url)
    .filter((url): url is string => Boolean(url))
    .map(publicImageUrl)

  let purpleUrls = existingUrls.filter((url) =>
    url.toLowerCase().includes(COLOR_TOKEN)
  )

  if (!purpleUrls.length) {
    const assetsDir = join(process.cwd(), "src/scripts/assets")
    const uploaded = await fileModule.createFiles(
      PURPLE_IMAGES.map((image) => ({
        filename: image.filename,
        mimeType: image.mimeType,
        access: "public" as const,
        content: readFileSync(join(assetsDir, image.filename)).toString(
          "base64"
        ),
      }))
    )
    purpleUrls = uploaded.map((file) => publicImageUrl(file.url))
    logger.info(`Uploaded ${purpleUrls.length} Purple image(s).`)
  } else {
    logger.info("Purple images already attached.")
  }

  const otherUrls = existingUrls.filter(
    (url) => !url.toLowerCase().includes(COLOR_TOKEN)
  )
  const imageUrls = [...otherUrls, ...purpleUrls]
  const thumbnail =
    otherUrls.find((url) => !/(green|purple)/i.test(url)) ??
    otherUrls[0] ??
    imageUrls[0]

  await updateProductsWorkflow(container).run({
    input: {
      selector: { id: product.id },
      update: {
        images: imageUrls.map((url) => ({ url })),
        thumbnail,
      },
    },
  })
  logger.info(`Product now has ${imageUrls.length} image(s).`)
  logger.info("Done.")
}
