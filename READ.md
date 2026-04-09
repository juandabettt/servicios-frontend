
## Migración y Conexión Frontend: Stitch HTML → React + Backend Spring Boot

---

## TU ROL

Eres el Tech Lead frontend de este proyecto. Tu trabajo es tomar 4 archivos HTML estáticos
generados por Stitch (el diseño ya está hecho y es excelente — NO lo cambies) y convertirlos
en una aplicación React completamente funcional, conectada al backend Spring Boot 3 que ya
existe en `http://localhost:8080`.

**Regla de oro:** El resultado visual debe ser IDÉNTICO al diseño de Stitch. Tu trabajo
es agregar vida (estado, navegación, datos reales), no rediseñar.

---

## ARCHIVOS DE STITCH DISPONIBLES

Tienes 4 archivos HTML en la carpeta `/stitch-designs/` (o donde los ubiques):

| Archivo | Pantalla |
|---|---|
| `onboarding.html` | Slide 3/3 del onboarding |
| `dashboard.html` | Dashboard principal |
| `ai-analysis.html` | Análisis IA e insights |
| `invoices.html` | Lista de facturas |

**Analiza cada archivo antes de empezar.** Extrae de ellos:
- La paleta de colores exacta del `tailwind.config` embebido
- Las clases Tailwind usadas en cada componente
- La estructura HTML de cada sección
- Los íconos de Material Symbols utilizados

---

## STACK TECNOLÓGICO A USAR

```
React 18 + Vite
React Router DOM v6          (navegación SPA)
TanStack Query v5            (fetching, caché, polling)
Axios                        (cliente HTTP)
Zustand                      (estado global: auth + user)
Tailwind CSS v3              (mismo config que Stitch)
Material Symbols Outlined    (mismos íconos que Stitch)
React Hook Form + Zod        (formularios con validación)
React Hot Toast              (toasts de feedback)
```

---

## PASO 1 — SCAFFOLDING DEL PROYECTO

Crear el proyecto desde cero:

```bash
npm create vite@latest servicios-ya-frontend -- --template react
cd servicios-ya-frontend
npm install react-router-dom @tanstack/react-query axios zustand
npm install react-hook-form @hookform/resolvers zod
npm install react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1.1 `tailwind.config.js`

Copiar EXACTAMENTE la configuración de colores, borderRadius y fontFamily del bloque
`<script id="tailwind-config">` que aparece en todos los archivos de Stitch. Es la misma
en los 4 archivos. Agregar además:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // --- PEGAR AQUÍ EL OBJETO theme.extend DE STITCH ---
      // colors: { "inverse-surface": "#2e3132", "primary": "#005344", ... }
      // borderRadius: { ... }
      // fontFamily: { headline: ["Plus Jakarta Sans"], body: ["Inter"], label: ["Inter"] }
    },
  },
  plugins: [],
}
```

### 1.2 `index.html`

Agregar en el `<head>` los mismos links que usa Stitch:

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### 1.3 `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

body {
  font-family: 'Inter', sans-serif;
}

h1, h2, h3, .brand-font {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Ocultar scrollbar en chips de filtros (igual que Stitch) */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## PASO 2 — ESTRUCTURA DE CARPETAS

```
src/
├── api/
│   ├── client.js            ← instancia Axios con interceptores
│   ├── auth.api.js
│   ├── invoices.api.js
│   ├── payments.api.js
│   ├── ai.api.js
│   ├── properties.api.js
│   ├── notifications.api.js
│   ├── autopay.api.js
│   └── preferences.api.js
├── store/
│   └── auth.store.js        ← Zustand: tokens + usuario
├── hooks/
│   ├── useAuth.js
│   ├── useInvoices.js
│   ├── usePayments.js
│   ├── useAiInsights.js
│   └── usePolling.js        ← polling genérico reutilizable
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx      ← extraído de Stitch
│   │   ├── BottomNav.jsx    ← extraído de Stitch
│   │   ├── TopBar.jsx       ← extraído de Stitch
│   │   └── AppShell.jsx     ← wrapper que combina los 3
│   ├── ui/
│   │   ├── Icon.jsx         ← wrapper de Material Symbols
│   │   ├── StatusBadge.jsx  ← chips de estado (PENDIENTE, PAGADA, etc.)
│   │   ├── InvoiceCard.jsx  ← card de factura (dashboard + lista)
│   │   ├── InsightCard.jsx  ← card de insight IA
│   │   ├── SkeletonCard.jsx ← skeleton de carga
│   │   ├── Toast.jsx        ← configuración de react-hot-toast
│   │   └── ConfirmModal.jsx ← modal de confirmación
│   └── forms/
│       ├── LoginForm.jsx
│       ├── RegisterForm.jsx
│       └── PaymentForm.jsx
├── pages/
│   ├── Onboarding.jsx       ← desde onboarding.html
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx        ← desde dashboard.html
│   ├── Invoices.jsx         ← desde invoices.html
│   ├── InvoiceDetail.jsx
│   ├── InvoiceUpload.jsx    ← flujo 3 pasos
│   ├── AiInsights.jsx       ← desde ai-analysis.html
│   ├── Payments.jsx
│   ├── PaymentResult.jsx
│   ├── Notifications.jsx
│   ├── AutoPay.jsx
│   └── Profile.jsx
├── router/
│   └── index.jsx            ← React Router con rutas protegidas
├── utils/
│   ├── currency.js          ← formatCOP(amount)
│   ├── dates.js             ← formatDate, daysUntil
│   └── idempotency.js       ← generateIdempotencyKey()
└── main.jsx
```

---

## PASO 3 — CAPA API Y AUTENTICACIÓN

### 3.1 `src/api/client.js` — Axios con interceptores JWT

```javascript
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de REQUEST: inyectar token en cada petición
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de RESPONSE: manejar 401 y renovar token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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
      }
    }
    return Promise.reject(error);
  }
);
```

### 3.2 `src/store/auth.store.js` — Zustand

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,   // en memoria + sessionStorage (NO localStorage)
      refreshToken: null,  // en localStorage via persist
      user: null,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      isAuthenticated: () => !!useAuthStore.getState().accessToken,
    }),
    {
      name: 'servicios-ya-auth',
      // Solo persistir refreshToken y user, NO el accessToken
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

### 3.3 Archivos de API (uno por dominio)

**`src/api/auth.api.js`**
```javascript
import { apiClient } from './client';

export const authApi = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data) =>
    apiClient.post('/auth/register', data),
  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  logout: () =>
    apiClient.post('/auth/logout'),
};
```

**`src/api/invoices.api.js`**
```javascript
import { apiClient } from './client';

export const invoicesApi = {
  // Upload: multipart/form-data — responde 202
  upload: (file, propertyId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('propertyId', propertyId);
    return apiClient.post('/invoices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Polling del estado de una factura
  getById: (id) => apiClient.get(`/invoices/${id}`),
  // Lista paginada con filtros
  getAll: (params) => apiClient.get('/invoices', { params }),
  // Corregir datos del OCR
  correct: (id, data) => apiClient.put(`/invoices/${id}/correct`, data),
};
```

**`src/api/payments.api.js`**
```javascript
import { apiClient } from './client';
import { generateIdempotencyKey } from '../utils/idempotency';

export const paymentsApi = {
  process: (invoiceId, metodoPago, extraData = {}) =>
    apiClient.post('/payments/process', {
      invoiceId,
      metodoPago,
      idempotencyKey: generateIdempotencyKey(),
      ...extraData,
    }),
  getStatus: (transactionId) =>
    apiClient.get(`/payments/${transactionId}/status`),
  getHistory: (params) =>
    apiClient.get('/payments/history', { params }),
};
```

**`src/api/ai.api.js`**
```javascript
import { apiClient } from './client';

export const aiApi = {
  triggerAnalysis: (propertyId) =>
    apiClient.post('/ai-insights/analyze', { propertyId }),
  getRecommendations: (params) =>
    apiClient.get('/ai-insights/recommendations', { params }),
  getPredictions: (propertyId, serviceType) =>
    apiClient.get('/ai-insights/predictions', { params: { propertyId, serviceType } }),
  getBenchmark: (propertyId, serviceType) =>
    apiClient.get('/ai-insights/benchmark', { params: { propertyId, serviceType } }),
  submitFeedback: (analysisId, calificacion) =>
    apiClient.post(`/ai-insights/${analysisId}/feedback`, { calificacion }),
};
```

**`src/utils/idempotency.js`**
```javascript
export const generateIdempotencyKey = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
```

**`src/utils/currency.js`**
```javascript
export const formatCOP = (amount) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
// Resultado: $196.600
```

---

## PASO 4 — COMPONENTES DE LAYOUT (extraídos de Stitch)

### 4.1 `src/components/layout/Sidebar.jsx`

Extraer el `<aside>` de `dashboard.html`. Es idéntico en los 3 archivos con solo el
ítem activo diferente. Recibe `activePage` como prop:

```jsx
// Props: activePage = 'dashboard' | 'invoices' | 'payments' | 'ai' | 'profile'
// Usar useNavigate() de React Router para los links
// El ítem activo tiene: bg-teal-50, text-teal-900, font-bold, translate-x-1
// Los inactivos: text-gray-600, hover:bg-gray-200
```

### 4.2 `src/components/layout/BottomNav.jsx`

Extraer el `<nav class="md:hidden fixed bottom-0...">` de Stitch. Mismo comportamiento
de active/inactive. Usar `useLocation()` de React Router para detectar la ruta activa.

### 4.3 `src/components/layout/AppShell.jsx`

Wrapper que renderiza Sidebar + TopBar + BottomNav + `<main>` con el contenido:

```jsx
// Solo mostrar AppShell en rutas autenticadas
// En rutas /login, /register, /onboarding → NO mostrar el shell
// En rutas autenticadas → envolver con AppShell
```

### 4.4 `src/components/ui/Icon.jsx`

Wrapper simple para Material Symbols (igual que Stitch):

```jsx
// Uso: <Icon name="water_drop" filled />
// filled=true → font-variation-settings: 'FILL' 1
```

### 4.5 `src/components/ui/StatusBadge.jsx`

Chip de estado extraído de Stitch:

```jsx
// PENDIENTE  → bg-blue-100  text-blue-700
// PAGADA     → bg-green-100 text-green-700
// VENCIDA    → bg-red-100   text-red-700
// PROCESANDO → bg-gray-100  text-gray-600 + animación shimmer
// ERROR_OCR  → bg-orange-100 text-orange-700
```

### 4.6 `src/components/ui/SkeletonCard.jsx`

Skeleton con animación shimmer para el estado de carga de las listas:

```jsx
// Misma forma que InvoiceCard pero con bg-surface-container-high y animate-pulse
// Renderizar 4 skeletons mientras se carga la lista
```

---

## PASO 5 — PÁGINAS (conversión de Stitch HTML a React)

### 5.1 Onboarding (`/`)

Convertir `onboarding.html` en React. Agregar:
- Estado local `currentSlide` (0, 1, 2)
- Los slides 1 y 2 los debes crear con el mismo estilo visual que el slide 3 ya diseñado
- Slide 1: ícono `receipt_long`, texto "Todas tus facturas en un solo lugar"
- Slide 2: ícono `account_balance_wallet`, texto "Paga con Nequi, PSE o tarjeta"
- Slide 3: el diseño ya está en el HTML de Stitch (IA y ahorro)
- Botón "Comenzar" → navega a `/register`
- Botón "Ya tengo cuenta" → navega a `/login`
- Si el usuario ya está autenticado → redirigir a `/dashboard`

### 5.2 Login (`/login`) y Register (`/register`)

NO hay diseño de Stitch para estas — crearlas con el mismo design system (mismos colores,
tipografías, border-radius que el resto de la app). Usar React Hook Form + Zod:

**Login:**
- Logo ServiciosYa centrado
- Input email + contraseña
- Botón "Ingresar" (llama a `authApi.login()`)
- Al éxito: guardar tokens en Zustand → redirigir a `/dashboard`
- Al error 401: mostrar "Correo o contraseña incorrectos" bajo el formulario (no toast)

**Register:**
- Campos: nombre, email, teléfono (+57 prefijado), contraseña, confirmar contraseña
- Indicador de fortaleza de contraseña (barra con 3 niveles: débil/media/fuerte)
- Zod schema: email válido, contraseñas iguales, teléfono 10 dígitos

### 5.3 Dashboard (`/dashboard`)

Convertir `dashboard.html`. Datos reales de la API:

```jsx
// 1. Cargar propiedades del usuario con useQuery(['properties'])
// 2. Cargar facturas pendientes con useQuery(['invoices', { estado: 'PENDIENTE' }])
// 3. Calcular totalAPagar sumando monto_total de facturas pendientes
// 4. El card de resumen muestra datos reales (no hardcodeados)
// 5. Las 4 cards de "Próximos vencimientos" son las 4 facturas más próximas a vencer
// 6. La sección "AI Insights" muestra el último análisis de useQuery(['ai-insights'])
// 7. Mientras carga: renderizar SkeletonCard en lugar de las cards de facturas
// 8. El botón "Pagar todo" → navega a /payments con todas las facturas pendientes
```

**Función de urgencia de vencimiento** (para los badges de colores):
```javascript
// daysUntil(fechaVencimiento):
// > 7 días  → bg-surface-container-high text-on-surface-variant (gris)
// 3-7 días  → bg-secondary-fixed text-on-secondary-fixed-variant (naranja)
// < 3 días  → bg-error-container text-on-error-container (rojo)
// Vencida   → bg-error text-on-error (rojo sólido)
```

### 5.4 Lista de Facturas (`/invoices`)

Convertir `invoices.html`. Funcionalidad completa:

```jsx
// Estado local: filtroActivo = 'TODAS' | 'PENDIENTE' | 'PAGADA' | 'VENCIDA'
// useQuery con TanStack Query:
//   queryKey: ['invoices', filtroActivo, pagina]
//   queryFn: invoicesApi.getAll({ estado: filtroActivo !== 'TODAS' ? filtroActivo : undefined, page: pagina, size: 10 })
// Paginación: botón "Cargar más" al final (infinite scroll opcional)
// FAB "+" → navega a /invoices/upload
// Al tocar una card → navega a /invoices/:id
// Mientras carga → mostrar 4 SkeletonCard
// Estado vacío: el diseño de Stitch ya lo tiene (ícono receipt_long + texto)
```

### 5.5 Subir Factura (`/invoices/upload`) ← PANTALLA NUEVA

Esta pantalla NO está en Stitch, créala con el mismo design system. Es el flujo más
importante del producto. 3 pasos:

**Paso 1 — Captura:**
```jsx
// Área de drop zone con borde punteado animado (CSS keyframes, mismo estilo que Stitch)
// Botón "Tomar foto" → <input type="file" accept="image/*" capture="environment">
// Botón "Subir desde galería" → <input type="file" accept="image/jpeg,image/png,image/webp">
// Preview de imagen seleccionada con botón "Cambiar foto"
// Validación client-side: solo JPEG/PNG/WEBP, máximo 10MB
// Barra de progreso de pasos (1/3) — misma tipografía y colores que Stitch
```

**Paso 2 — Procesamiento OCR:**
```jsx
// Al avanzar desde paso 1:
//   1. Llamar invoicesApi.upload(file, propertyId) → responde 202 con { invoiceId }
//   2. Iniciar polling: usePolling(invoiceId) → llama invoicesApi.getById(id) cada 3s
//   3. Mientras estado === 'PROCESANDO_OCR': mostrar animación de carga
//      (líneas que se iluminan sobre ícono de factura — usar CSS keyframes)
//      Texto: "Estamos leyendo tu factura..." subtexto "Tarda unos segundos"
//   4. Timeout: si después de 60s sigue procesando → mostrar error con opción de ingreso manual
//   5. Cuando estado !== 'PROCESANDO_OCR': pasar al formulario de verificación

// Formulario de verificación (datos extraídos por el OCR):
// - Proveedor (select con lista de proveedores → GET /providers)
// - Período facturado (text input)
// - Fecha de vencimiento (date input)
// - Monto total (number input, formateo automático COP)
// - Consumo + unidad (number + select: kWh / m³ / GB)
// - Chip de confianza: si ocr_confianza >= 85 → "Alta confianza ✓" (verde primario)
//                      si ocr_confianza < 85 → "Verifica estos datos ⚠" (secondary/naranja)
// El usuario puede editar cualquier campo → al guardar llama invoicesApi.correct(id, data)
```

**Paso 3 — Confirmación:**
```jsx
// Resumen de todos los datos de la factura
// Toggle "¿Pagar ahora?" → si activo, mostrar selector de método de pago inline
// Botón "Guardar factura" → navega a /invoices
// Botón "Guardar y pagar" → navega a /payments/:invoiceId
// Animación de éxito: check verde animado (CSS keyframes) + toast "¡Factura guardada!"
```

**`src/hooks/usePolling.js`** — Hook reutilizable para polling:
```javascript
// usePolling({ queryFn, intervalMs, stopCondition, timeoutMs })
// Llama queryFn cada intervalMs milisegundos
// Para cuando stopCondition(data) === true
// Para y lanza error cuando pasa timeoutMs
// Retorna { data, isLoading, isTimeout, error }
```

### 5.6 Análisis IA (`/ai`)

Convertir `ai-analysis.html`. Datos reales:

```jsx
// useQuery(['ai-insights/recommendations']) → lista de AiAnalysis
// useQuery(['ai-insights/predictions']) → predicción próxima factura
// useQuery(['ai-insights/benchmark']) → comparativa vs vecinos

// Botón "Ver Plan de Ahorro" → llama aiApi.triggerAnalysis(propertyId)
//   Responde 202 → mostrar estado "Analizando..." con spinner
//   Polling cada 5s a getRecommendations hasta que aparezca análisis nuevo
//   Al terminar: invalidar query y re-renderizar con datos frescos

// Gráfica de barras del histórico:
//   Los datos vienen de las facturas reales (agrupar por mes y tipo de servicio)
//   Calcular altura de cada barra como porcentaje del máximo del período
//   Tabs Energía/Agua/Gas → filtran las facturas del tipo correspondiente

// Botones 👍/👎 en cada insight:
//   llaman aiApi.submitFeedback(analysisId, calificacion)
//   Al hacer clic: desactivar botón + toast "¡Gracias por tu feedback!"

// El selector de propiedad (strip de chips arriba):
//   carga useQuery(['properties'])
//   al cambiar propiedad → invalida todas las queries de AI
```

### 5.7 Detalle de Factura (`/invoices/:id`)

```jsx
// useQuery(['invoice', id]) → invoicesApi.getById(id)
// Mostrar url_foto_factura en <img> si existe (es URL pre-firmada del backend)
// Timeline de estados (misma paleta de colores de Stitch)
// Botón "Pagar ahora" si estado === 'PENDIENTE' → navega a /payments/:id
// Botón "Ver comprobante" si estado === 'PAGADA'
```

### 5.8 Pago (`/payments/:invoiceId`)

```jsx
// Estado local: metodoPago = null | 'NEQUI' | 'PSE' | 'TARJETA_CREDITO'
// Al seleccionar NEQUI: mostrar input de número celular
// Al seleccionar PSE: mostrar dropdown de bancos colombianos
//   (lista hardcodeada de los principales: Bancolombia, Davivienda, BBVA, etc.)
// Al seleccionar TARJETA: mostrar campos número/fecha/CVV con formato automático

// Al confirmar:
//   1. Llamar paymentsApi.process(invoiceId, metodoPago, extraData)
//   2. Si NEQUI/TARJETA: respuesta inmediata → navegar a /payments/result/:transactionId
//   3. Si PSE: abrir url_redireccion_pse en nueva pestaña →
//      mostrar pantalla "Esperando confirmación de tu banco..."
//      polling a getStatus cada 5s → cuando no sea PENDIENTE_PSE, navegar a result

// Mostrar resumen de la factura arriba (monto, proveedor, período)
```

### 5.9 Resultado de Pago (`/payments/result/:transactionId`)

```jsx
// useQuery(['payment', transactionId]) → paymentsApi.getStatus(id)
// APROBADA → check verde animado + "¡Pago exitoso!" + datos de transacción
// RECHAZADA → ícono error + mensaje amigable (no código técnico) + botones retry
// Botón "Ver comprobante" (si APROBADA) → genera un resumen en pantalla para captura de pantalla
// Botón "Ir al inicio" → navega a /dashboard
```

### 5.10 Notificaciones (`/notifications`)

```jsx
// useQuery(['notifications']) → notificationsApi.getAll()
// Agrupar por día: "Hoy", "Ayer", "Esta semana"
// Al tocar una notificación:
//   1. Llamar notificationsApi.markAsRead(id)
//   2. Navegar al recurso relacionado según tipo:
//      FACTURA_POR_VENCER → /invoices/:referenciaId
//      PAGO_CONFIRMADO → /payments/result/:referenciaId
//      ANALISIS_LISTO → /ai
// Íconos y colores por tipo (igual que la especificación del prompt de diseño)
```

---

## PASO 6 — ROUTING Y RUTAS PROTEGIDAS

### `src/router/index.jsx`

```jsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

// Rutas protegidas: si no autenticado → redirigir a /login
const ProtectedRoute = () => {
  const { accessToken } = useAuthStore();
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

// Rutas públicas: si ya autenticado → redirigir a /dashboard
const PublicRoute = () => {
  const { accessToken } = useAuthStore();
  return !accessToken ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export const router = createBrowserRouter([
  // Rutas públicas
  { element: <PublicRoute />, children: [
    { path: '/', element: <Onboarding /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
  ]},
  // Rutas protegidas (dentro del AppShell)
  { element: <ProtectedRoute />, children: [
    { element: <AppShell />, children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/invoices', element: <Invoices /> },
      { path: '/invoices/upload', element: <InvoiceUpload /> },
      { path: '/invoices/:id', element: <InvoiceDetail /> },
      { path: '/payments/:invoiceId', element: <Payments /> },
      { path: '/payments/result/:transactionId', element: <PaymentResult /> },
      { path: '/ai', element: <AiInsights /> },
      { path: '/notifications', element: <Notifications /> },
      { path: '/autopay', element: <AutoPay /> },
      { path: '/profile', element: <Profile /> },
    ]},
  ]},
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
```

---

## PASO 7 — MANEJO DE ESTADOS GLOBALES Y UX

### 7.1 TanStack Query — configuración global (`src/main.jsx`)

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutos
      refetchOnWindowFocus: false,
    },
  },
});

// En el render:
// <QueryClientProvider client={queryClient}>
//   <RouterProvider router={router} />
//   <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
// </QueryClientProvider>
```

### 7.2 Manejo de errores HTTP globales

En el interceptor de Axios, mapear códigos a mensajes en español:

```javascript
const ERROR_MESSAGES = {
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión expiró. Por favor inicia sesión de nuevo.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso no fue encontrado.',
  409: 'Ya existe un registro con estos datos.',
  422: 'Los datos enviados tienen errores de validación.',
  429: 'Demasiados intentos. Espera un momento.',
  500: 'Error del servidor. Por favor intenta más tarde.',
};
// Mostrar con react-hot-toast.error() para errores 4xx/5xx
// EXCEPTO 401 (que ya maneja el interceptor con redirect)
// EXCEPTO errores de formulario (que se muestran inline)
```

### 7.3 Skeleton screens

Mientras `isLoading === true` en cualquier lista, mostrar `<SkeletonCard />` en lugar
del contenido. Nunca mostrar un spinner girando sobre toda la pantalla — usar skeletons
con la misma forma que las cards reales de Stitch.

### 7.4 Toasts de feedback (react-hot-toast)

| Acción | Toast |
|---|---|
| Factura guardada | ✓ "Factura guardada correctamente" (success) |
| Pago exitoso | ✓ "¡Pago procesado!" (success) |
| Preferencias actualizadas | ✓ "Cambios guardados" (success) |
| Error de red | ✗ "Sin conexión. Verifica tu internet." (error) |
| Regla de autopago guardada | ✓ "Autopago configurado" (success) |

---

## PASO 8 — VARIABLE DE ENTORNO

Crear `.env` en la raíz del proyecto:

```
VITE_API_URL=http://localhost:8080/api/v1
```

Y `.env.example` para el equipo:
```
VITE_API_URL=http://localhost:8080/api/v1
```

Configurar en `vite.config.js` el proxy para desarrollo (evita problemas de CORS):

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

Con este proxy, el frontend llama a `/api/v1/...` y Vite redirige al backend. Cambiar
`VITE_API_URL` a `/api/v1` cuando el proxy esté activo.

---

## ORDEN DE IMPLEMENTACIÓN

Seguir este orden estrictamente — cada paso depende del anterior:

1. Scaffolding + Tailwind config (copiado de Stitch) + fuentes + variables de entorno
2. `api/client.js` + `store/auth.store.js` + todas las funciones de `api/*.js`
3. Componentes de layout: `Sidebar`, `BottomNav`, `TopBar`, `AppShell`, `Icon`, `StatusBadge`
4. Router con rutas protegidas y públicas
5. Páginas de autenticación: `Onboarding`, `Login`, `Register`
6. `Dashboard` (conversión directa de Stitch con datos reales)
7. `Invoices` (conversión directa de Stitch con datos reales)
8. `InvoiceUpload` (pantalla nueva — el flujo más complejo, con polling del OCR)
9. `AiInsights` (conversión directa de Stitch con datos reales + polling del análisis)
10. `Payments` + `PaymentResult`
11. Pantallas secundarias: `InvoiceDetail`, `Notifications`, `AutoPay`, `Profile`
12. Skeletons, toasts y estados de error en todas las páginas
13. Prueba del flujo completo E2E con el backend corriendo

---

## NOTAS CRÍTICAS

- **NO modificar los colores, tipografías ni border-radius de Stitch.** El diseño está
  aprobado. Solo agregar interactividad y datos reales.

- **Las imágenes de usuario** en Stitch usan URLs de Google (`lh3.googleusercontent.com`).
  Reemplazar con un componente `<Avatar>` que muestre las iniciales del nombre del usuario
  real en un círculo con `bg-primary-fixed text-on-primary-fixed-variant`.

- **El polling del OCR** es el flujo más delicado. Si el servidor devuelve 500 durante
  el upload, mostrar un mensaje específico: "No pudimos procesar tu imagen. Puedes
  ingresar los datos manualmente." y habilitar el formulario de ingreso manual.

- **Los montos siempre en COP** usando `formatCOP()` de utils. Nunca mostrar números
  sin formato (no `84500`, siempre `$84.500`).

- **La propiedad activa en la sidebar** se determina con `useLocation().pathname` de
  React Router — no con estado local.

- **No hay imágenes de facturas en desarrollo** (el backend de OCR es mock). Manejar
  el caso donde `url_foto_factura` es `null` mostrando un placeholder con ícono
  `receipt_long`.
