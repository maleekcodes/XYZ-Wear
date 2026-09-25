import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'digitalFormPage',
  title: 'Digital Form Page',
  type: 'document',
  fields: [
    // Page Header
    defineField({
      name: 'collectionLabel',
      title: 'Collection Label',
      type: 'string',
      description: 'e.g., "Collection 02"',
    }),
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Page Description',
      type: 'text',
      rows: 3,
    }),

    // Digital Products
    defineField({
      name: 'digitalProducts',
      title: 'Digital Products',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'isFeatured',
              title: 'Featured',
              type: 'boolean',
              description: 'Show in the Featured section (large cards).',
              initialValue: false,
            }),
            defineField({
              name: 'isComingSoon',
              title: 'Coming soon',
              type: 'boolean',
              description: 'Show in the Coming Soon row.',
              initialValue: false,
            }),
            defineField({
              name: 'statusLabel',
              title: 'Status Label',
              type: 'string',
              description: 'e.g., "Coming Soon"',
            }),
            defineField({
              name: 'slug',
              title: 'Product URL slug',
              type: 'slug',
              description:
                'Short URL segment only (e.g. shell-jacket-a). Do not type /digital/ or paths—the storefront already serves /[country]/digital/[slug]. Extra slashes confuse matching.',
              options: {
                source: 'name',
                maxLength: 96,
              },
              validation: (Rule) =>
                Rule.custom((slug, context) => {
                  const parent = context.parent as
                    | { medusaHandle?: string; externalLinks?: Record<string, string> }
                    | undefined
                  const hasMedusa =
                    typeof parent?.medusaHandle === 'string' &&
                    parent.medusaHandle.trim().length > 0
                  const links = parent?.externalLinks
                  const hasExternal =
                    !!links &&
                    Object.values(links).some(
                      (v) => typeof v === 'string' && /^https?:\/\//i.test(v)
                    )
                  if (!slug?.current && !hasMedusa && !hasExternal) {
                    return 'Set a slug for the digital PDP, or link out via Medusa / external URLs.'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'name',
              title: 'Product Name',
              type: 'string',
            }),
            defineField({
              name: 'line',
              title: 'Line',
              type: 'string',
              description: 'e.g., "NFT / Skin", "Outerwear"',
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              description: 'e.g., "Headwear", "Body"',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 8,
            }),
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              description:
                'Gallery for this digital product (first image is used as primary and for try-on). Click Publish on this page after adding images — drafts are not visible on the storefront.',
              options: { layout: 'grid' },
              of: [
                defineArrayMember({
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: 'alt',
                      title: 'Alt text',
                      type: 'string',
                      description: 'Important for accessibility and SEO.',
                    }),
                    defineField({
                      name: 'caption',
                      title: 'Caption',
                      type: 'string',
                    }),
                  ],
                }),
              ],
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'number',
              description: 'Selling price in major units (e.g. 45 for £45.00).',
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: 'currency',
              title: 'Currency',
              type: 'string',
              initialValue: 'GBP',
              options: {
                list: [
                  { title: 'GBP (£)', value: 'GBP' },
                  { title: 'EUR (€)', value: 'EUR' },
                  { title: 'USD ($)', value: 'USD' },
                  { title: 'ETH', value: 'ETH' },
                ],
                layout: 'dropdown',
              },
            }),
            defineField({
              name: 'platforms',
              title: 'Platforms',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'e.g. Roblox, VRChat',
            }),
            defineField({
              name: 'medusaHandle',
              title: 'Medusa product handle',
              type: 'string',
              description: 'If set, links to the Medusa PDP and can show live Medusa pricing.',
            }),
            defineField({
              name: 'externalLinks',
              title: 'External links',
              type: 'object',
              options: { collapsible: true, collapsed: true },
              fields: [
                defineField({
                  name: 'opensea',
                  title: 'OpenSea',
                  type: 'url',
                }),
                defineField({
                  name: 'rarible',
                  title: 'Rarible',
                  type: 'url',
                }),
                defineField({
                  name: 'foundation',
                  title: 'Foundation',
                  type: 'url',
                }),
                defineField({
                  name: 'custom',
                  title: 'Custom URL',
                  type: 'url',
                }),
              ],
            }),
            defineField({
              name: 'shape',
              title: 'Shape Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Circle', value: 'circle' },
                  { title: 'Square', value: 'square' },
                  { title: 'Triangle', value: 'triangle' },
                  { title: 'Rhombus', value: 'rhombus' },
                  { title: 'Trapezoid', value: 'trapezoid' },
                  { title: 'Pentagon', value: 'pentagon' },
                  { title: 'Hexagon', value: 'hexagon' },
                  { title: 'Octagon', value: 'octagon' },
                  { title: 'Ellipse', value: 'ellipse' },
                  { title: 'Curve', value: 'curve' },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'name',
              slug: 'slug.current',
              subtitle: 'category',
              price: 'price',
              currency: 'currency',
              media: 'images.0',
            },
            prepare({ title, slug, subtitle, price, currency, media }) {
              const priceLabel =
                price != null && price !== ''
                  ? `${currency ?? 'GBP'} ${Number(price).toFixed(2)}`
                  : undefined
              return {
                title: title ?? 'Untitled',
                subtitle: [slug, subtitle, priceLabel].filter(Boolean).join(' · '),
                media,
              }
            },
          },
        },
      ],
    }),

    // SEO
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Digital Form Page',
        subtitle: 'Digital Collection Page',
      }
    },
  },
})
