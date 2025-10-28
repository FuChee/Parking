// src/store.js
import { configureStore } from '@reduxjs/toolkit';

import { profileApi } from './profile/profileApi';
import { loginApi } from './profile/loginApi';
import { parkingApi } from './features/parkingApi';

export const store = configureStore({
  reducer: {
    [profileApi.reducerPath]: profileApi.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
    [parkingApi.reducerPath]: parkingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      profileApi.middleware,
      loginApi.middleware,
      parkingApi.middleware 
    ),
});