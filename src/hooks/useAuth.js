import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: ({ data }) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user || data.usuario);
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (formData) => authApi.register(formData),
    onSuccess: ({ data }) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user || data.usuario || {
        nombre: data.nombre,
        email: data.email,
      });
      toast.success('¡Cuenta creada! Primero crea tu propiedad.');
      navigate('/properties');
    },
  });
}
