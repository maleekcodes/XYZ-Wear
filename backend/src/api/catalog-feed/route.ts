import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const storefrontUrl = (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")
const feedToken = process.env.CATALOG_FEED_TOKEN
const backendUrl = (process.env.BACKEND_PUBLIC_URL || "http://localhost:9000").replace(/\/$/, "")
const publishableKey = process.env.CATALOG_FEED_PUBLISHABLE_KEY

function escapeCsv(value: unknown) {
  const text = String(value ?? "")
  return `"${text.replace(/"/g, '""')}"`
}

function available(variant: any) {
  return variant.manage_inventory === false || variant.allow_backorder || (variant.inventory_quantity ?? 0) > 0
}

function priceFor(variant: any) {
  const price = variant.calculated_price?.calculated_amount ?? variant.prices?.[0]?.amount
  return typeof price === "number" ? price / 100 : null
}

function currencyFor(variant: any) {
  return (variant.calculated_price?.currency_code ?? variant.prices?.[0]?.currency_code ?? "gbp").toUpperCase()
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  if (!feedToken || req.headers["x-catalog-feed-token"] !== feedToken) {
    return res.status(401).json({ message: "Invalid catalog feed token" })
  }

  try {
    if (!publishableKey) {
      throw new Error("CATALOG_FEED_PUBLISHABLE_KEY is not configured")
    }

    const regionResponse = await fetch(`${backendUrl}/store/regions`, {
      headers: { "x-publishable-api-key": publishableKey },
    })
    const { regions } = await regionResponse.json()
    const region = regions?.find((item: any) =>
      item.countries?.some((country: any) => country.iso_2 === "gb")
    ) ?? regions?.[0]
    if (!region?.id) throw new Error("No catalog region is configured")

    const fields = "*variants.calculated_price,+variants.inventory_quantity,*variants.options,*variants.images,*options,*categories,*collection,*images,+thumbnail,+metadata"
    const productsResponse = await fetch(
      `${backendUrl}/store/products?limit=100&region_id=${encodeURIComponent(region.id)}&fields=${encodeURIComponent(fields)}`,
      { headers: { "x-publishable-api-key": publishableKey } }
    )
    if (!productsResponse.ok) {
      throw new Error(`Store product feed returned ${productsResponse.status}`)
    }
    const { products } = await productsResponse.json()

    const rows = products.flatMap((product: any) =>
    (product.variants ?? []).flatMap((variant: any) => {
      const price = priceFor(variant)
      if (!product.handle || price === null) return []

      const image = variant.images?.[0]?.url || product.thumbnail || product.images?.[0]?.url || ""
      return [{
        id: variant.sku || variant.id,
        item_group_id: product.id,
        title: `${product.title}${variant.title ? ` - ${variant.title}` : ""}`,
        description: product.description || product.subtitle || product.title,
        availability: available(variant) ? "in stock" : "out of stock",
        condition: "new",
        price: `${price.toFixed(2)} ${currencyFor(variant)}`,
        link: `${storefrontUrl}/gb/products/${product.handle}`,
        image_link: image,
        brand: "XYZ London",
        gtin: variant.barcode || "",
        mpn: variant.sku || variant.id,
      }]
    })
  )

    const format = req.query.format === "json" ? "json" : "csv"
    if (format === "json") {
      return res.json({ products: rows, generated_at: new Date().toISOString() })
    }

    const headers = ["id", "item_group_id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand", "gtin", "mpn"]
    const csv = [headers, ...rows.map((row: Record<string, unknown>) => headers.map((header) => row[header]))]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n")

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    return res.send(csv)
  } catch (error) {
    console.error("Catalog feed generation failed", error)
    return res.status(500).json({
      message: process.env.NODE_ENV === "production"
        ? "Catalog feed generation failed"
        : error instanceof Error ? error.message : String(error),
    })
  }
}
