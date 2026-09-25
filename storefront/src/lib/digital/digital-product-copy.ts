import { CYBERX_SLUG } from "./cyberx-effects"

export type DigitalProductCopy = {
  name: string
  subtitle: string
  collection: string
  composition: string
  visualEffects: string
  designDetails: string
  type: string
  coreProductId: string
  itemNumber: string
  origin: string
  fit: string
  sizeInfo: readonly string[]
  sizeGuide?: string
}

const SHIPPING = "The item is delivered immediately as a download once payment is confirmed."
const RETURNS = "Due to the nature of our products, products are not returnable once downloaded. All sales are final."

const CYBERX_JACKET: DigitalProductCopy = {
  name: "CyberX",
  subtitle: "Virtual Wearables, Digital Holographic Bomber Jacket.",
  collection: "Odunire Collection 26 | XYZ London.",
  composition: "High-poly 3D Mesh / PBR Textures",
  visualEffects: "Liquid-chrome shell, glowing neon piping, and interactive pixelated LED matrix trim",
  designDetails: "High-density holographic front emblem, cybernetic arm HUD display overlay, circular compass back motif, crewneck bomber collar, and ribbed cuffs",
  type: "Digital Wearable / Virtual Apparel",
  coreProductId: "3D991145LND",
  itemNumber: "#XYZ3D99",
  origin: "Designed in England (Digital Asset)",
  fit: "Standard unisex avatar fit with dynamic physics support across supported platforms",
  sizeInfo: ["True to size.", "Considered a regular fit, one size."],
  sizeGuide: "Genderless equals design.",
}

const XYZ_CURRENCY_CAP: DigitalProductCopy = {
  name: "Cyber-Luxe Holographic Trucker Cap",
  subtitle: "Digital Holographic Trucker Cap. Virtual Wearables.",
  collection: "Odunire Collection 26 | XYZ London.",
  composition: "High-poly 3D Mesh / PBR Textures",
  visualEffects: "Iridescent liquid-chrome front panel, glowing neon signet symbols, and a translucent cyan wireframe circuit mesh",
  designDetails: "Neon-illuminated XYZ currency front emblem, magenta side script signature, neon rear branding patch, curved visor with neon edge accents, and a glowing translucent snapback closure",
  type: "Digital Wearable / Virtual Headwear",
  coreProductId: "3D991146LND",
  itemNumber: "#XYZ3D99C",
  origin: "Designed in England (Digital Asset)",
  fit: "Standard unisex avatar fit with adjustable snapback scaling across supported platforms",
  sizeInfo: ["True to size.", "Considered a regular fit, one size."],
}

export const digitalShippingAndReturns = { shipping: SHIPPING, returns: RETURNS }

export function getDigitalProductCopy(
  slug: string | null | undefined,
  name: string | null | undefined
): DigitalProductCopy | null {
  if (slug === CYBERX_SLUG) return CYBERX_JACKET
  if (
    slug === "xyz-currency" ||
    name?.trim().toLowerCase() === "xyz currency"
  ) {
    return XYZ_CURRENCY_CAP
  }
  return null
}

export function digitalProductDescription(
  slug: string | null | undefined,
  name: string | null | undefined,
  description: string | null | undefined
): string | undefined {
  const copy = getDigitalProductCopy(slug, name)
  return copy
    ? `${copy.name}. ${copy.subtitle} ${copy.collection}`
    : description ?? undefined
}

export function formatDigitalProductCmsDescription(copy: DigitalProductCopy): string {
  return [
    copy.name,
    copy.subtitle,
    copy.collection,
    "Details & Materials",
    `Composition: ${copy.composition}`,
    `Visual Effects: ${copy.visualEffects}`,
    `Design Details: ${copy.designDetails}`,
    `Type: ${copy.type}`,
    `Core Product ID: ${copy.coreProductId}`,
    `Item Number: ${copy.itemNumber}`,
    `Country of Origin: ${copy.origin}`,
    `Dimension — Fit: ${copy.fit}`,
    "Shipping & Returns",
    `No Shipping: ${SHIPPING}`,
    `Returns: ${RETURNS}`,
    "Size info",
    ...copy.sizeInfo,
    ...(copy.sizeGuide ? ["Size guides", copy.sizeGuide] : []),
  ].join("\n\n")
}
