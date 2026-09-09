import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { getMergedProducts, STATIC_CATEGORIES, STATIC_PRODUCTS } from '../../data/catalog';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}) => {
  try {
    const { data } = await api.get('/products', { params });
    const apiList = data.data || data || [];
    if (Array.isArray(apiList) && apiList.length > 0) return apiList;
  } catch (e) {
    // fall through to static
  }
  let list = getMergedProducts();
  if (params.category) {
    const cat = String(params.category).toLowerCase();
    list = list.filter(
      (p) =>
        p.category?.toLowerCase() === cat ||
        p.brand === cat ||
        p.tags?.some((t) => t.toLowerCase() === cat) ||
        (cat === 'raftar' && p.brand === 'raftar') ||
        (cat === 'superstar' && p.brand === 'superstar')
    );
  }
  if (params.q) {
    const q = String(params.q).toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.article?.toLowerCase().includes(q)
    );
  }
  return list;
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (idOrSlug) => {
  try {
    const { data } = await api.get(`/products/${idOrSlug}`);
    if (data.data) return data.data;
  } catch (e) {
    // fall through
  }
  const all = getMergedProducts();
  return all.find((p) => p.slug === idOrSlug || p._id === idOrSlug) || null;
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async () => {
  try {
    const { data } = await api.get('/categories');
    const list = data.data || data || [];
    if (Array.isArray(list) && list.length > 0) return list;
  } catch (e) {}
  return STATIC_CATEGORIES;
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: STATIC_PRODUCTS,
    categories: STATIC_CATEGORIES,
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
    setLocalProducts: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : getMergedProducts();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.items = getMergedProducts();
      })
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProduct.rejected, (state) => {
        state.loading = false;
        state.current = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload) ? action.payload : STATIC_CATEGORIES;
      });
  },
});

export const { clearCurrent, setLocalProducts } = productSlice.actions;
export default productSlice.reducer;
