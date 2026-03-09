import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AnimatedOutlet from './components/AnimatedOutlet';
import ItemsListPage from './pages/ItemsListPage';
import ItemDetailPage from './pages/ItemDetailPage';

/**
 * App root — sets up the React Router with an animated layout wrapper.
 *
 * The layout route renders `AnimatedOutlet` which wraps child routes
 * in Framer Motion's `AnimatePresence` for slide transitions.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AnimatedOutlet />}>
          <Route path="/" element={<ItemsListPage />} />
          <Route path="/details" element={<ItemDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
