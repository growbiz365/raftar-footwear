import { createSlice } from '@reduxjs/toolkit';

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: load('raftar_cart', []),
    wishlist: load('raftar_wishlist', []),
    isOpen: false,
    isSearchOpen: false,
    showNewsletter: false,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, color, size, packSize = 1 } = action.payload;
      const existing = state.items.find(
        (i) =>
          i._id === product._id &&
          i.selectedColor === color &&
          i.selectedSize === size &&
          (i.packSize || 1) === packSize
      );
      if (existing) existing.quantity += quantity;
      else {
        const variant = (product.colorVariants || []).find((v) => v.name === color);
        const image = variant?.image || product.images?.[0] || '';
        state.items.push({
          ...product,
          image,
          quantity,
          selectedColor: color,
          selectedSize: size,
          packSize,
        });
      }
      localStorage.setItem('raftar_cart', JSON.stringify(state.items));
      state.isOpen = true;
    },
    removeFromCart: (state, action) => {
      const { id, color, size, packSize } = action.payload;
      state.items = state.items.filter(
        (i) =>
          !(
            i._id === id &&
            i.selectedColor === color &&
            i.selectedSize === size &&
            (i.packSize || 1) === (packSize || 1)
          )
      );
      localStorage.setItem('raftar_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { id, color, size, quantity, packSize } = action.payload;
      if (quantity < 1) {
        state.items = state.items.filter(
          (i) =>
            !(
              i._id === id &&
              i.selectedColor === color &&
              i.selectedSize === size &&
              (i.packSize || 1) === (packSize || 1)
            )
        );
      } else {
        const item = state.items.find(
          (i) =>
            i._id === id &&
            i.selectedColor === color &&
            i.selectedSize === size &&
            (i.packSize || 1) === (packSize || 1)
        );
        if (item) item.quantity = quantity;
      }
      localStorage.setItem('raftar_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.setItem('raftar_cart', '[]');
    },
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const idx = state.wishlist.findIndex((p) => p._id === product._id);
      if (idx >= 0) state.wishlist.splice(idx, 1);
      else state.wishlist.push(product);
      localStorage.setItem('raftar_wishlist', JSON.stringify(state.wishlist));
    },
    setCartOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setSearchOpen: (state, action) => {
      state.isSearchOpen = action.payload;
    },
    setShowNewsletter: (state, action) => {
      state.showNewsletter = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleWishlist,
  setCartOpen,
  setSearchOpen,
  setShowNewsletter,
} = cartSlice.actions;

export const selectCartCount = (state) =>
  state.cart.items.reduce((s, i) => s + i.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
export const selectIsInWishlist = (id) => (state) =>
  state.cart.wishlist.some((p) => p._id === id);

export default cartSlice.reducer;
