import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchItemDetail } from '../../api/mockApi';
import type { ItemsState } from './types';

// ─── Initial State ──────────────────────────────────────────────────────────────

const initialState: ItemsState = {
  items: [],
  selectedItem: null,
  loadingItemId: null,
  error: null,
};

// ─── Async Thunks ───────────────────────────────────────────────────────────────

/**
 * Fetches full detail for a single item by ID.
 * This thunk is dispatched BEFORE navigation — "fetch-before-render".
 */
export const fetchItemDetailThunk = createAsyncThunk(
  'items/fetchItemDetail',
  async (id: string) => {
    const detail = await fetchItemDetail(id);
    return detail;
  },
);

// ─── Slice ──────────────────────────────────────────────────────────────────────

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    /** Clears the selected item (used when navigating back to list). */
    clearSelectedItem(state) {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemDetailThunk.pending, (state, action) => {
        state.loadingItemId = action.meta.arg; // The item ID being fetched
        state.error = null;
      })
      .addCase(fetchItemDetailThunk.fulfilled, (state, action) => {
        state.loadingItemId = null;
        state.selectedItem = action.payload;
      })
      .addCase(fetchItemDetailThunk.rejected, (state, action) => {
        state.loadingItemId = null;
        state.error = action.error.message ?? 'Failed to fetch item details.';
      });
  },
});

export const { clearSelectedItem } = itemsSlice.actions;
export default itemsSlice.reducer;
