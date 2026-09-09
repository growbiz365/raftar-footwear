import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboard = createAsyncThunk('admin/dashboard', async () => {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
});

export const adminFetchProducts = createAsyncThunk('admin/products', async () => {
  const { data } = await api.get('/admin/products');
  return data.data || [];
});

export const adminCreateProduct = createAsyncThunk('admin/createProduct', async (product) => {
  const { data } = await api.post('/admin/products', product);
  return data.data;
});

export const adminUpdateProduct = createAsyncThunk('admin/updateProduct', async ({ id, ...product }) => {
  const { data } = await api.put(`/admin/products/${id}`, product);
  return data.data;
});

export const adminDeleteProduct = createAsyncThunk('admin/deleteProduct', async (id) => {
  await api.delete(`/admin/products/${id}`);
  return id;
});

export const adminFetchOrders = createAsyncThunk('admin/orders', async () => {
  const { data } = await api.get('/admin/orders');
  return data.data || [];
});

export const adminUpdateOrderStatus = createAsyncThunk('admin/updateOrder', async ({ id, status }) => {
  const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
  return data.data;
});

export const adminDeleteOrder = createAsyncThunk('admin/deleteOrder', async (id) => {
  await api.delete(`/admin/orders/${id}`);
  return id;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    dashboard: null,
    products: [],
    orders: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.dashboard = action.payload; })
      .addCase(adminFetchProducts.fulfilled, (state, action) => { state.products = action.payload; })
      .addCase(adminCreateProduct.fulfilled, (state, action) => { state.products.push(action.payload); })
      .addCase(adminUpdateProduct.fulfilled, (state, action) => {
        const i = state.products.findIndex(p => p._id === action.payload._id);
        if (i >= 0) state.products[i] = action.payload;
      })
      .addCase(adminDeleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      .addCase(adminFetchOrders.fulfilled, (state, action) => { state.orders = action.payload; })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        const i = state.orders.findIndex(o => o._id === action.payload._id);
        if (i >= 0) state.orders[i] = action.payload;
      })
      .addCase(adminDeleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o._id !== action.payload);
      });
  }
});

export default adminSlice.reducer;
