import { buildPageMetadata } from "@lib/seo/metadata"
import { buildOrganizationSchema } from "@lib/seo/schema"
import { getGlobalSeoSettings } from "@lib/seo/sanity"
import { rootMetadata } from "@lib/seo/site"
import { getSiteSettings } from "@lib/sanity/queries"
import { NavigationProgress } from "@modules/common/components/navigation-progress"
import JsonLd from "@modules/seo/components/json-ld"
import type { Metadata, Viewport } from "next"
import "styles/globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalSeoSettings()
  return {
    ...rootMetadata(),
    ...buildPageMetadata(
      {
        title: global?.seoTitle,
        description: global?.seoDescription,
        image: global?.ogImage,
        twitterImage: global?.twitterImage,
      },
      global
    ),
  }
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { settings } = await getSiteSettings()
  const organizationSchema = buildOrganizationSchema(settings)

  return (
    <html lang="en" data-mode="light">
      <head>
        <JsonLd data={organizationSchema} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavigationProgress />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
