import type { ShapeType } from "@/types/xyz"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Shape } from "@modules/common/components/xyz/Shape"
import type { ComingSoonCategory } from "@modules/store/lib/group-products-by-category"

export const FUTURE_FORMS_SECTION_ID = "future-forms"

type FutureFormShape =
  | ShapeType
  | "stackedSquares"
  | "pairedSquares"
  | "tallRect"
  | "wideRect"

type FutureFormTeaser = {
  id: string
  name: string
  handle?: string | null
  shape: FutureFormShape
}

const SHAPE_CYCLE: FutureFormShape[] = [
  "hexagon",
  "stackedSquares",
  "pairedSquares",
  "hexagon",
  "tallRect",
  "wideRect",
  "rhombus",
  "trapezoid",
]

const DEFAULT_TEASERS: FutureFormTeaser[] = [
  { id: "hoodies", name: "Hoodies", shape: "hexagon" },
  { id: "sweat-shirt", name: "Sweat shirt", shape: "stackedSquares" },
  {
    id: "sweat-pants",
    name: "Sweat pants or joggers",
    shape: "pairedSquares",
  },
  { id: "jackets", name: "Jackets", shape: "hexagon" },
  { id: "leggings", name: "Leggings/activewears", shape: "tallRect" },
  { id: "shorts", name: "Shorts", shape: "wideRect" },
  { id: "sneakers", name: "Sneakers", shape: "rhombus" },
  { id: "deja-slippert", name: "Deja slippert", shape: "trapezoid" },
]

const SHAPE_FILL = "bg-neutral-200"

const KNOWN_SHAPES = new Set<FutureFormShape>([
  "hexagon",
  "square",
  "rhombus",
  "trapezoid",
  "circle",
  "triangle",
  "pentagon",
  "octagon",
  "ellipse",
  "curve",
  "stackedSquares",
  "pairedSquares",
  "tallRect",
  "wideRect",
])

function asShape(value?: string | null): FutureFormShape | null {
  if (!value) return null
  return KNOWN_SHAPES.has(value as FutureFormShape)
    ? (value as FutureFormShape)
    : null
}

function shapeForIndex(index: number): FutureFormShape {
  return SHAPE_CYCLE[index % SHAPE_CYCLE.length]
}

function resolveTeasers(items?: ComingSoonCategory[]): FutureFormTeaser[] {
  if (!items?.length) return DEFAULT_TEASERS

  return items.map((item, index) => ({
    id: item.id,
    name: item.name,
    handle: item.handle,
    shape: asShape(item.shape) ?? shapeForIndex(index),
  }))
}

function TeaserShape({ shape }: { shape: FutureFormShape }) {
  if (shape === "stackedSquares") {
    return (
      <div className="flex flex-col gap-2">
        <Shape type="square" className={`h-9 w-9 md:h-11 md:w-11 ${SHAPE_FILL}`} />
        <Shape type="square" className={`h-9 w-9 md:h-11 md:w-11 ${SHAPE_FILL}`} />
      </div>
    )
  }

  if (shape === "pairedSquares") {
    return (
      <div className="flex gap-2">
        <Shape type="square" className={`h-9 w-9 md:h-11 md:w-11 ${SHAPE_FILL}`} />
        <Shape type="square" className={`h-9 w-9 md:h-11 md:w-11 ${SHAPE_FILL}`} />
      </div>
    )
  }

  if (shape === "tallRect") {
    return (
      <Shape
        type="square"
        className={`h-[4.5rem] w-8 !aspect-auto md:h-24 md:w-10 ${SHAPE_FILL}`}
      />
    )
  }

  if (shape === "wideRect") {
    return (
      <Shape
        type="square"
        className={`h-8 w-[4.5rem] !aspect-auto md:h-10 md:w-24 ${SHAPE_FILL}`}
      />
    )
  }

  return (
    <Shape type={shape} className={`h-16 w-16 md:h-20 md:w-20 ${SHAPE_FILL}`} />
  )
}

function ComingSoonIcons() {
  return (
    <div className="flex items-center gap-4">
      <Shape type="circle" className="h-4 w-4 bg-neutral-200" />
      <Shape type="square" className="h-4 w-4 bg-neutral-300" />
      <Shape type="triangle" className="h-4 w-4 bg-neutral-200" />
    </div>
  )
}

function TeaserCell({ teaser }: { teaser: FutureFormTeaser }) {
  const inner = (
    <>
      <span className="relative z-10 max-w-[70%] text-left text-sm font-bold leading-tight tracking-tight text-neutral-400 md:text-base">
        {teaser.name}
      </span>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-4">
        <TeaserShape shape={teaser.shape} />
      </div>
    </>
  )

  const className =
    "group relative flex min-h-[200px] flex-col items-start border-b border-r border-neutral-200 p-4 md:min-h-[240px] md:p-5"

  if (teaser.handle) {
    return (
      <LocalizedClientLink href={`/categories/${teaser.handle}`} className={className}>
        {inner}
      </LocalizedClientLink>
    )
  }

  return <div className={className}>{inner}</div>
}

export function PhysicalFutureForms({
  items,
}: {
  items?: ComingSoonCategory[]
}) {
  const teasers = resolveTeasers(items)

  return (
    <section
      id={FUTURE_FORMS_SECTION_ID}
      aria-labelledby="future-forms-heading"
      className="scroll-mt-40 py-16 md:py-24"
    >
      <div className="mb-10 space-y-8">
        <h2
          id="future-forms-heading"
          className="text-3xl font-bold tracking-tighter text-deepBlack md:text-4xl"
        >
          Future Forms
        </h2>

        <div className="flex justify-center">
          <ComingSoonIcons />
        </div>
      </div>

      {teasers.length > 0 && (
        <div className="border-l border-t border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {teasers.map((teaser) => (
              <TeaserCell key={teaser.id} teaser={teaser} />
            ))}
          </div>
        </div>
      )}

    </section>
  )
}
