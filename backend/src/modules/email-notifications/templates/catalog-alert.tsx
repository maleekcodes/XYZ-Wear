import { Button, Img, Text } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'

export const WAITLIST_AVAILABLE = 'waitlist-available'
export const RESTOCK_AVAILABLE = 'restock-available'

export type CatalogAlertTemplateProps = {
  productName: string
  productUrl?: string
  imageUrl?: string
  price?: string
  preview?: string
  kind: 'waitlist' | 'restock'
}

export const isCatalogAlertTemplateData = (data: any): data is CatalogAlertTemplateProps =>
  typeof data?.productName === 'string' &&
  (data?.kind === 'waitlist' || data?.kind === 'restock')

export const CatalogAlertTemplate: React.FC<CatalogAlertTemplateProps> = ({
  productName,
  productUrl,
  imageUrl,
  price,
  kind,
  preview,
}) => (
  <Base preview={preview ?? `${productName} is available`}>
    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
      {kind === 'waitlist' ? 'Pre-order is now open' : 'Back in stock'}
    </Text>
    {imageUrl ? (
      <Img
        src={imageUrl}
        alt={productName}
        width="425"
        style={{ width: '100%', height: 'auto', maxHeight: '520px', objectFit: 'contain', margin: '16px 0' }}
      />
    ) : null}
    <Text>
      Thank you for waiting. We are excited to notify you that pre-order for {productName} is ready.
    </Text>
    {price ? <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>{price}</Text> : null}
    {productUrl ? (
      <Button
        href={productUrl}
        style={{ backgroundColor: '#111111', color: '#ffffff', padding: '14px 22px', textDecoration: 'none', display: 'inline-block', fontSize: '14px', fontWeight: 'bold' }}
      >
        Pre-order
      </Button>
    ) : null}
  </Base>
)
