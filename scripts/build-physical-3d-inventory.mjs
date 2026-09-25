import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const assetDir = path.join(root, "backend/src/scripts/assets")
const output = path.join(root, "docs/physical-form-3d-inventory.json")
const viewPattern = /-(front|back|side|detail)\.(jpe?g|png|webp)$/i
const supportedProducts = [
  { handle: "x-money-orders-tee", kind: "tee" },
  { handle: "y-vintage-patina-luxe-tee", kind: "tee" },
  { handle: "z-script-logo-luxe-tee", kind: "tee" },
  { handle: "x-monogram-flat-peak-snapback-cap", kind: "cap" },
  { handle: "x-monogram-tonal-stealth-cap", kind: "cap" },
  { handle: "y-26-suede-mesh-trucker-cap", kind: "cap" },
  { handle: "z-26-vintage-washed-organic-cap", kind: "cap" },
]

const files = (await readdir(assetDir)).filter((name) => viewPattern.test(name)).sort()
const variants = new Map()

for (const filename of files) {
  const [, view] = filename.match(viewPattern)
  const stem = filename.replace(viewPattern, "")
  const product = supportedProducts.find(
    ({ handle }) => stem === handle || stem.startsWith(`${handle}-`)
  )
  if (!product) throw new Error(`Unrecognised Physical Form image: ${filename}`)
  const key = stem
  const variant = variants.get(key) ?? {
    productHandle: product.handle,
    variant: stem === product.handle ? "unspecified" : stem.slice(product.handle.length + 1),
    kind: product.kind,
    sourceImages: {},
  }
  if (variant.sourceImages[view]) throw new Error(`Duplicate ${view} image: ${filename}`)
  variant.sourceImages[view] = path.posix.join("backend/src/scripts/assets", filename)
  variants.set(key, variant)
}

const items = [...variants.values()].map((variant) => ({
  ...variant,
  missingViews: ["front", "back", "side"].filter(
    (view) => !variant.sourceImages[view]
  ),
  reconstructionStatus: "source-images-inventoried",
  geometry: null,
  editableProject: null,
  approvedTryOnRender: null,
}))

const inventory = {
  schemaVersion: 1,
  source: "repository Physical Form image assets",
  scopeNote:
    "This covers files in backend/src/scripts/assets, not any additional images stored only in a remote Medusa catalog.",
  sourceImageCount: files.length,
  productCount: new Set(items.map(({ productHandle }) => productHandle)).size,
  variantCount: items.length,
  reconstructionRequirements: [
    "Confirm each garment's dimensions, fit and fabric properties.",
    "Obtain patterns or recreate and approve them from physical samples.",
    "Check hidden construction, seams, trims and logos against the item.",
    "Export editable source, GLB and clean try-on renders only after visual approval.",
  ],
  items,
}

await writeFile(output, `${JSON.stringify(inventory, null, 2)}\n`)
console.log(`Inventoried ${files.length} images across ${items.length} variants in ${output}`)
