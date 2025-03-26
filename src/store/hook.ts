import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from './index';

// Hook sử dụng dispatch với kiểu dữ liệu chính xác
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook lấy dữ liệu từ Redux Store với kiểu dữ liệu chính xác
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
