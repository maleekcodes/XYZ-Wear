import {
  digitalShippingAndReturns,
  type DigitalProductCopy,
} from "@lib/digital/digital-product-copy"

export function DigitalProductInformation({
  copy,
  productName,
}: {
  copy: DigitalProductCopy
  productName: string
}) {
  const details = [
    ["Composition", copy.composition],
    ["Visual Effects", copy.visualEffects],
    ["Design Details", copy.designDetails],
    ["Type", copy.type],
    ["Core Product ID", copy.coreProductId],
    ["Item Number", copy.itemNumber],
  ] as const

  return (
    <section
      className="max-w-2xl space-y-8 border-t border-neutral-800 pt-8"
      aria-labelledby="digital-description-title"
    >
      <div>
        <h2
          id="digital-description-title"
          className="font-mono text-xs font-bold uppercase tracking-widest text-white"
        >
          Description
        </h2>
        <div className="mt-4 space-y-1 text-sm leading-relaxed text-neutral-300">
          {copy.name !== productName ? (
            <p className="font-medium text-white">{copy.name}</p>
          ) : null}
          <p>{copy.subtitle}</p>
          <p className="italic text-neutral-500">{copy.collection}</p>
        </div>
        <h3 className="mt-4 text-sm font-medium text-neutral-300">
          Details &amp; Materials
        </h3>
        <dl className="mt-4 divide-y divide-neutral-800">
          {details.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"
            >
              <dt className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                {label}
              </dt>
              <dd className="text-sm leading-relaxed text-neutral-300">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-5 text-sm leading-relaxed text-neutral-300">
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            Country of Origin
          </h3>
          <p className="mt-2">{copy.origin}</p>
        </div>
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            Dimension
          </h3>
          <p className="mt-2">
            <span className="font-medium text-white">Fit:</span> {copy.fit}
          </p>
        </div>
      </div>
    </section>
  )
}

export function DigitalShippingReturns() {
  return (
    <section className="max-w-2xl border-t border-neutral-800 pt-6 text-sm leading-relaxed text-neutral-300">
      <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
        Shipping &amp; Returns
      </h2>
      <p className="mt-4">
        <span className="font-medium text-white">No Shipping:</span>{" "}
        {digitalShippingAndReturns.shipping}
      </p>
      <p className="mt-3">
        <span className="font-medium text-white">Returns:</span>{" "}
        {digitalShippingAndReturns.returns}
      </p>
    </section>
  )
}

export function DigitalProductSizeInfo({ copy }: { copy: DigitalProductCopy }) {
  return (
    <section className="border-t border-neutral-800 pt-6 text-sm leading-relaxed text-neutral-300">
      <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
        Size info
      </h2>
      {copy.sizeInfo.map((line) => (
        <p key={line} className="mt-2">{line}</p>
      ))}
      {copy.sizeGuide ? (
        <div className="mt-5">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
            Size guides
          </h3>
          <p className="mt-2">{copy.sizeGuide}</p>
        </div>
      ) : null}
    </section>
  )
}
