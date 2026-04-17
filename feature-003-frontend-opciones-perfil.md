# FEATURE-003 FRONTEND: Habilitar opciones de Perfil

## Contexto
En `src/pages/Profile.jsx` existen 7 opciones en el menú de perfil. Solo funcionan "Mis propiedades", "Autopago" y "Notificaciones". Las siguientes 4 opciones no hacen nada al tocarse:

- Datos personales
- Métodos de pago
- Seguridad
- Ayuda y soporte

## Lo que necesitas hacer

### 1. Datos personales

Crea `src/pages/profile/DatosPersonales.jsx` con un formulario que permita al usuario ver y editar su información:

- Nombre completo
- Correo electrónico (solo lectura)
- Teléfono (máximo 10 dígitos)
- Ciudad
- Documento de identidad

El formulario debe tener un botón "Guardar cambios" que llame a:
```javascript
apiClient.put('/users/profile', { nombre, telefono, ciudad, documento })
```

Si el endpoint no existe aún, muestra el formulario con los datos actuales del usuario desde el store de Zustand (`useAuth` o `Wn`) y deja el botón preparado pero con un toast que diga "Función disponible próximamente".

Agrega la ruta en el router:
```javascript
{ path: '/profile/datos-personales', element: <DatosPersonales /> }
```

### 2. Métodos de pago

Crea `src/pages/profile/MetodosPago.jsx` que muestre:

- Lista de métodos de pago guardados (tarjetas, PSE, Nequi)
- Botón "Agregar método de pago"
- Si no hay métodos guardados, mostrar estado vacío con mensaje "No tienes métodos de pago guardados aún"

Por ahora el listado puede estar vacío con el estado vacío. El botón "Agregar" puede mostrar un toast "Función disponible próximamente".

Agrega la ruta:
```javascript
{ path: '/profile/metodos-pago', element: <MetodosPago /> }
```

### 3. Seguridad

Crea `src/pages/profile/Seguridad.jsx` con las siguientes opciones:

- **Cambiar contraseña**: formulario con campos "Contraseña actual", "Nueva contraseña", "Confirmar nueva contraseña". Al guardar llama a `apiClient.post('/auth/change-password', { currentPassword, newPassword })`. Si el endpoint no existe, muestra toast "Función disponible próximamente".
- **Cerrar sesión en todos los dispositivos**: botón que llama a `apiClient.post('/auth/logout-all')` y luego hace logout local.

Agrega la ruta:
```javascript
{ path: '/profile/seguridad', element: <Seguridad /> }
```

### 4. Ayuda y soporte

Crea `src/pages/profile/AyudaSoporte.jsx` con:

- Sección "Preguntas frecuentes" con 3-4 preguntas básicas en acordeón:
    - ¿Cómo subir una factura?
    - ¿Cómo funciona el autopago?
    - ¿Cómo cambiar mi contraseña?
    - ¿Cómo eliminar una factura?
- Sección "Contacto" con un email de soporte: soporte@serviciosya.com
- Sección "Versión de la app": v1.0.0

Agrega la ruta:
```javascript
{ path: '/profile/ayuda', element: <AyudaSoporte /> }
```

### 5. Conectar opciones en Profile.jsx

En `src/pages/Profile.jsx`, conecta cada opción con su ruta usando `useNavigate`:

```javascript
const navigate = useNavigate()

// En cada opción:
{ label: 'Datos personales', icon: 'person', onClick: () => navigate('/profile/datos-personales') }
{ label: 'Métodos de pago', icon: 'credit_card', onClick: () => navigate('/profile/metodos-pago') }
{ label: 'Seguridad', icon: 'lock', onClick: () => navigate('/profile/seguridad') }
{ label: 'Ayuda y soporte', icon: 'help', onClick: () => navigate('/profile/ayuda') }
```

### 6. Agregar rutas al router principal

En `src/router/index.jsx`, agrega las 4 nuevas rutas dentro del grupo protegido (donde están las demás rutas del layout):

```javascript
{ path: '/profile/datos-personales', element: <Suspense fallback={<Spinner />}><DatosPersonales /></Suspense> }
{ path: '/profile/metodos-pago', element: <Suspense fallback={<Spinner />}><MetodosPago /></Suspense> }
{ path: '/profile/seguridad', element: <Suspense fallback={<Spinner />}><Seguridad /></Suspense> }
{ path: '/profile/ayuda', element: <Suspense fallback={<Spinner />}><AyudaSoporte /></Suspense> }
```

## Estilo y UX
- Cada página debe tener un botón "← Volver" que navega a `/profile`
- Usar el mismo estilo visual que las demás páginas del proyecto (clases Tailwind existentes)
- En mobile debe verse bien con el navbar inferior

## Archivos a crear
- `src/pages/profile/DatosPersonales.jsx`
- `src/pages/profile/MetodosPago.jsx`
- `src/pages/profile/Seguridad.jsx`
- `src/pages/profile/AyudaSoporte.jsx`

## Archivos a modificar
- `src/pages/Profile.jsx` — conectar navegación a las 4 opciones
- `src/router/index.jsx` — agregar las 4 nuevas rutas

## NO modificar
- Opciones que ya funcionan: Mis propiedades, Autopago, Notificaciones
- Lógica de autenticación
- Componentes de facturas o pagos
