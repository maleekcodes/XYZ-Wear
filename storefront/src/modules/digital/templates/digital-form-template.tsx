import { getRegion } from "@lib/data/regions"
import { getDigitalFormPage } from "@lib/sanity/queries"
import { DigitalFormClient } from "@modules/digital/components/digital-form-client"
import { enrichDigitalProductsWithMedusa } from "@modules/digital/lib/enrich-digital-products"
import { sanityDigitalToDisplay } from "@modules/digital/lib/map-sanity-digital-product"

const DEFAULT_HERO = {
  collectionLabel: "Meta / Virtual",
  title: "DIGITAL FORM",
  description:
    "Identity beyond physical constraints. Assets for virtual environments and digital expression.",
}

export default async function DigitalFormTemplate({
  countryCode,
}: {
  countryCode: string
}) {
  const { page, fetchError, sanityConfigured } = await getDigitalFormPage()
  const region = await getRegion(countryCode)

  const raw = page?.digitalProducts ?? []
  const withNames = raw.filter((p) => p?.name?.trim())
  const base = withNames.map(sanityDigitalToDisplay)

  const priority = [
    ["kinetics hoodie", "kinetic hoodie"],
    ["kinetics cap", "kinetic cap"],
  ]
  const orderedBase = [...base].sort((a, b) => {
    const aName = a.name.trim().toLowerCase()
    const bName = b.name.trim().toLowerCase()
    const aIndex = priority.findIndex((names) => names.includes(aName))
    const bIndex = priority.findIndex((names) => names.includes(bName))
    const aRank = aIndex === -1 ? priority.length : aIndex
    const bRank = bIndex === -1 ? priority.length : bIndex
    return aRank - bRank
  })

  const products = await enrichDigitalProductsWithMedusa(orderedBase, region?.id)

  const hero = {
    collectionLabel:
      page?.collectionLabel?.trim() || DEFAULT_HERO.collectionLabel,
    title: page?.title?.trim() || DEFAULT_HERO.title,
    description: page?.description?.trim() || DEFAULT_HERO.description,
  }

  return (
    <DigitalFormClient
      hero={hero}
      products={products}
      fetchError={sanityConfigured && fetchError}
    />
  )
}
