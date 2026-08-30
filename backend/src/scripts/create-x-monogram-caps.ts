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

const COLOR = "Black"
const SIZE = "One Size"

type CapSpec = {
  title: string
  handle: string
  subtitle: string
  description: string
  material: string
  skuPrefix: string
  images: { filename: string; mimeType: string }[]
  metadata: Record<string, string>
}

const CAPS: CapSpec[] = [
  {
    title: "X Monogram Tonal Stealth Cap",
    handle: "x-monogram-tonal-stealth-cap",
    subtitle: "Structured mid-profile 6-panel cap with 3D puff XYZ monogram",
    description: `Made from premium heavyweight cotton twill, this structured six-panel cap features a bold, 3D puff-embroidered XYZ monogram across the front crown in a seamless blackout finish. Engineered with a curved visor, reinforced buckram front panels, and tonal stitched eyelets, it delivers a sleek, understated street-luxury aesthetic.`,
    material: "100% Heavyweight Cotton Twill",
    skuPrefix: "XYZ9889",
    images: [
      {
        filename: "x-monogram-tonal-stealth-cap-black-front.jpg",
        mimeType: "image/jpeg",
      },
      {
        filename: "x-monogram-tonal-stealth-cap-black-side.jpg",
        mimeType: "image/jpeg",
      },
      {
        filename: "x-monogram-tonal-stealth-cap-black-back.jpg",
        mimeType: "image/jpeg",
      },
    ],
    metadata: {
      overview:
        "Made from premium heavyweight cotton twill, this structured six-panel cap features a bold, 3D puff-embroidered XYZ monogram across the front crown in a seamless blackout finish. Engineered with a curved visor, reinforced buckram front panels, and tonal stitched eyelets, it delivers a sleek, understated street-luxury aesthetic.",
      tagline: "Structured mid-profile 6-panel cap with 3D puff XYZ monogram",
      collection_line: "X | XYZ London",
      size_info: "One Size fits most.",
      size_info_detail:
        "Unisex silhouette with an adjustable back enclosure.",
      size_guide_intro: "Adjustable enclosure. One Size fits most.",
      size_guide_title: "XYZ Cap Fit Guide",
      size_guide: JSON.stringify({
        columns: ["Fit", "Notes"],
        rows: [["One Size", "Adjustable strapback; unisex, fits most"]],
      }),
      composition: "100% Heavyweight Cotton Twill",
      design_details:
        "High-density 3D puff-embroidered XYZ monogram logo in a subtle tonal black thread. Pre-curved visor with multi-row tonal stitching and matching embroidered ventilation eyelets.",
      type_label: "Structured mid-profile 6-panel cap",
      fit_label: "One Size",
      core_product_id: "10980LND",
      item_number: "#XYZ9889",
      fit: "Structured mid-profile 6-panel design with buckram-backed front panels for shape retention",
      care: "Spot clean with a damp cloth or soft brush\nDo not machine wash or submerge in water\nLay flat to dry in shade\nDo not bleach, tumble dry, or iron",
    },
  },
  {
    title: "X Monogram Flat Peak Snapback Cap",
    handle: "x-monogram-flat-peak-snapback-cap",
    subtitle:
      "Structured high-profile flat peak snapback with 3D puff XYZ monogram",
    description: `Designed with a structured high-profile crown and a classic flat peak, this snapback features an oversized, 3D puff-embroidered XYZ monogram across the front panels in a subtle blackout finish. A secondary tonal monogram embroidery sits directly above the adjustable snapback closure, delivering a sharp, architectural streetwear aesthetic.`,
    material: "100% Premium Cotton Twill",
    skuPrefix: "XYZ332100",
    images: [
      {
        filename: "x-monogram-flat-peak-snapback-cap-black-front.jpg",
        mimeType: "image/jpeg",
      },
      {
        filename: "x-monogram-flat-peak-snapback-cap-black-side.jpg",
        mimeType: "image/jpeg",
      },
      {
        filename: "x-monogram-flat-peak-snapback-cap-black-back.jpg",
        mimeType: "image/jpeg",
      },
    ],
    metadata: {
      overview:
        "Designed with a structured high-profile crown and a classic flat peak, this snapback features an oversized, 3D puff-embroidered XYZ monogram across the front panels in a subtle blackout finish. A secondary tonal monogram embroidery sits directly above the adjustable snapback closure, delivering a sharp, architectural streetwear aesthetic.",
      tagline:
        "Structured high-profile flat peak snapback with 3D puff XYZ monogram",
      collection_line: "X | XYZ London",
      size_info: "One Size fits most.",
      size_info_detail:
        "Unisex street-luxury aesthetic with an adjustable plastic snapback.",
      size_guide_intro: "Adjustable enclosure. One Size fits most.",
      size_guide_title: "XYZ Cap Fit Guide",
      size_guide: JSON.stringify({
        columns: ["Fit", "Notes"],
        rows: [["One Size", "Adjustable plastic snapback; unisex, fits most"]],
      }),
      composition: "100% Premium Cotton Twill",
      design_details:
        "High-density 3D puff-embroidered XYZ monogram on the front and tonal rear monogram embroidery. Tonal plastic snapback enclosure with embroidered ventilation eyelets.",
      type_label: "Structured high-profile flat peak snapback",
      fit_label: "One Size",
      core_product_id: "87986LND",
      item_number: "#XYZ332100",
      fit: "Structured 5-panel high-profile crown with a flat visor silhouette",
      care: "Spot clean with a damp cloth or soft-bristle brush\nDo not submerge or machine wash\nAir dry flat in shade\nDo not bleach, tumble dry, or iron",
    },
  },
]

function publicImageUrl(url: string) {
  return url.replace("://localhost:9000/", "://localhost:9001/")
}

export default async function createXMonogramCaps({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const fileModule = container.resolve(Modules.FILE)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

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
    { handle: "x" },
    { take: 1, select: ["id", "title"] }
  )
  if (!collection) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: [{ title: "X", handle: "x" }],
      },
    })
    collection = result[0]
  }

  const [location] = await stockLocationModule.listStockLocations({}, { take: 1 })
  const assetsDir = join(process.cwd(), "src/scripts/assets")

  for (const cap of CAPS) {
    const existing = await productModule.listProducts(
      { handle: cap.handle },
      { select: ["id", "title"] }
    )
    if (existing.length) {
      logger.info(
        `Product already exists: ${existing[0].title} (${existing[0].id}). Skipping.`
      )
      continue
    }

    const uploaded = await fileModule.createFiles(
      cap.images.map((image) => ({
        filename: image.filename,
        mimeType: image.mimeType,
        access: "public" as const,
        content: readFileSync(join(assetsDir, image.filename)).toString(
          "base64"
        ),
      }))
    )
    const imageUrls = uploaded.map((file) => publicImageUrl(file.url))
    logger.info(`Uploaded ${imageUrls.length} image(s) for ${cap.title}.`)

    const sku = `${cap.skuPrefix}-OS-BLACK`
    const variants = [
      {
        title: `${SIZE} / ${COLOR}`,
        sku,
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

    const { result: products } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: cap.title,
            handle: cap.handle,
            subtitle: cap.subtitle,
            description: cap.description,
            status: ProductStatus.PUBLISHED,
            origin_country: "GB",
            material: cap.material,
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
            metadata: cap.metadata,
          },
        ],
      },
    })

    const created = products[0]
    logger.info(`Created ${created.title} (${created.id})`)

    if (!location) {
      logger.warn("No stock location found — skipping inventory levels.")
      continue
    }

    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
      filters: { sku: [sku] },
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
  }

  logger.info("Done. Storefront: /dk/categories/cap")
}
