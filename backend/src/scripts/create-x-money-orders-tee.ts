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

const HANDLE = "x-money-orders-tee"
const SIZES = ["S", "M", "L", "XL"] as const
const COLORS = ["Black", "Green", "Purple"] as const

const DESCRIPTION = `Details & Materials

Composition: 100% Luxe Cotton Jersey
Fabric Weight: 220 GSM
Design Details: Vibrant multi-colored graffiti graphics with patch motifs, crewneck collar, short sleeves, dropped shoulders, and generous chest dimensions
Type: Classic Oversized Fit Graphic Tee
Core Product ID: 221145LND
Item Number: #XYZ1215
Country of Origin: Made in England

Dimension

Fit: Oversized silhouette with dropped shoulders and a generous chest width

Details & Care

Hand wash cold
Line dry in the shade
Do not tumble dry
Iron inside out on low heat to protect graphics`

const IMAGES = [
  {
    filename: "x-money-orders-tee-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "x-money-orders-tee-back.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "x-money-orders-tee-green-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "x-money-orders-tee-green-back.png",
    mimeType: "image/png",
  },
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

export default async function createXMoneyOrdersTee({ container }: ExecArgs) {
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
  const tees = categories.find((c) => {
    const name = c.name.toLowerCase()
    return c.handle === "tees" || name === "tees" || name === "tee"
  })

  let categoryId = tees?.id
  if (!categoryId) {
    logger.info("Creating Tees category...")
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [{ name: "Tees", is_active: true }],
      },
    })
    categoryId = result[0].id
  }

  let [collection] = await productModule.listProductCollections(
    { handle: "x" },
    { take: 1, select: ["id", "title"] }
  )
  if (!collection) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: [
          {
            title: "X",
            handle: "x",
          },
        ],
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

  const variants = SIZES.flatMap((size) =>
    COLORS.map((color) => ({
      title: `${size} / ${color}`,
      sku: variantSku(size, color),
      options: {
        Color: color,
        Size: size,
      },
      prices: [
        { amount: 10, currency_code: "eur" },
        { amount: 15, currency_code: "usd" },
      ],
    }))
  )

  logger.info("Creating X _ Money Orders Tee...")

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "X _ Money Orders Tee",
          handle: HANDLE,
          subtitle: "Classic Black Oversized Fit Graphic Tee.",
          description: DESCRIPTION,
          status: ProductStatus.PUBLISHED,
          origin_country: "GB",
          material: "100% Luxe Cotton Jersey",
          shipping_profile_id: shippingProfile.id,
          category_ids: categoryId ? [categoryId] : [],
          collection_id: collection.id,
          thumbnail: imageUrls[0],
          images: imageUrls.map((url) => ({ url })),
          options: [
            { title: "Color", values: [...COLORS] },
            { title: "Size", values: [...SIZES] },
          ],
          variants,
          sales_channels: [{ id: salesChannel.id }],
          metadata: {
            tagline: "Classic Black Oversized Fit Graphic Tee.",
            collection_line: "X | XYZ London",
            size_info: "True to size.",
            size_info_detail:
              "Considered a Regular fit, order your normal size.",
            composition: "100% Luxe Cotton Jersey",
            fabric_weight: "220 GSM",
            design_details:
              "Vibrant multi-colored graffiti graphics with patch motifs, crewneck collar, short sleeves, dropped shoulders, and generous chest dimensions",
            type_label: "Classic Oversized Fit Graphic Tee",
            fit_label: "Oversized Fit",
            size_guide_intro: "Genderless equals design and size philosophy",
            size_guide_title: "XYZ Frame Measurement Guide (Unisex)",
            size_guide:
              '{"columns":["Frame","Chest (in)","Waist (in)","Hip (in)","Torso Length (in)"],"rows":[["Compact","23–26","19–22","24–27","16–18"],["Lean","26–29","22–25","27–30","18–20"],["Balanced","29–34","25–30","30–35","20–22"],["Athletic","34–40","30–35","35–40","21–23"],["Broad","40–46","35–40","40–45","22–24"],["Extended","46–52","40–48","45–54","23–26"]]}',
            core_product_id: "221145LND",
            item_number: "#XYZ1215",
            fit: "Oversized silhouette with dropped shoulders and a generous chest width",
            care: "Hand wash cold\nLine dry in the shade\nDo not tumble dry\nIron inside out on low heat to protect graphics",
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
    filters: {
      sku: variants.map((v) => v.sku),
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
    logger.info(`Set inventory on ${inventoryLevels.length} variant(s).`)
  }

  logger.info("Done. Storefront: /gb/products/x-money-orders-tee")
}
