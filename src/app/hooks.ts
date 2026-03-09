import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/** Pre-typed dispatch hook — avoids casting throughout the app. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Pre-typed selector hook — avoids casting throughout the app. */
export const useAppSelector = useSelector.withTypes<RootState>();
