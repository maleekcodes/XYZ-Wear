import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const TEE_SIZE_GUIDE = JSON.stringify({
  columns: [
    "Frame",
    "Chest (in)",
    "Waist (in)",
    "Hip (in)",
    "Torso Length (in)",
  ],
  rows: [
    ["Compact", "23–26", "19–22", "24–27", "16–18"],
    ["Lean", "26–29", "22–25", "27–30", "18–20"],
    ["Balanced", "29–34", "25–30", "30–35", "20–22"],
    ["Athletic", "34–40", "30–35", "35–40", "21–23"],
    ["Broad", "40–46", "35–40", "40–45", "22–24"],
    ["Extended", "46–52", "40–48", "45–54", "23–26"],
  ],
})

const TEE_SIZE_GUIDE_INTRO = "Genderless equals design and size philosophy"
const TEE_SIZE_GUIDE_TITLE = "XYZ Frame Measurement Guide (Unisex)"

const BY_HANDLE: Record<string, Record<string, string>> = {
  "x-money-orders-tee": {
    fit_label: "Oversized Fit",
    size_guide_intro: TEE_SIZE_GUIDE_INTRO,
    size_guide_title: TEE_SIZE_GUIDE_TITLE,
    size_guide: TEE_SIZE_GUIDE,
  },
  "y-vintage-patina-luxe-tee": {
    fit_label: "Oversized Fit",
    size_guide_intro: TEE_SIZE_GUIDE_INTRO,
    size_guide_title: TEE_SIZE_GUIDE_TITLE,
    size_guide: TEE_SIZE_GUIDE,
  },
  "z-script-logo-luxe-tee": {
    fit_label: "Regular Fit",
    size_guide_intro: TEE_SIZE_GUIDE_INTRO,
    size_guide_title: TEE_SIZE_GUIDE_TITLE,
    size_guide: TEE_SIZE_GUIDE,
  },
  "x-monogram-tonal-stealth-cap": {
    fit_label: "One Size",
  },
  "x-monogram-flat-peak-snapback-cap": {
    fit_label: "One Size",
  },
  "y-26-suede-mesh-trucker-cap": {
    fit_label: "One Size",
  },
  "z-26-vintage-washed-organic-cap": {
    fit_label: "One Size",
  },
}

export default async function syncStorefrontCopy({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)

  const products = await productModule.listProducts(
    { handle: Object.keys(BY_HANDLE) },
    { take: 20, select: ["id", "title", "handle", "metadata"] }
  )

  for (const product of products) {
    const handle = product.handle ?? ""
    const patch = BY_HANDLE[handle]
    if (!patch) continue

    const metadata = {
      ...((product.metadata as Record<string, unknown> | null) ?? {}),
      ...patch,
    }

    await productModule.updateProducts(product.id, { metadata })
    logger.info(`Updated storefront copy on ${product.title}`)
  }

  logger.info("Done.")
}
