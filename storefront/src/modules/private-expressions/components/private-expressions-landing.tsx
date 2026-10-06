"use client"

import type { PrivateExpressionsPageSanity } from "@/types/xyz"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container } from "@modules/common/components/xyz/Container"

/** Hard fallback when Sanity is empty or unpublished (offline dev only). */
const STATIC_FALLBACK = {
  eyebrowLabel: "OOO",
  headline: "OOO is the highest expression of XYZ London.",
  focalLine: "The Few.",
  narrativeParagraph1:
    "OOO exists beyond season and trend. Each piece is formed with deliberate craftsmanship—guided by precision, restraint, and uncompromising standards, released in rare quantity.",
  narrativeParagraph2:
    "Reserved for those who recognise intention and value substance without the need for acknowledgement.",
  closingLine: "Quiet. Personal. Defined.",
  formIntro: "Complete the form to express interest",
  hubspotFormUrl:
    "https://2fu564.share-eu1.hsforms.com/2QJmK62N_R1miIbA3scmoaw",
  contactEmail: "contact@wearxyz.co",
  backToHomeLabel: "Back to home",
} satisfies Partial<PrivateExpressionsPageSanity>

function merged(
  content: PrivateExpressionsPageSanity | null
): Required<
  Pick<
    PrivateExpressionsPageSanity,
    | "eyebrowLabel"
    | "headline"
    | "focalLine"
    | "narrativeParagraph1"
    | "narrativeParagraph2"
    | "closingLine"
    | "formIntro"
    | "contactEmail"
    | "backToHomeLabel"
  >
> & { hubspotFormUrl?: string | null } {
  const fb = content ? undefined : STATIC_FALLBACK
  return {
    eyebrowLabel: content?.eyebrowLabel?.trim() || fb?.eyebrowLabel || "",
    headline: content?.headline?.trim() || fb?.headline || "",
    focalLine: content?.focalLine?.trim() || fb?.focalLine || "",
    narrativeParagraph1:
      content?.narrativeParagraph1?.trim() || fb?.narrativeParagraph1 || "",
    narrativeParagraph2:
      content?.narrativeParagraph2?.trim() || fb?.narrativeParagraph2 || "",
    closingLine: content?.closingLine?.trim() || fb?.closingLine || "",
    formIntro: content?.formIntro?.trim() || fb?.formIntro || "",
    hubspotFormUrl:
      content?.hubspotFormUrl?.trim() || fb?.hubspotFormUrl || null,
    contactEmail: content?.contactEmail?.trim() || fb?.contactEmail || "",
    backToHomeLabel:
      content?.backToHomeLabel?.trim() || fb?.backToHomeLabel || "",
  }
}

type Props = {
  content: PrivateExpressionsPageSanity | null
  sanityConfigured: boolean
  fetchError?: boolean
}

export default function PrivateExpressionsLanding({
  content,
  sanityConfigured,
  fetchError,
}: Props) {
  const text = merged(content)
  const envOverride =
    process.env.NEXT_PUBLIC_PRIVATE_EXPRESSIONS_TYPEFORM_URL?.trim() ?? ""
  const formUrl = envOverride || text.hubspotFormUrl?.trim() || ""

  return (
    <section className="min-h-[calc(100dvh-4rem)] bg-oooLight text-deepBlack antialiased">
      <Container className="flex flex-col items-center py-24 text-center small:py-32">
        {(fetchError || (!content && sanityConfigured)) && (
          <p className="mb-6 max-w-lg text-xs text-amber-800/90" role="status">
            {fetchError
              ? "Couldn't load from Sanity (check storefront SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_TOKEN — see terminal logs). Showing fallback copy."
              : "Publish the “Private Expressions (OOO)” document in Sanity to edit this page."}
          </p>
        )}
        {!sanityConfigured ? (
          <p className="mb-6 max-w-lg text-xs text-amber-800/90" role="status">
            SANITY_PROJECT_ID is not set — using static fallback copy until the
            CMS is configured.
          </p>
        ) : null}
        <p className="mb-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
          {text.eyebrowLabel}
        </p>
        <div className="mb-14 max-w-xl space-y-6">
          <h1 className="text-2xl font-bold tracking-tighter leading-snug text-deepBlack md:text-3xl lg:text-4xl">
            {text.headline}
          </h1>
          <p className="text-xl font-semibold tracking-tight text-deepBlack md:text-2xl">
            {text.focalLine}
          </p>
          <p className="font-light leading-relaxed text-neutral-600">
            {text.narrativeParagraph1}
          </p>
          {text.narrativeParagraph2 && (
            <p className="font-light leading-relaxed text-neutral-600">
              {text.narrativeParagraph2}
            </p>
          )}
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            {text.closingLine}
          </p>
        </div>
        <p className="mb-4 w-full max-w-lg text-center text-sm font-medium text-neutral-600">
          {text.formIntro}
        </p>
        {formUrl ? (
          <div className="w-full max-w-lg">
            <iframe
              src={formUrl}
              title="OOO inquiry"
              className="min-h-[520px] w-full rounded-sm border border-neutral-200 bg-white shadow-[0_16px_48px_-24px_rgba(0,0,0,0.12)]"
            />
          </div>
        ) : (
          <p className="max-w-lg text-xs text-amber-800/90">
            Set the form URL in Sanity (hubspotFormUrl), or temporarily use
            NEXT_PUBLIC_PRIVATE_EXPRESSIONS_TYPEFORM_URL in your environment
            file.
          </p>
        )}
        <LocalizedClientLink
          href="/"
          className="mt-14 border-b border-neutral-400 pb-0.5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 transition-colors hover:border-deepBlack hover:text-deepBlack"
        >
          {text.backToHomeLabel}
        </LocalizedClientLink>
      </Container>
    </section>
  )
}
