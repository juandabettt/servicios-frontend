import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const ERROR_MESSAGES = {
  400: 'Los datos enviados no son válidos.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso no fue encontrado.',
  409: 'Ya existe un registro con estos datos.',
  422: 'Los datos enviados tienen errores de validación.',
  429: 'Demasiados intentos. Espera un momento.',
  500: 'Error del servidor. Por favor intenta más tarde.',
};

// Interceptor REQUEST: inject JWT
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor RESPONSE: handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    if (status && status !== 401 && !originalRequest._noToast) {
      const message = ERROR_MESSAGES[status] || 'Ocurrió un error inesperado.';
      toast.error(message);
    }

    if (!error.response && !navigator.onLine) {
      toast.error('Sin conexión. Verifica tu internet.');
    }

    return Promise.reject(error);
  }
);
