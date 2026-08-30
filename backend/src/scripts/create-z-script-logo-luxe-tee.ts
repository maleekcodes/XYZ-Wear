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

const HANDLE = "z-script-logo-luxe-tee"
const SIZES = ["S", "M", "L", "XL"] as const
const COLORS = ["Cream", "Black", "White"] as const

const DESCRIPTION = `Details & Materials

Composition: 100% Soft Mid-to-Heavyweight Cotton Jersey
Fabric Weight: 240 GSM
Design Details: Minimalist black calligraphic XYZ. London script logo on the left chest, crewneck collar, and short sleeves
Type: Regular Fit Graphic Jersey Tee
Item Number: #XYZ1771000
Core Product ID: 2111444LND
Country of Origin: Made in England

Dimension

Fit: Regular fit silhouette with mid-relaxed dropped shoulders

Details & Care

Hand wash cold inside out to protect the script print
Line dry in the shade
Do not bleach or tumble dry
Warm iron on reverse side (avoid ironing directly over the logo)`

const IMAGES = [
  {
    filename: "z-script-logo-luxe-tee-cream-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "z-script-logo-luxe-tee-cream-back.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "z-script-logo-luxe-tee-black-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "z-script-logo-luxe-tee-black-back.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "z-script-logo-luxe-tee-white-front.jpg",
    mimeType: "image/jpeg",
  },
  {
    filename: "z-script-logo-luxe-tee-white-back.jpg",
    mimeType: "image/jpeg",
  },
] as const

function skuColor(color: string) {
  return color.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
}

function variantSku(size: string, color: string) {
  return `XYZ1771000-${size}-${skuColor(color)}`
}

function publicImageUrl(url: string) {
  return url.replace("://localhost:9000/", "://localhost:9001/")
}

export default async function createZScriptLogoLuxeTee({
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
  const tees = categories.find((category) => {
    const name = category.name.toLowerCase()
    return category.handle === "tees" || name === "tees" || name === "tee"
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
    { handle: "z" },
    { take: 1, select: ["id", "title"] }
  )
  if (!collection) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: [
          {
            title: "Z",
            handle: "z",
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

  logger.info("Creating Z _ Script Logo Luxe Tee...")

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Z _ Script Logo Luxe Tee",
          handle: HANDLE,
          subtitle: "Regular Fit, Cod Cream Cotton Tee",
          description: DESCRIPTION,
          status: ProductStatus.PUBLISHED,
          origin_country: "GB",
          material: "100% Soft Mid-to-Heavyweight Cotton Jersey",
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
            tagline: "Regular Fit, Cod Cream Cotton Tee",
            tagline_black: "Regular Fit, Black Cotton Tee",
            tagline_white: "Regular Fit, White Cotton Tee",
            collection_line: "Odunola Collection 26 | XYZ London",
            size_info: "True to size.",
            size_info_detail:
              "Considered a Regular fit, order your normal size.",
            composition: "100% Soft Mid-to-Heavyweight Cotton Jersey",
            fabric_weight: "240 GSM",
            design_details:
              "Minimalist black calligraphic XYZ. London script logo on the left chest, crewneck collar, and short sleeves",
            type_label: "Regular Fit Graphic Jersey Tee",
            fit_label: "Regular Fit",
            size_guide_intro: "Genderless equals design and size philosophy",
            size_guide_title: "XYZ Frame Measurement Guide (Unisex)",
            size_guide:
              '{"columns":["Frame","Chest (in)","Waist (in)","Hip (in)","Torso Length (in)"],"rows":[["Compact","23–26","19–22","24–27","16–18"],["Lean","26–29","22–25","27–30","18–20"],["Balanced","29–34","25–30","30–35","20–22"],["Athletic","34–40","30–35","35–40","21–23"],["Broad","40–46","35–40","40–45","22–24"],["Extended","46–52","40–48","45–54","23–26"]]}',
            core_product_id: "2111444LND",
            item_number: "#XYZ1771000",
            fit: "Regular fit silhouette with mid-relaxed dropped shoulders",
            care: "Hand wash cold inside out to protect the script print\nLine dry in the shade\nDo not bleach or tumble dry\nWarm iron on reverse side (avoid ironing directly over the logo)",
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
      sku: variants.map((variant) => variant.sku),
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

  logger.info("Done. Storefront: /dk/products/z-script-logo-luxe-tee")
}
