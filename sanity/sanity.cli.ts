import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  studioHost: 'xyzwear',
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'bff91fb2',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
