"use client"

import { Badge, Heading, Input, Label, Text } from "@medusajs/ui"
import React, { useActionState } from "react"

import { applyPromotions, submitPromotionForm } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  /** Match XYZ cart summary typography (no Medusa default panel / blue link). */
  variant?: "default" | "xyz"
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart, variant = "default" }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [removeError, setRemoveError] = React.useState<string | null>(null)

  const promotions = cart.promotions ?? []

  const promotionCodesKey = promotions
    .filter((p) => !p.is_automatic)
    .map((p) => p.code)
    .filter((c): c is string => typeof c === "string" && c.length > 0)
    .sort()
    .join("|")

  const removePromotionCode = async (code: string) => {
    setRemoveError(null)
    const remainingCodes = promotions
      .filter((p) => !p.is_automatic && p.code !== code)
      .map((p) => p.code)
      .filter((c): c is string => typeof c === "string" && c.length > 0)

    try {
      await applyPromotions(remainingCodes)
    } catch (e: unknown) {
      setRemoveError(e instanceof Error ? e.message : String(e))
    }
  }

  const [message, formAction] = useActionState(submitPromotionForm, null)

  React.useEffect(() => {
    setRemoveError(null)
  }, [promotionCodesKey])

  const isXyz = variant === "xyz"

  return (
    <div
      className={
        isXyz ? "flex w-full flex-col" : "flex w-full flex-col bg-white"
      }
    >
      <div className={isXyz ? "" : "txt-medium"}>
        <form action={formAction} className={isXyz ? "mb-0 w-full" : "mb-5 w-full"}>
          {isXyz ? (
            <div className="w-full">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="w-full text-left text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-[5px] transition-colors hover:text-deepBlack hover:decoration-deepBlack"
                data-testid="add-discount-button"
              >
                Add promotion code(s)
              </button>
            </div>
          ) : (
            <Label className="my-2 flex items-center gap-x-1">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="add-discount-button"
              >
                Add Promotion Code(s)
              </button>
            </Label>
          )}

          {isOpen && (
            <>
              <div
                className={
                  isXyz ? "mt-4 flex w-full gap-x-2" : "flex w-full gap-x-2"
                }
              >
                <Input
                  key={promotionCodesKey}
                  className={
                    isXyz
                      ? "h-10 w-full min-w-0 rounded-none border-neutral-300"
                      : "size-full"
                  }
                  id="promotion-input"
                  name="code"
                  type="text"
                  autoFocus={false}
                  data-testid="discount-input"
                />
                <SubmitButton
                  variant="secondary"
                  data-testid="discount-apply-button"
                  className={
                    isXyz
                      ? "h-10 shrink-0 rounded-none border border-deepBlack bg-white px-4 text-xs font-mono uppercase tracking-widest text-deepBlack hover:bg-neutral-100"
                      : undefined
                  }
                >
                  Apply
                </SubmitButton>
              </div>

              <ErrorMessage
                error={message}
                data-testid="discount-error-message"
              />
            </>
          )}
        </form>

        {promotions.length > 0 && (
          <div
            className={
              isXyz ? "mt-4 flex w-full items-center" : "flex w-full items-center"
            }
          >
            <div className="flex w-full flex-col">
              {isXyz ? (
                <div className="mb-2 text-sm font-bold text-deepBlack">
                  Promotion(s) applied:
                </div>
              ) : (
                <Heading className="txt-medium mb-2">
                  Promotion(s) applied:
                </Heading>
              )}

              {promotions.map((promotion) => {
                return (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between w-full max-w-full mb-2"
                    data-testid="discount-row"
                  >
                    <Text
                      className={
                        isXyz
                          ? "flex w-4/5 items-baseline gap-x-1 pr-1 text-sm text-deepBlack"
                          : "flex w-4/5 items-baseline gap-x-1 txt-small-plus pr-1"
                      }
                    >
                      <span className="truncate" data-testid="discount-code">
                        <Badge
                          color={promotion.is_automatic ? "green" : "grey"}
                          size="small"
                        >
                          {promotion.code}
                        </Badge>{" "}
                        (
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: promotion.application_method.value,
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                        )
                        {/* {promotion.is_automatic && (
                          <Tooltip content="This promotion is automatically applied">
                            <InformationCircleSolid className="inline text-zinc-400" />
                          </Tooltip>
                        )} */}
                      </span>
                    </Text>
                    {!promotion.is_automatic && (
                      <button
                        className="flex items-center"
                        onClick={() => {
                          if (!promotion.code) {
                            return
                          }

                          removePromotionCode(promotion.code)
                        }}
                        data-testid="remove-discount-button"
                      >
                        <Trash size={14} />
                        <span className="sr-only">
                          Remove discount code from order
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
              <ErrorMessage
                error={removeError}
                data-testid="remove-discount-error-message"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
