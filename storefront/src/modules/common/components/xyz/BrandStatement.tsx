import { Container } from "./Container"

type BrandStatementProps = {
  placement: "home" | "product"
}

export function BrandStatement({ placement }: BrandStatementProps) {
  if (placement === "home") {
    return (
      <section className="border-t border-neutral-100 py-16 text-center md:py-20">
        <Container>
          <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed tracking-tight text-deepBlack md:text-2xl">
            XYZ London, for those who explore, question, and move beyond
            familiarity.
          </p>
          <p className="mt-4 text-sm text-neutral-500 md:text-base">
            The greatest discoveries are always found in the unknown.
          </p>
        </Container>
      </section>
    )
  }

  return (
    <section className="border-y border-neutral-100 py-12 text-center md:py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mx-auto max-w-4xl text-lg font-medium leading-relaxed tracking-wide text-oooAccent sm:text-xl md:text-2xl">
          <span className="block">XYZ LONDON IS NOT ABOUT FITTING IN.</span>
          <span className="mt-3 block">
            IT IS ABOUT EXPRESSING YOUR ORIGINAL SELF.
          </span>
        </h2>
        <div className="mx-auto my-4 h-8 w-px bg-oooAccent md:my-6" aria-hidden="true" />
        <p className="text-sm text-oooAccent md:text-base">
          From the unknown to the known.
        </p>
      </div>
    </section>
  )
}
