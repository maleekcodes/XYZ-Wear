import { Text } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'

export const WAITLIST_AVAILABLE = 'waitlist-available'
export const RESTOCK_AVAILABLE = 'restock-available'

export type CatalogAlertTemplateProps = {
  productName: string
  productUrl?: string
  preview?: string
  kind: 'waitlist' | 'restock'
}

export const isCatalogAlertTemplateData = (data: any): data is CatalogAlertTemplateProps =>
  typeof data?.productName === 'string' &&
  (data?.kind === 'waitlist' || data?.kind === 'restock')

export const CatalogAlertTemplate: React.FC<CatalogAlertTemplateProps> = ({
  productName,
  productUrl,
  kind,
  preview,
}) => (
  <Base preview={preview ?? `${productName} is available`}>
    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
      {kind === 'waitlist' ? 'Pre-order is now open' : 'Back in stock'}
    </Text>
    <Text>
      {productName} is now available. Visit the product page to continue.
    </Text>
    {productUrl ? <Text>{productUrl}</Text> : null}
  </Base>
)
