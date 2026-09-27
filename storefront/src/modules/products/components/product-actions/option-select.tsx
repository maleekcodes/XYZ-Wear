import { isSizeOption, sortedDisplayValues } from "@lib/util/product-options"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  hint?: string | null
  note?: string | null
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  hint,
  note,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = sortedDisplayValues(title, option.values)
  const frameSizes: Record<string, string> = {
    S: "Lean",
    M: "Balanced",
    L: "Athletic",
    XL: "Broad",
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500">
          {title}
        </span>
        {hint && (
          <span className="text-xs text-neutral-500">{hint}</span>
        )}
      </div>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const frameName = isSizeOption(title)
            ? frameSizes[v?.trim().toUpperCase() ?? ""]
            : undefined

          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              type="button"
              className={clx(
                "group relative min-h-10 min-w-[2.5rem] flex-1 border border-neutral-200 bg-white px-3 py-2 text-sm text-deepBlack transition-colors",
                {
                  "border-deepBlack bg-concrete": v === current,
                  "hover:border-deepBlack": v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
              aria-label={frameName ? `${v}, ${frameName} frame` : undefined}
            >
              {v}
              {frameName && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap border border-neutral-200 bg-deepBlack px-3 py-2 text-xs font-normal text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {frameName}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {note && (
        <p className="text-xs leading-relaxed text-neutral-500">{note}</p>
      )}
    </div>
  )
}

export default OptionSelect
