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

const HANDLE = "z-26-vintage-washed-organic-cap"
const COLOR = "Olive"
const SIZE = "One Size"
const SKU = "XYZ12300-OS-OLIVE"

const DESCRIPTION = `Crafted from 280 GSM organic twill cotton, this six-panel cap pairs a low-profile unstructured relaxed crown with a vintage washed finish. Features a mid visor, side and rear embroidered branding, and an adjustable strap with an engraved metal buckle for a precise fit.`

const IMAGES = [
  {
    filename: "z-26-vintage-washed-organic-cap-olive-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "z-26-vintage-washed-organic-cap-olive-side.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "z-26-vintage-washed-organic-cap-olive-back.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "z-26-vintage-washed-organic-cap-olive-detail.jpg",
    mimeType: "image/jpeg",
  },
] as const

function publicImageUrl(url: string) {
  return url.replace("://localhost:9000/", "://localhost:9001/")
}

export default async function createZ26VintageWashedOrganicCap({
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
    { handle: "z" },
    { take: 1, select: ["id", "title"] }
  )
  if (!collection) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: [{ title: "Z", handle: "z" }],
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

  logger.info("Creating Z 26 Vintage Washed Organic Cap...")

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Z 26 Vintage Washed Organic Cap",
          handle: HANDLE,
          subtitle:
            "Low-profile unstructured 6-panel cap in vintage washed organic twill",
          description: DESCRIPTION,
          status: ProductStatus.PUBLISHED,
          origin_country: "GB",
          material: "100% Organic Sustainable Cotton (280 GSM)",
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
            tagline:
              "Low-profile unstructured 6-panel cap in vintage washed organic twill",
            collection_line: "Odunola Collection 26 | XYZ London",
            size_info: "One Size fits most.",
            size_info_detail:
              "Unisex design with an adjustable self-fabric strap and engraved metal buckle.",
            size_guide_intro: "Adjustable enclosure. One Size fits most.",
            size_guide_title: "XYZ Cap Fit Guide",
            size_guide: JSON.stringify({
              columns: ["Fit", "Notes"],
              rows: [
                [
                  "One Size",
                  "Adjustable self-fabric strap with engraved metal buckle; unisex, fits most",
                ],
              ],
            }),
            composition: "100% Organic Sustainable Cotton (280 GSM)",
            fabric_weight: "280 GSM",
            design_details:
              "Embroidered side script and rear monogram, self-fabric sweatband, and curved mid visor. GOTS, OCS 100, AMFORI (BSCI), and SEDEX certified.",
            type_label: "Unstructured vintage washed organic 6-panel cap",
            fit_label: "One Size",
            core_product_id: "3761LND",
            item_number: "#XYZ12300",
            fit: "Low-profile, unstructured 6-panel crown with balanced vintage proportions",
            care: "Hand wash cold; spot clean with a soft cloth\nAir dry flat in the shade\nDo not bleach, tumble dry, or iron",
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

  logger.info("Done. Storefront: /dk/products/z-26-vintage-washed-organic-cap")
}
