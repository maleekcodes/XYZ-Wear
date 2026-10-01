import { defineType, defineField } from 'sanity'

import { seoFields } from './objects/seo'
import { simpleRichTextMember } from './objects/simpleRichText'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    ...seoFields,

    // Hero Section
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'Main headline displayed over the hero section',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Hero Subheadline',
      type: 'text',
      rows: 2,
      description: 'Supporting text below the headline',
    }),
    defineField({
      name: 'heroCta',
      title: 'Hero CTA Text',
      type: 'string',
      description: 'Call-to-action button text (e.g., "Explore Form")',
    }),
    defineField({
      name: 'heroFigureLabels',
      title: 'Hero Figure Labels',
      type: 'object',
      fields: [
        defineField({
          name: 'physical',
          title: 'Physical Label',
          type: 'string',
        }),
        defineField({
          name: 'digital',
          title: 'Digital Label',
          type: 'string',
        }),
      ],
    }),

    // Introduction Section
    defineField({
      name: 'introLabel',
      title: 'Introduction Label',
      type: 'string',
      description: 'Small label above the intro heading (e.g., "Manifesto")',
    }),
    defineField({
      name: 'introHeadline',
      title: 'Introduction Headline',
      type: 'text',
      rows: 3,
      description: 'Main intro heading text',
    }),
    defineField({
      name: 'introHeadlineAccent',
      title: 'Introduction Headline Accent',
      type: 'text',
      rows: 2,
      description: 'Lighter/accent part of the intro heading',
    }),
    defineField({
      name: 'introParagraph',
      title: 'Introduction Paragraph',
      type: 'text',
      rows: 4,
      description: 'Supporting paragraph for the intro section',
    }),
    defineField({
      name: 'introText',
      title: 'Introduction Text',
      type: 'array',
      description:
        'Introduction copy for the home page. Press Enter for a new paragraph — formatting is preserved on the storefront.',
      of: [simpleRichTextMember],
    }),
    defineField({ name: 'collectionHeading', title: 'Collection heading', type: 'string' }),
    defineField({ name: 'collectionSubheading', title: 'Collection subheading', type: 'string' }),
    defineField({ name: 'collectionShopLabel', title: 'Collection category link prefix', type: 'string', description: 'Text before the category name, e.g. Shop' }),
    defineField({ name: 'collectionComingSoonTitle', title: 'Empty product card title', type: 'string' }),
    defineField({ name: 'collectionComingSoonDescription', title: 'Empty product card description', type: 'string', description: 'Use {line} where the product line should appear.' }),
    defineField({ name: 'collectionSoonLabel', title: 'Empty product card status', type: 'string' }),
    defineField({ name: 'futureFormsHeading', title: 'Future Forms heading', type: 'string' }),
    defineField({ name: 'brandStoryLinkLabel', title: 'Brand story link label', type: 'string' }),
    defineField({ name: 'brandStoryLinkPath', title: 'Brand story link path', type: 'string', description: 'Path to the story page, e.g. /about' }),
    defineField({
      name: 'futureFormStatement1',
      title: 'Statement after Future Forms — black line',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'futureFormStatement2',
      title: 'Statement after Future Forms — grey line',
      type: 'text',
      rows: 2,
    }),

    // Philosophy / Digital Form Section
    defineField({
      name: 'philosophyTitle',
      title: 'Philosophy Section Title',
      type: 'string',
    }),
    defineField({
      name: 'philosophyComingLabel',
      title: 'Philosophy Coming Label',
      type: 'string',
      description: 'e.g., "COMING 2027"',
    }),
    defineField({
      name: 'philosophyParagraph1',
      title: 'Philosophy Paragraph 1',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'philosophyParagraph2',
      title: 'Philosophy Paragraph 2',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'philosophyCtaLabel',
      title: 'Philosophy CTA Label',
      type: 'string',
      description: 'e.g., "Explore Digital"',
    }),
    defineField({
      name: 'manifestoLines',
      title: 'Manifesto Lines',
      type: 'array',
      description: 'Array of manifesto statements displayed in the philosophy section',
      of: [{ type: 'string' }],
    }),

    // Try-on section (field ids unchanged for existing content)
    defineField({
      name: 'arFitLabel',
      title: 'Try-on — label',
      type: 'string',
      description: 'e.g., "Try-on"',
    }),
    defineField({
      name: 'arFitTitle',
      title: 'Try-on — title',
      type: 'string',
    }),
    defineField({
      name: 'arFitParagraph',
      title: 'Try-on — paragraph',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'arFitCtaLabel',
      title: 'Try-on — button label',
      type: 'string',
      description: 'Text on the link to the try-on information page.',
    }),
    defineField({ name: 'arFitVisualLabels', title: 'Try-on visual labels', type: 'object', fields: [
      defineField({ name: 'photo', title: 'Photo', type: 'string' }),
      defineField({ name: 'preview', title: 'Preview', type: 'string' }),
      defineField({ name: 'status', title: 'Status', type: 'string' }),
    ] }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page',
        subtitle: 'Hero, Introduction, Philosophy, Try-on — OOO teaser is in Private expressions',
      }
    },
  },
})
