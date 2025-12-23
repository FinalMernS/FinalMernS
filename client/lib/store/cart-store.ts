import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  coverImage?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find((i) => i.bookId === item.bookId);
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.bookId === item.bookId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (bookId) => {
        set({ items: get().items.filter((i) => i.bookId !== bookId) });
      },
      updateQuantity: (bookId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(bookId);
        } else {
          set({
            items: get().items.map((i) =>
              i.bookId === bookId ? { ...i, quantity } : i
            ),
          });
        }
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);


