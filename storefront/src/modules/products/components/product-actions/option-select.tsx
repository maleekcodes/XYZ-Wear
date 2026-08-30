import { sortedDisplayValues } from "@lib/util/product-options"
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
          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              type="button"
              className={clx(
                "min-h-10 min-w-[2.5rem] flex-1 border border-neutral-200 bg-white px-3 py-2 text-sm text-deepBlack transition-colors",
                {
                  "border-deepBlack bg-concrete": v === current,
                  "hover:border-deepBlack": v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
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
