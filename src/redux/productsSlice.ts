import axios from 'axios';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../types/models';

const API_URL = 'http://localhost:3001/products';

export const updateProduct = createAsyncThunk<Product, Product>(
  'products/update',
  async (product) => {
    const { id, ...payload } = product;
    const res = await axios.put<Product>(`${API_URL}/${id}`, payload);
    return res.data;
  }
);

export const fetchProducts = createAsyncThunk<Product[]>(
  'products/fetch',
  async () => {
    const response = await axios.get<Product[]>(API_URL);
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk<number | string, number | string>(
  'products/delete',
  async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

type State = {
  items: Product[];
  loading: boolean;
  error: string | null;
};

const initialState: State = {
  items: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addLocalProduct(state, action: PayloadAction<Product>) {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch products';
      })

      // deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number | string>) => {
        const removedId = action.payload;
        if (removedId == null) return;
        state.items = state.items.filter((p) => String(p.id) !== String(removedId));
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete product';
      })

      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const updated = action.payload;
        if (!updated || typeof updated.id === 'undefined') return;
        state.items = state.items.map((p) => (String(p.id) === String(updated.id) ? updated : p));
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to update product';
      });
  },
});

export const { addLocalProduct } = productsSlice.actions;
export default productsSlice.reducer;
