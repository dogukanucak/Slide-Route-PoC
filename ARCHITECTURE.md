# Slide-Route PoC — Architecture & Integration Guide

> **Audience**: AI coding agents and developers who need to understand and replicate this pattern in their own React applications.

---

## 1. What This PoC Solves

Most React SPAs use the **Fetch-on-Render** paradigm: the user navigates to a page, a loader or skeleton is shown, and a `useEffect` fires to fetch data. This causes:

- **Loading spinners on the destination page** — a jarring experience.
- **Layout shifts** as content streams in.
- **No slide animations** because the destination page mounts in an "empty" state.

This PoC implements **Fetch-Before-Render** navigation with **slide transitions**, creating a mobile-app-like experience:

| Concern | How the PoC handles it |
|---|---|
| **Data fetching** | Happens *before* navigation — the user stays on the current page while data loads. |
| **Navigation** | Triggered *only after* the async operation succeeds. |
| **Destination page** | Reads data synchronously from the store — **zero `useEffect`, zero spinners**. |
| **Transitions** | Framer Motion slides pages in/out with spring physics. |
| **Direct URL access** | Safe redirect back to the list page when the store is empty. |

---

## 2. Tech Stack

| Library | Version | Purpose |
|---|---|---|
| `react` | 18.x | UI framework |
| `react-router-dom` | 6.x | Client-side routing |
| `@reduxjs/toolkit` | 2.x | State management + async thunks |
| `react-redux` | 9.x | React bindings for Redux |
| `framer-motion` | 11.x | Page transition animations |
| `vite` | 6.x | Dev server & build tool |
| `typescript` | 5.x | Type safety |

---

## 3. Project Structure

```
src/
├── main.tsx                          # Entry point — Provider + App
├── App.tsx                           # BrowserRouter + route definitions
├── index.css                         # Full application styles
│
├── app/
│   ├── store.ts                      # Redux store configuration
│   └── hooks.ts                      # Pre-typed useAppDispatch / useAppSelector
│
├── api/
│   └── mockApi.ts                    # Simulated async API (replace with real API)
│
├── features/
│   └── items/
│       ├── types.ts                  # Item, ItemDetail, ItemsState interfaces
│       └── itemsSlice.ts            # RTK slice + createAsyncThunk
│
├── hooks/
│   └── useFetchAndNavigate.ts       # ⭐ Core pattern — generic hook
│
├── components/
│   └── AnimatedOutlet.tsx           # ⭐ Framer Motion route wrapper
│
└── pages/
    ├── ItemsListPage.tsx            # Source page (triggers fetch + navigate)
    └── ItemDetailPage.tsx           # Destination page (reads store synchronously)
```

---

## 4. Architecture — The Three Pillars

### Pillar 1: `useFetchAndNavigate` — The Core Hook

**File:** `src/hooks/useFetchAndNavigate.ts`

This is the central piece of the pattern. It is a **generic, feature-agnostic** hook that:

1. Accepts any `() => Promise<T>` async operation and a target route.
2. Guards against duplicate in-flight requests via a `useRef` boolean.
3. Awaits the async operation — the user stays on the current page.
4. Navigates **only on success**.
5. On failure, the user stays on the current page; error handling is left to the caller's data layer.

```typescript
export function useFetchAndNavigate() {
  const navigate = useNavigate();
  const inflightRef = useRef(false);

  const fetchAndNavigate = useCallback(
    async <T = void>(
      asyncOperation: () => Promise<T>,
      to: string,
      options?: NavigateOptions,
    ): Promise<T | undefined> => {
      if (inflightRef.current) return undefined;   // Concurrency guard
      inflightRef.current = true;

      try {
        const result = await asyncOperation();     // Wait for data
        navigate(to, options);                     // Navigate AFTER success
        return result;
      } catch {
        return undefined;                          // Stay on current page
      } finally {
        inflightRef.current = false;
      }
    },
    [navigate],
  );

  return fetchAndNavigate;
}
```

**Key design decisions:**

- **Not coupled to Redux.** The `asyncOperation` parameter can be anything: a Redux thunk `.unwrap()`, a `fetch()` call, a React Query `queryClient.fetchQuery()`, etc.
- **Ref-based guard** instead of state — avoids re-renders from toggling a boolean.
- **Returns the result** so the caller can optionally use it.

---

### Pillar 2: `AnimatedOutlet` — Slide Transitions

**File:** `src/components/AnimatedOutlet.tsx`

Wraps React Router's outlet in Framer Motion's `AnimatePresence` to produce smooth page slides.

```typescript
const slideVariants = {
  initial: { x: '100%', opacity: 0 },                                       // Enter from right
  animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 30, mass: 0.8 } },
  exit:    { x: '-50%', opacity: 0, transition: { type: 'tween', ease: 'easeInOut', duration: 0.25 } },
};

export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="animated-outlet-wrapper">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}       // Re-key on route change triggers animation
          className="animated-page"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {outlet && cloneElement(outlet, { key: location.pathname })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

**Critical details:**

| Detail | Why |
|---|---|
| `mode="wait"` | Exiting page finishes its animation before the entering page starts — prevents overlap. |
| `key={location.pathname}` | Changing the key on a `motion.div` tells Framer Motion to unmount/remount, triggering exit/enter animations. |
| `useOutlet()` + `cloneElement` | `useOutlet()` returns the child route's element. We `cloneElement` it with the pathname key so React treats each route as a distinct instance. |
| `.animated-outlet-wrapper { overflow-x: hidden }` | **CSS is critical** — without this, the sliding page creates a horizontal scrollbar. |

---

### Pillar 3: Fetch-Before-Render Data Flow

The complete data lifecycle:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ItemsListPage                                │
│                                                                     │
│  1. User clicks "View Details →"                                    │
│  2. handleItemClick dispatches fetchItemDetailThunk(id).unwrap()     │
│     └─ passed as asyncOperation to useFetchAndNavigate              │
│  3. Redux slice → pending → loadingItemId = id → spinner on button  │
│  4. Mock API returns after 1200ms                                   │
│  5. Redux slice → fulfilled → selectedItem = detail payload         │
│  6. useFetchAndNavigate sees success → navigate('/details')         │
│                                                                     │
│  ✅ User stays on this page the entire time.                        │
│  ✅ Button shows a per-item loading spinner.                        │
│  ✅ Other buttons are disabled (no double-navigation).              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                   AnimatedOutlet slides
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        ItemDetailPage                               │
│                                                                     │
│  1. Reads selectedItem from Redux store — synchronous, instant.     │
│  2. No useEffect, no loading state, no spinner.                     │
│  3. Renders full detail UI immediately.                             │
│                                                                     │
│  Edge case: direct URL access (/details) with empty store           │
│  → <Navigate to="/" replace /> redirects to list.                   │
│                                                                     │
│  "Back" button: dispatches clearSelectedItem() then navigate('/').  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Redux Slice Anatomy

**File:** `src/features/items/itemsSlice.ts`

```typescript
// State shape
interface ItemsState {
  items: Item[];                    // List items (currently loaded from seed data)
  selectedItem: ItemDetail | null;  // Full detail — populated before navigation
  loadingItemId: string | null;     // Which item is being fetched — drives per-button spinner
  error: string | null;             // Error message from rejected thunk
}

// Thunk — dispatched BEFORE navigation
export const fetchItemDetailThunk = createAsyncThunk(
  'items/fetchItemDetail',
  async (id: string) => fetchItemDetail(id),
);

// Slice reducers
reducers: {
  clearSelectedItem(state) { state.selectedItem = null; }  // On "Back" navigation
}

// Extra reducers (thunk lifecycle)
pending:   loadingItemId = id, error = null
fulfilled: loadingItemId = null, selectedItem = payload
rejected:  loadingItemId = null, error = message
```

**Why `loadingItemId` instead of a boolean `isLoading`:**  
It identifies *which specific item* is loading, allowing per-button spinners and disabling other buttons during fetch.

---

## 6. Route Configuration

**File:** `src/App.tsx`

```tsx
<BrowserRouter>
  <Routes>
    <Route element={<AnimatedOutlet />}>     {/* Layout route — no path */}
      <Route path="/" element={<ItemsListPage />} />
      <Route path="/details" element={<ItemDetailPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

The layout route (`<Route element={<AnimatedOutlet />}>`) renders `AnimatedOutlet` which wraps all child route elements in the animation container. Child routes render into the outlet.

---

## 7. How to Apply This Pattern to Your React App

### Step-by-step integration guide

#### Step 1: Install dependencies

```bash
npm install framer-motion react-router-dom
# If using Redux (recommended but optional):
npm install @reduxjs/toolkit react-redux
```

#### Step 2: Copy the `useFetchAndNavigate` hook

Create `src/hooks/useFetchAndNavigate.ts` with the exact implementation from Section 4, Pillar 1. **No modifications needed** — it is fully generic.

#### Step 3: Copy the `AnimatedOutlet` component

Create `src/components/AnimatedOutlet.tsx` with the implementation from Section 4, Pillar 2. You may customize:

- `slideVariants` — change animation style (fade, scale, slide-up, etc.)
- `spring` parameters — adjust stiffness/damping for feel.

#### Step 4: Add required CSS

```css
/* Prevents horizontal scrollbar during slide animation */
.animated-outlet-wrapper {
  position: relative;
  overflow-x: hidden;
  min-height: 100vh;
  width: 100%;
}

.animated-page {
  width: 100%;
  min-height: 100vh;
}
```

> [!CAUTION]
> Without `overflow-x: hidden` on the wrapper, sliding pages will cause a horizontal scrollbar flash.

#### Step 5: Wrap your routes in `AnimatedOutlet`

```tsx
<BrowserRouter>
  <Routes>
    <Route element={<AnimatedOutlet />}>
      {/* All routes that should animate go here */}
      <Route path="/" element={<ListPage />} />
      <Route path="/details/:id" element={<DetailPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

#### Step 6: Use `useFetchAndNavigate` on the source page

```tsx
// Source page — triggers fetch before navigating
const fetchAndNavigate = useFetchAndNavigate();

const handleClick = (id: string) => {
  fetchAndNavigate(
    () => dispatch(fetchSomeData(id)).unwrap(),  // Any async operation
    `/details/${id}`,                             // Target route
  );
};
```

**Alternative data layers (no Redux needed):**

```tsx
// With plain fetch
fetchAndNavigate(
  async () => {
    const res = await fetch(`/api/items/${id}`);
    const data = await res.json();
    setItemData(data);  // Store in context, zustand, jotai, etc.
  },
  `/details/${id}`,
);

// With React Query
fetchAndNavigate(
  () => queryClient.fetchQuery({ queryKey: ['item', id], queryFn: () => getItem(id) }),
  `/details/${id}`,
);

// With Zustand
fetchAndNavigate(
  () => useStore.getState().fetchItem(id),
  `/details/${id}`,
);
```

#### Step 7: Read data synchronously on the destination page

```tsx
// Destination page — no useEffect, no loading spinner
export default function DetailPage() {
  const data = useAppSelector((state) => state.items.selectedItem);

  // Guard: handle direct URL access
  if (!data) {
    return <Navigate to="/" replace />;
  }

  return <div>{/* render data immediately */}</div>;
}
```

> [!IMPORTANT]
> The redirect guard (`if (!data) return <Navigate ... />`) is essential. Without it, users bookmarking or refreshing the detail page will see a crash because the store is empty.

---

## 8. Adapting the Animation Direction

The PoC uses a left-to-right slide. Here are ready-to-use variant presets for other directions:

### Fade transition
```typescript
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};
```

### Scale + fade
```typescript
const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit:    { opacity: 0, scale: 1.02, transition: { duration: 0.2 } },
};
```

### Slide up (bottom sheet feel)
```typescript
const slideUpVariants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 30 } },
  exit:    { y: '-30%', opacity: 0, transition: { duration: 0.25 } },
};
```

### Direction-aware (forward/back detection)
```typescript
// Store direction in a ref or context
const variants = {
  initial: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? '-100%' : '100%', opacity: 0 }),
};

// In AnimatedOutlet, pass `custom={direction}` to motion.div
<motion.div custom={direction} variants={variants} ... />
```

---

## 9. Common Pitfalls & Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Horizontal scrollbar flash | Missing `overflow-x: hidden` on wrapper | Add CSS from Step 4 |
| No animation on route change | `key` not changing on the `motion.div` | Ensure `key={location.pathname}` |
| Double navigation on rapid clicks | No concurrency guard | `useFetchAndNavigate` handles this with `inflightRef` |
| Destination page shows blank then crashes | Data not in store; `useEffect` fetch attempted | Remove `useEffect` fetch — data must be in store before navigation |
| Animation plays but page is empty | `useOutlet()` returning `null` | Ensure `AnimatedOutlet` is used as a **layout route** (`<Route element={...}>`) with child routes nested inside |
| Back button doesn't clear data | Forgetting to dispatch `clearSelectedItem` | Clear the store on back navigation to avoid stale data |
| Direct URL access crash | No guard on destination page | Add `if (!data) return <Navigate to="/" replace />` |

---

## 10. Reference: Full File-by-File Summary

| File | Lines | Purpose |
|---|---|---|
| `main.tsx` | 15 | Redux `Provider` + `App` mount |
| `App.tsx` | 24 | `BrowserRouter` + route tree with `AnimatedOutlet` layout |
| `app/store.ts` | 12 | `configureStore` with items reducer |
| `app/hooks.ts` | 9 | Typed `useAppDispatch` / `useAppSelector` |
| `api/mockApi.ts` | 132 | Seed data + `fetchItems()` / `fetchItemDetail()` with delays |
| `features/items/types.ts` | 32 | `Item`, `ItemDetail`, `ItemsState` interfaces |
| `features/items/itemsSlice.ts` | 58 | Redux slice with `fetchItemDetailThunk` async thunk |
| `hooks/useFetchAndNavigate.ts` | 62 | ⭐ Generic fetch-then-navigate hook |
| `components/AnimatedOutlet.tsx` | 61 | ⭐ Framer Motion `AnimatePresence` wrapper |
| `pages/ItemsListPage.tsx` | 74 | List page — dispatches thunk, shows per-item spinner |
| `pages/ItemDetailPage.tsx` | 69 | Detail page — sync read, redirect guard |
| `index.css` | 404 | Dark theme styles, animation wrapper, responsive |

---

## 11. Quick-Start Checklist for AI Agents

When applying this pattern to an existing React app, follow this checklist:

- [ ] Install `framer-motion` (and `react-router-dom` v6 if not already present)
- [ ] Create `useFetchAndNavigate.ts` hook (copy as-is — it's generic)
- [ ] Create `AnimatedOutlet.tsx` component (customize variants as needed)
- [ ] Add `.animated-outlet-wrapper` and `.animated-page` CSS classes
- [ ] Create a layout route in your router using `<Route element={<AnimatedOutlet />}>`
- [ ] Nest all animated child routes inside the layout route
- [ ] On source pages: use `fetchAndNavigate(asyncOp, targetRoute)` instead of navigating after fetch
- [ ] On destination pages: read data synchronously from state (Redux/context/Zustand/etc.)
- [ ] On destination pages: add redirect guard for direct URL access — `if (!data) return <Navigate to="/" replace />`
- [ ] If using Redux: create a `clearSelectedItem`-style action and dispatch on back navigation
- [ ] Test: click navigation, back navigation, rapid double-clicks, and direct URL access
