"use client"

import { sizeGuideFromProduct } from "@lib/util/physical-product-copy"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"

export default function SizeGuide({
  product,
}: {
  product?: HttpTypes.StoreProduct
}) {
  const { state, toggle } = useToggleState()
  const guide = sizeGuideFromProduct(product)
  if (!guide) return null

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={toggle}
        className="self-start text-sm text-deepBlack underline underline-offset-4 decoration-neutral-300 transition-colors hover:decoration-deepBlack"
        aria-expanded={state}
      >
        Size guides
      </button>
      {state && (
        <div className="border border-neutral-200 bg-white p-4">
          {guide.intro && (
            <p className="text-xs leading-relaxed text-neutral-500">
              {guide.intro}
            </p>
          )}
          {guide.title && (
            <h3 className="mt-4 text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500">
              {guide.title}
            </h3>
          )}
          {guide.columns.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-left text-xs text-deepBlack">
                <thead>
                  <tr className="border-b border-neutral-200">
                    {guide.columns.map((column) => (
                      <th
                        key={column}
                        className="py-2 pr-3 font-mono text-[10px] font-medium uppercase tracking-widest text-neutral-400"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row) => (
                    <tr
                      key={row[0]}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      {row.map((cell, index) => (
                        <td
                          key={`${row[0]}-${index}`}
                          className={`py-2.5 pr-3 ${index === 0 ? "font-medium" : "tabular-nums text-neutral-600"}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
