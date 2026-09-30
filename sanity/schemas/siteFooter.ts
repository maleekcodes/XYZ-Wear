import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteFooter',
  title: 'Site footer',
  type: 'document',
  fields: [
    defineField({
      name: 'brandSectionHeading',
      title: 'Brand column — heading',
      type: 'string',
    }),
    defineField({
      name: 'brandBodyLines',
      title: 'Brand column — body lines',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Each item becomes its own line in the Philosophy block.',
    }),
    defineField({
      name: 'approachHeading',
      title: 'Our Approach — heading',
      type: 'string',
    }),
    defineField({
      name: 'approachBodyLines',
      title: 'Our Approach — paragraphs',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
    }),
    defineField({
      name: 'socialHeading',
      title: 'Social icons — heading',
      type: 'string',
      initialValue: 'Follow us',
    }),
    defineField({
      name: 'productSectionHeading',
      title: 'Product column — heading',
      type: 'string',
    }),
    defineField({
      name: 'productItems',
      title: 'Product column — lines',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'productItem',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'internalPath',
              title: 'Internal link (optional)',
              type: 'string',
              description: 'If set, the line links here (e.g. /private-expressions).',
            }),
          ],
          preview: {
            select: { label: 'label', path: 'internalPath' },
            prepare({ label, path }) {
              return { title: label, subtitle: path || 'Plain text' }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'legalSectionHeading',
      title: 'Legal column — heading',
      type: 'string',
    }),
    defineField({
      name: 'legalLinks',
      title: 'Legal links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'footerLink',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'path',
              title: 'Path',
              type: 'string',
              description: 'e.g. /content/terms-of-use or /content/privacy-policy#cookies',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { label: 'label', path: 'path' },
            prepare({ label, path }) {
              return { title: label, subtitle: path }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'connectSectionHeading',
      title: 'Connect column — heading',
      type: 'string',
    }),
    defineField({
      name: 'connectLinks',
      title: 'Connect links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'connectLink',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL or path',
              type: 'string',
              description:
                'Internal path (e.g. /contact), full https URL, or mailto:email@…',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { label: 'label', href: 'href' },
            prepare({ label, href }) {
              return { title: label, subtitle: href }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'bottomTagline',
      title: 'Bottom tagline (right)',
      type: 'string',
      description: 'e.g. Physical / Digital',
    }),
    defineField({
      name: 'copyrightName',
      title: 'Copyright name',
      type: 'string',
      description: 'Company name in © line (year is added in code).',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site footer' }
    },
  },
})
