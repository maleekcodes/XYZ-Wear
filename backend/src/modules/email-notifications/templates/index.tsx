import { ReactNode } from 'react'
import { MedusaError } from '@medusajs/framework/utils'
import { InviteUserEmail, INVITE_USER, isInviteUserData } from './invite-user'
import { OrderPlacedTemplate, ORDER_PLACED, isOrderPlacedTemplateData } from './order-placed'
import {
  CatalogAlertTemplate,
  RESTOCK_AVAILABLE,
  WAITLIST_AVAILABLE,
  isCatalogAlertTemplateData,
} from './catalog-alert'

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  WAITLIST_AVAILABLE,
  RESTOCK_AVAILABLE,
} as const

export type EmailTemplateType = keyof typeof EmailTemplates

export function generateEmailTemplate(templateKey: string, data: unknown): ReactNode {
  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        )
      }
      return <InviteUserEmail {...data} />

    case EmailTemplates.ORDER_PLACED:
      if (!isOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        )
      }
      return <OrderPlacedTemplate {...data} />

    case EmailTemplates.WAITLIST_AVAILABLE:
    case EmailTemplates.RESTOCK_AVAILABLE:
      if (!isCatalogAlertTemplateData(data)) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Invalid data for template "${templateKey}"`)
      }
      return <CatalogAlertTemplate {...data} />

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export { InviteUserEmail, OrderPlacedTemplate, CatalogAlertTemplate }
