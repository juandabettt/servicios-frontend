import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const login = useLogin();

  const onSubmit = (data) => {
    login.mutate(data);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 right-0 -z-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <h1 className="text-3xl font-black text-primary brand-font">ServiciosYa</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Digital Concierge</p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/20">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Ingresar</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Correo electrónico</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder="tu@correo.com"
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Contraseña</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>

            {login.error?.response?.status === 401 && (
              <p className="text-sm text-error bg-error-container/30 px-4 py-3 rounded-xl">
                Correo o contraseña incorrectos.
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all mt-2 disabled:opacity-60"
            >
              {login.isPending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
