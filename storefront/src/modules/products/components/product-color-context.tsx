"use client"

import {
  appearanceValues,
  defaultAppearanceValue,
} from "@lib/util/product-options"
import { HttpTypes } from "@medusajs/types"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type ProductColorContextValue = {
  color: string | undefined
  setColor: (color: string) => void
  colors: string[]
}

const ProductColorContext = createContext<ProductColorContextValue | null>(
  null
)

export function productColorValues(
  product: HttpTypes.StoreProduct
): string[] {
  return appearanceValues(product)
}

export function defaultProductColor(
  product: HttpTypes.StoreProduct
): string | undefined {
  return defaultAppearanceValue(product)
}

export function ProductColorProvider({
  product,
  children,
}: {
  product: HttpTypes.StoreProduct
  children: ReactNode
}) {
  const colors = useMemo(() => appearanceValues(product), [product])
  const [color, setColorState] = useState<string | undefined>(
    () => colors[0]
  )
  const setColor = useCallback((next: string) => {
    setColorState(next)
  }, [])
  const value = useMemo(
    () => ({
      color: color ?? colors[0],
      setColor,
      colors,
    }),
    [color, colors, setColor]
  )

  return (
    <ProductColorContext.Provider value={value}>
      {children}
    </ProductColorContext.Provider>
  )
}

export function useProductColor() {
  return useContext(ProductColorContext)
}
