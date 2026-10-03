import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'xyz-london',
  title: 'XYZ London CMS',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'bff91fb2',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== 'staticPageSeo'
            ),
            S.listItem()
              .title('Static Page SEO')
              .id('staticPageSeo')
              .child(
                S.document()
                  .schemaType('staticPageSeo')
                  .documentId('staticPageSeo')
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      // Custom studio components can be added here
    },
  },
})
