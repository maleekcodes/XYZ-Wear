import { CYBERX_SLUG } from "./cyberx-effects"

export const CYBERX_JACKET_DESCRIPTION = [
  "Visual Effects: Liquid-chrome shell, glowing neon piping, and interactive pixelated LED matrix trim",
  "Design Details: High-density holographic front emblem, cybernetic arm HUD display overlay, circular compass back motif, crewneck bomber collar, and ribbed cuffs",
  "Type: Digital Wearable / Virtual Apparel",
  "Core Product ID: 3D991145LND",
  "Item Number: #XYZ3D99",
  "Origin: Designed in England (Digital Asset)",
  "Fit & Size: Standard unisex avatar fit with dynamic physics support. True to size, regular fit, one size. Genderless design",
  "Shipping: Delivers immediately via download once payment is confirmed",
  "Returns: Due to the digital nature of our goods, products are not returnable once downloaded. All sales are final.",
].join("\n\n")

export function digitalProductDescription(
  slug: string | null | undefined,
  description: string | null | undefined
): string | undefined {
  return slug === CYBERX_SLUG
    ? CYBERX_JACKET_DESCRIPTION
    : description ?? undefined
}
