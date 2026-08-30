import { readFileSync } from "fs"
import { join } from "path"
import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"

const HANDLE = "y-26-suede-mesh-trucker-cap"
const COLOR = "Black"
const SIZE = "One Size"
const SKU = "XYZ006677-OS-BLACK"

const DESCRIPTION = `Designed with a faux-suede front panel and visor paired with a breathable rear mesh crown, this trucker cap merges elevated tactile texture with classic streetwear utility. It features a bold, 3D puff-embroidered XYZ LONDON logo on the front, silver side script embroidery, and a woven branding label above an adjustable snapback closure for a custom fit.`

const IMAGES = [
  {
    filename: "y-26-suede-mesh-trucker-cap-black-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "y-26-suede-mesh-trucker-cap-black-side.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "y-26-suede-mesh-trucker-cap-black-back.jpg",
    mimeType: "image/jpeg",
  },
] as const

function publicImageUrl(url: string) {
  return url.replace("://localhost:9000/", "://localhost:9001/")
}

export default async function createY26SuedeMeshTruckerCap({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const fileModule = container.resolve(Modules.FILE)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

  const existing = await productModule.listProducts(
    { handle: HANDLE },
    { select: ["id", "title"] }
  )
  if (existing.length) {
    logger.info(
      `Product already exists: ${existing[0].title} (${existing[0].id}). Skipping.`
    )
    return
  }

  const [salesChannel] = await salesChannelModule.listSalesChannels(
    {},
    { take: 1 }
  )
  if (!salesChannel) {
    throw new Error("No sales channel found. Seed the backend first.")
  }

  const shippingProfiles = await fulfillmentModule.listShippingProfiles({
    type: "default",
  })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) {
    throw new Error("No default shipping profile found. Seed the backend first.")
  }

  const categories = await productModule.listProductCategories(
    {},
    { take: 50, select: ["id", "name", "handle"] }
  )
  const caps = categories.find((category) => {
    const name = category.name.toLowerCase()
    const handle = (category.handle ?? "").toLowerCase()
    return (
      handle === "cap" ||
      handle === "caps" ||
      name === "caps" ||
      name === "cap"
    )
  })

  let categoryId = caps?.id
  if (!categoryId) {
    logger.info("Creating Caps category...")
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [{ name: "Caps", is_active: true }],
      },
    })
    categoryId = result[0].id
  }

  let [collection] = await productModule.listProductCollections(
    { handle: "y" },
    { take: 1, select: ["id", "title"] }
  )
  if (!collection) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: [{ title: "Y", handle: "y" }],
      },
    })
    collection = result[0]
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
  const imageUrls = uploaded.map((file) => publicImageUrl(file.url))
  logger.info(`Uploaded ${imageUrls.length} image(s).`)

  const variants = [
    {
      title: `${SIZE} / ${COLOR}`,
      sku: SKU,
      options: {
        Color: COLOR,
        Size: SIZE,
      },
      prices: [
        { amount: 10, currency_code: "eur" },
        { amount: 15, currency_code: "usd" },
      ],
    },
  ]

  logger.info("Creating Y 26 Suede Mesh Trucker Cap...")

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Y 26 Suede Mesh Trucker Cap",
          handle: HANDLE,
          subtitle: "Structured A-frame trucker with 3D puff XYZ LONDON logo",
          description: DESCRIPTION,
          status: ProductStatus.PUBLISHED,
          origin_country: "GB",
          material: "Faux-Suede / 100% Polyester Mesh",
          shipping_profile_id: shippingProfile.id,
          category_ids: categoryId ? [categoryId] : [],
          collection_id: collection.id,
          thumbnail: imageUrls[0],
          images: imageUrls.map((url) => ({ url })),
          options: [
            { title: "Color", values: [COLOR] },
            { title: "Size", values: [SIZE] },
          ],
          variants,
          sales_channels: [{ id: salesChannel.id }],
          metadata: {
            overview: DESCRIPTION,
            tagline: "Structured A-frame trucker with 3D puff XYZ LONDON logo",
            collection_line: "Odunola Collection 26 | XYZ London",
            size_info: "One Size fits most.",
            size_info_detail:
              "Unisex design with an adjustable plastic snapback.",
            size_guide_intro: "Adjustable enclosure. One Size fits most.",
            size_guide_title: "XYZ Cap Fit Guide",
            size_guide: JSON.stringify({
              columns: ["Fit", "Notes"],
              rows: [
                ["One Size", "Adjustable plastic snapback; unisex, fits most"],
              ],
            }),
            composition:
              "Faux-Suede (Front Crown & Visor) / 100% Polyester Mesh (Rear Panels)",
            design_details:
              "High-density 3D puff-embroidered XYZ LONDON front graphic, white side script embroidery, and a rear woven logo label above the snapback. Pre-curved visor with tonal multi-row stitching.",
            type_label: "Structured A-frame suede mesh trucker",
            fit_label: "One Size",
            core_product_id: "23134LND",
            item_number: "#XYZ006677",
            fit: "Structured A-frame trucker profile with a high-density structured front panel",
            care: "Spot clean with a damp cloth or soft-bristle brush\nDo not submerge or machine wash\nLay flat to dry in shade\nDo not bleach, tumble dry, or iron",
          },
        },
      ],
    },
  })

  const created = products[0]
  logger.info(`Created ${created.title} (${created.id})`)

  const [location] = await stockLocationModule.listStockLocations({}, { take: 1 })
  if (!location) {
    logger.warn("No stock location found — skipping inventory levels.")
    return
  }

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: [SKU] },
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
    logger.info(`Set inventory on ${inventoryLevels.length} variant(s).`)
  }

  logger.info("Done. Storefront: /dk/products/y-26-suede-mesh-trucker-cap")
}
