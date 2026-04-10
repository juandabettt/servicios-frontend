# Tarea: Corregir flujo de onboarding y creación de propiedades

## Contexto del proyecto
Frontend React + Vite desplegado en Vercel, conectado a backend Spring Boot 
en Railway. El problema raíz de múltiples errores 403 en el Dashboard es que 
el usuario no tiene propiedades creadas y no hay forma fácil de crearlas.

## Problemas a resolver en este prompt

### PROBLEMA 1 — Después del registro no se crea una propiedad
Cuando un usuario se registra exitosamente, el sistema lo lleva directo al 
Dashboard sin guiarlo a crear su primera propiedad. Sin propiedad, todas las 
queries del Dashboard fallan con 403.

### PROBLEMA 2 — "Mis propiedades" en Perfil no hace nada
En `src/pages/Profile.jsx` la opción "Mis propiedades" tiene `action: () => {}`
— función vacía. Necesita navegar a una página funcional.

### PROBLEMA 3 — No existe página de gestión de propiedades
No hay ninguna página donde el usuario pueda ver, crear o editar sus 
propiedades.

## Cambios requeridos

### CAMBIO 1 — Crear página `src/pages/Properties.jsx`

Crear una página completa de gestión de propiedades con:

**Vista de lista:**
- Mostrar todas las propiedades del usuario con `useQuery(['properties'])`
- Para cada propiedad mostrar: nombre, dirección, ciudad, badge si es principal
- Botón "Nueva propiedad" que abre un formulario inline o modal
- Si no hay propiedades mostrar estado vacío con mensaje motivacional y botón 
  para crear la primera

**Formulario de crear/editar propiedad** (usando React Hook Form + Zod):
```javascript
// Schema de validación
const propertySchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').max(100),
  direccion: z.string().max(255).optional(),
  ciudad: z.string().max(100).optional(),
  esPrincipal: z.boolean().default(false),
});
```

Campos del formulario:
- Nombre (requerido) — placeholder "Casa principal"
- Dirección (opcional) — placeholder "Calle 10 # 5-20"
- Ciudad (opcional) — placeholder "Pasto"
- Toggle "¿Es tu propiedad principal?"

Al guardar:
- Llamar `propertiesApi.create(data)`
- Invalidar query `['properties']`
- Mostrar toast "Propiedad guardada"
- Cerrar formulario

Al eliminar:
- Mostrar `ConfirmModal` antes de eliminar
- Llamar `propertiesApi.delete(id)`
- Mostrar toast "Propiedad eliminada"

Usar el mismo design system del proyecto (colores teal/primary, 
rounded-full en botones, surface-container-lowest para cards, 
mismos patrones visuales que `AutoPay.jsx`).

### CAMBIO 2 — Modificar `src/router/index.jsx`

Agregar la ruta de propiedades dentro de las rutas protegidas con AppShell:

```javascript
// Agregar import
const Properties = lazy(() => import('../pages/Properties'));

// Agregar dentro del array de rutas protegidas con AppShell
{ 
  path: '/properties', 
  element: <Suspense fallback={<LoadingSpinner />}><Properties /></Suspense> 
}
```

### CAMBIO 3 — Modificar `src/pages/Profile.jsx`

Cambiar la opción "Mis propiedades" para que navegue a `/properties`:

```javascript
// Cambiar esto:
{ icon: 'home', label: 'Mis propiedades', action: () => {} },

// Por esto:
{ icon: 'home', label: 'Mis propiedades', action: () => navigate('/properties') },
```

### CAMBIO 4 — Modificar `src/hooks/useAuth.js`

Después de un registro exitoso, antes de navegar al dashboard, verificar si 
el usuario tiene propiedades. Si no tiene ninguna, navegar a `/properties` 
en lugar de `/dashboard`:

```javascript
export function useRegister() {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => authApi.register(formData),
    onSuccess: async ({ data }) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user || data.usuario || { 
        nombre: data.nombre, 
        email: data.email 
      });
      
      // Nuevo usuario nunca tiene propiedades, ir directo a crearla
      toast.success('¡Cuenta creada! Primero crea tu propiedad.');
      navigate('/properties');
    },
  });
}
```

### CAMBIO 5 — Modificar `src/pages/Dashboard.jsx`

Agregar manejo del caso donde el usuario no tiene propiedades. 
Si `propertiesData` está vacío, mostrar un banner en lugar de errores:

```javascript
// Después de obtener propertiesData, agregar esta verificación:
const hasProperties = propertiesData && 
  (Array.isArray(propertiesData) ? propertiesData.length > 0 : 
  propertiesData?.content?.length > 0);

// Si no tiene propiedades, mostrar banner en lugar de queries que fallan:
// Agregar este bloque ANTES de la sección "Próximos vencimientos":
{!hasProperties && !loadingProperties && (
  <div className="bg-primary/5 border-2 border-dashed border-primary/20 
                  rounded-3xl p-8 flex flex-col md:flex-row items-center 
                  justify-between gap-6">
    <div>
      <h3 className="text-xl font-bold text-on-surface">
        Configura tu primera propiedad
      </h3>
      <p className="text-on-surface-variant mt-2">
        Para comenzar a gestionar tus facturas necesitas registrar 
        al menos una propiedad o inmueble.
      </p>
    </div>
    <button
      onClick={() => navigate('/properties')}
      className="px-8 py-4 bg-primary text-on-primary font-bold 
                 rounded-full hover:opacity-90 active:scale-95 
                 transition-all whitespace-nowrap flex items-center gap-2"
    >
      <span className="material-symbols-outlined">add_home</span>
      Agregar propiedad
    </button>
  </div>
)}
```

También asegurarse de que las queries de invoices y AI solo se ejecuten 
cuando hay propiedades disponibles agregando `enabled: hasProperties` 
a cada useQuery que dependa de propiedades.

## Archivos a modificar
1. CREAR `src/pages/Properties.jsx` (archivo nuevo)
2. MODIFICAR `src/router/index.jsx` (agregar ruta)
3. MODIFICAR `src/pages/Profile.jsx` (arreglar navegación)
4. MODIFICAR `src/hooks/useAuth.js` (redirigir tras registro)
5. MODIFICAR `src/pages/Dashboard.jsx` (manejar sin propiedades)

## Instrucciones importantes
- NO ejecutes git add, git commit, git push ni ningún comando de git
- NO modifiques ningún otro archivo fuera de los listados
- Mantén el mismo design system: colores primary/teal, rounded-full en 
  botones, mismas clases Tailwind del resto del proyecto
- Después de cada archivo modificado confirma qué cambió
- Si algún import ya existe no lo dupliques

## Verificación final esperada
Al terminar, el flujo debe ser:
1. Usuario nuevo se registra → va a /properties → crea su primera propiedad 
   → va al Dashboard → no hay errores 403
2. Usuario existente sin propiedades → Dashboard muestra banner para crear 
   propiedad → al crearlo todo funciona
3. Perfil → Mis propiedades → navega a /properties correctamente