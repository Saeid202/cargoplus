import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  productId: string
  variantCode: string | null
  variantImageUrl: string | null
  productName: string
  productPrice: number
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty: number) => void
  removeItem: (productId: string, variantCode: string | null) => void
  updateQuantity: (productId: string, variantCode: string | null, qty: number) => void
  clearCart: () => void
  loadFromLocalStorage: () => void
  syncToLocalStorage: () => void
  itemCount: () => number
  subtotal: () => number
}

const CART_KEY = 'cargoplus_cart'

function isSameItem(a: CartItem, b: { productId: string; variantCode: string | null }) {
  return a.productId === b.productId && a.variantCode === b.variantCode
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty) => {
        set((state) => {
          const existing = state.items.find((i) => isSameItem(i, item))
          if (existing) {
            return {
              items: state.items.map((i) =>
                isSameItem(i, item) ? { ...i, quantity: i.quantity + qty } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: qty }] }
        })
      },

      removeItem: (productId, variantCode) => {
        set((state) => ({
          items: state.items.filter((i) => !isSameItem(i, { productId, variantCode })),
        }))
      },

      updateQuantity: (productId, variantCode, qty) => {
        set((state) => ({
          items: state.items.map((i) =>
            isSameItem(i, { productId, variantCode }) ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      loadFromLocalStorage: () => {
        if (typeof window === 'undefined') return
        try {
          const raw = window.localStorage.getItem(CART_KEY)
          if (!raw) return
          const parsed = JSON.parse(raw)
          const items: CartItem[] = (parsed?.items ?? []).map((i: Record<string, unknown>) => ({
            productId: i.product_id as string,
            variantCode: (i.variant_code as string | null) ?? null,
            variantImageUrl: (i.variant_image_url as string | null) ?? null,
            productName: i.product_name as string,
            productPrice: i.product_price as number,
            quantity: i.quantity as number,
          }))
          set({ items })
        } catch {
          // ignore malformed data
        }
      },

      syncToLocalStorage: () => {
        if (typeof window === 'undefined') return
        const { items } = get()
        const payload = {
          items: items.map((i) => ({
            product_id: i.productId,
            variant_code: i.variantCode,
            variant_image_url: i.variantImageUrl,
            product_name: i.productName,
            product_price: i.productPrice,
            quantity: i.quantity,
          })),
        }
        window.localStorage.setItem(CART_KEY, JSON.stringify(payload))
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => {
        const total = get().items.reduce((sum, i) => sum + i.productPrice * i.quantity, 0)
        return Math.round(total * 100) / 100
      },
    }),
    {
      name: CART_KEY,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
)
