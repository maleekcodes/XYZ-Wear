import { RadioGroup } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React from "react"

import {
  checkoutRadioCard,
  checkoutRadioCardSelected,
} from "@modules/checkout/components/checkout-ui"
import Radio from "@modules/common/components/radio"

import PaymentTest from "../payment-test"
import { isManual } from "@lib/constants"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
}) => {
  return (
    <>
      <RadioGroup.Option
        key={paymentProviderId}
        value={paymentProviderId}
        disabled={disabled}
        className={clx(
          checkoutRadioCard,
          "flex-col gap-y-2",
          {
            [checkoutRadioCardSelected]:
              selectedPaymentOptionId === paymentProviderId,
          }
        )}
      >
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-x-4">
            <Radio checked={selectedPaymentOptionId === paymentProviderId} />
            <Text className="text-sm text-deepBlack">
              {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
            </Text>
            {isManual(paymentProviderId) && (
              <PaymentTest className="hidden small:block" />
            )}
          </div>
          <span className="justify-self-end text-deepBlack">
            {paymentInfoMap[paymentProviderId]?.icon}
          </span>
        </div>
        {isManual(paymentProviderId) && (
          <PaymentTest className="small:hidden text-[10px]" />
        )}
      </RadioGroup.Option>
    </>
  )
}

export default PaymentContainer
