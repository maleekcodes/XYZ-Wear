/** Fill missing footer copy while preserving any edits already made in Studio.
 * Run: sanity exec backfill-approach.mjs --with-user-token
 */
import sanityCli from 'sanity/cli'
const { getCliClient } = sanityCli

const client = getCliClient({ apiVersion: '2024-01-01' })

const approachHeading = 'Our Approach'
const approachBodyLines = [
  'Our garments are designed beyond gender for natural movement, comfort, and longevity, with silhouettes and proportions developed to adapt naturally across different body frames through our engineered fit and sizing philosophy.',
  'We select responsibly sourced materials with consideration for quality, longevity, environmental impact, prioritising intention over volume and fleeting trend.',
  'Every decision is guided by craftsmanship, restraint, discipline, and respect — from construction and proportion to our evolving colour language.',
]

const documents = await client.fetch(
  '*[_id in ["siteFooter", "drafts.siteFooter"]]{_id}'
)

if (documents.length === 0) {
  await client.create({
    _id: 'siteFooter',
    _type: 'siteFooter',
    approachHeading,
    approachBodyLines,
  })
  console.log('Created Site footer with Our Approach copy')
} else {
  for (const document of documents) {
    await client.patch(document._id).setIfMissing({
      approachHeading,
      approachBodyLines,
    }).commit()
    console.log(`Filled missing Our Approach fields in ${document._id}`)
  }
}
