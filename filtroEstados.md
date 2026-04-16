# FEATURE-001 FRONTEND: Filtro de estados de facturas

## Contexto
El backend ahora devuelve el estado correcto de cada factura (PENDIENTE, PAGADA, VENCIDA) y soporta filtrar por estado mediante el parámetro `?estado=`. Se necesita implementar en el frontend los tabs/filtros para que el usuario pueda ver sus facturas clasificadas.

## Comportamiento esperado
- En la página `/invoices` deben existir 4 tabs o filtros: Todas, Pendientes, Pagadas, Vencidas
- Al seleccionar un tab, la lista se actualiza mostrando solo las facturas de ese estado
- Cada factura debe mostrar un badge visual con su estado (color verde = pagada, rojo = vencida, amarillo = pendiente)
- El tab activo debe mostrar el conteo de facturas de ese estado

## Lo que necesitas hacer

### 1. Actualizar la función de obtener facturas en la API

En `src/api/invoices.api.js`, actualiza la función que obtiene el listado para aceptar el parámetro de estado:

```javascript
export const getInvoices = (params = {}) => {
  const queryParams = new URLSearchParams()
  if (params.estado) queryParams.append('estado', params.estado)
  if (params.page !== undefined) queryParams.append('page', params.page)
  if (params.size !== undefined) queryParams.append('size', params.size)
  
  const query = queryParams.toString()
  return apiClient.get(`/invoices${query ? '?' + query : ''}`)
}
```

### 2. Crear componente de badge de estado

Crea el archivo `src/components/StatusBadge.jsx` si no existe, o actualízalo para incluir los estados de facturas:

```jsx
const estadoConfig = {
  PENDIENTE: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  PAGADA: {
    label: 'Pagada',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  },
  VENCIDA: {
    label: 'Vencida',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
}

export function StatusBadge({ estado }) {
  const config = estadoConfig[estado?.toUpperCase()] || estadoConfig.PENDIENTE
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}
```

### 3. Actualizar la página de facturas con tabs de filtro

En `src/pages/Invoices.jsx`, implementa los siguientes cambios:

#### Agrega imports al inicio:
```javascript
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getInvoices } from '../api/invoices.api'
import { StatusBadge } from '../components/StatusBadge'
```

#### Define los tabs disponibles:
```javascript
const TABS = [
  { key: '', label: 'Todas' },
  { key: 'PENDIENTE', label: 'Pendientes' },
  { key: 'PAGADA', label: 'Pagadas' },
  { key: 'VENCIDA', label: 'Vencidas' },
]
```

#### Agrega estado del tab activo:
```javascript
const [estadoActivo, setEstadoActivo] = useState('')
```

#### Actualiza el useQuery para usar el filtro:
```javascript
const { data, isLoading, isError } = useQuery({
  queryKey: ['invoices', estadoActivo],
  queryFn: () => getInvoices({ estado: estadoActivo || undefined }),
  retry: false,
  throwOnError: false,
})

// Extraer el array de facturas del response paginado
const facturas = Array.isArray(data?.data)
  ? data.data
  : Array.isArray(data?.data?.content)
  ? data.data.content
  : []
```

#### Agrega los tabs en el JSX, antes del listado de facturas:
```jsx
{/* Tabs de filtro */}
<div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
  {TABS.map(tab => (
    <button
      key={tab.key}
      onClick={() => setEstadoActivo(tab.key)}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        estadoActivo === tab.key
          ? 'bg-teal-800 text-white dark:bg-teal-600'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {tab.label}
      {estadoActivo === tab.key && facturas.length > 0 && (
        <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
          {facturas.length}
        </span>
      )}
    </button>
  ))}
</div>
```

#### Agrega el StatusBadge en cada card de factura:
En la card de cada factura, donde se muestran los datos, agrega el badge de estado:
```jsx
<StatusBadge estado={factura.estado} />
```

#### Agrega estado vacío cuando no hay facturas del filtro seleccionado:
```jsx
{!isLoading && facturas.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">
      {estadoActivo === 'PAGADA' ? 'check_circle' : 
       estadoActivo === 'VENCIDA' ? 'warning' : 'description'}
    </span>
    <p className="text-gray-500 dark:text-gray-400 font-medium">
      {estadoActivo === 'PAGADA' ? 'No tienes facturas pagadas' :
       estadoActivo === 'VENCIDA' ? 'No tienes facturas vencidas' :
       estadoActivo === 'PENDIENTE' ? 'No tienes facturas pendientes' :
       'No tienes facturas aún'}
    </p>
  </div>
)}
```

### 4. Actualizar el Dashboard para mostrar conteos por estado

En `src/pages/Dashboard.jsx`, si hay tarjetas de resumen (pendientes, pagadas, vencidas), asegúrate de que usen el campo `estado` real de cada factura para calcular los conteos:

```javascript
// Calcular conteos desde los datos reales
const pendientes = facturas.filter(f => f.estado === 'PENDIENTE').length
const pagadas = facturas.filter(f => f.estado === 'PAGADA').length
const vencidas = facturas.filter(f => f.estado === 'VENCIDA').length
```

## Archivos a modificar
- `src/api/invoices.api.js` — actualizar función getInvoices con parámetro estado
- `src/components/StatusBadge.jsx` — crear o actualizar con estados de facturas
- `src/pages/Invoices.jsx` — agregar tabs de filtro y badge de estado
- `src/pages/Dashboard.jsx` — actualizar conteos usando estado real

## NO modificar
- Lógica de upload de facturas
- Lógica de pagos
- Componentes de autenticación