import axios from 'axios';

import { keycloak } from './keycloak';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

axiosInstance.interceptors.request.use(async config => {
  if (!keycloak.authenticated) {
    await keycloak.init({ onLoad: 'login-required' });
  }

  const token = keycloak.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
