/** Lightweight item shown in the list view. */
export interface Item {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

/** Full detail payload returned by the mock API. */
export interface ItemDetail {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  stats: {
    label: string;
    value: string;
  }[];
  tags: string[];
  createdAt: string;
}

/** Redux slice state. */
export interface ItemsState {
  items: Item[];
  selectedItem: ItemDetail | null;
  /** ID of the item currently being fetched — drives per-button spinners. */
  loadingItemId: string | null;
  error: string | null;
}
