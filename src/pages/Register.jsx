import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';

const schema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Correo inválido'),
  telefono: z.string().regex(/^\d{10}$/, 'Debe tener 10 dígitos'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

function passwordStrength(password = '') {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-3
}

const STRENGTH_CONFIG = [
  { label: 'Débil', color: 'bg-error', width: 'w-1/3' },
  { label: 'Media', color: 'bg-secondary', width: 'w-2/3' },
  { label: 'Fuerte', color: 'bg-tertiary', width: 'w-full' },
];

export default function Register() {
  const { register, handleSubmit, control, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const registerMutation = useRegister();
  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const strength = passwordStrength(password);

  const onSubmit = ({ confirmPassword, ...data }) => {
    registerMutation.mutate({ ...data, telefono: `+57${data.telefono}` });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 right-0 -z-10 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <h1 className="text-3xl font-black text-primary brand-font">ServiciosYa</h1>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/20">
          <h2 className="text-2xl font-bold text-on-surface mb-6">Crear cuenta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Nombre completo</label>
              <input
                {...register('nombre')}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="Carlos Muñoz"
              />
              {errors.nombre && <p className="mt-1 text-xs text-error">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Correo electrónico</label>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="tu@correo.com"
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Teléfono</label>
              <div className="flex">
                <span className="bg-surface-container-high border border-r-0 border-outline-variant rounded-l-xl px-3 flex items-center text-sm font-medium text-on-surface-variant">
                  +57
                </span>
                <input
                  {...register('telefono')}
                  type="tel"
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded-r-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="3001234567"
                />
              </div>
              {errors.telefono && <p className="mt-1 text-xs text-error">{errors.telefono.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Contraseña</label>
              <input
                {...register('password')}
                type="password"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="••••••••"
              />
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${STRENGTH_CONFIG[strength - 1]?.color || 'bg-error'} ${STRENGTH_CONFIG[strength - 1]?.width || 'w-1/3'}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${['text-error', 'text-secondary', 'text-tertiary'][strength - 1] || 'text-error'}`}>
                    {STRENGTH_CONFIG[strength - 1]?.label || 'Débil'}
                  </p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Confirmar contraseña</label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>}
            </div>

            {registerMutation.error && (
              <p className="text-sm text-error bg-error-container/30 px-4 py-3 rounded-xl">
                {registerMutation.error.response?.data?.message || 'Error al crear la cuenta.'}
              </p>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all mt-2 disabled:opacity-60"
            >
              {registerMutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
