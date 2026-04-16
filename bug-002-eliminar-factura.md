# BUG: GET /recommendations responde 500 al cargar el Dashboard

## Síntoma
Al cargar la página de inicio (Dashboard), se hacen 3 llamadas a:
  GET /api/v1/recommendations
Y todas responden 500 Internal Server Error.
Esto muestra el mensaje "Error del servidor. Por favor intenta más tarde." al usuario.

## Lo que necesitas hacer

### 1. Busca en el frontend dónde se llama a /recommendations

Busca en todos los archivos de `src/` el texto "recommendations".
Probablemente está en `src/pages/Dashboard.jsx` o en algún hook/query.

### 2. Solución A — Si el backend no tiene ese endpoint aún

Agrega un guard para que el error no se muestre al usuario.
Encuentra la query/fetch de recommendations y agrégale manejo de error silencioso:

```javascript
// Con TanStack Query v5:
const { data: recommendations } = useQuery({
  queryKey: ['recommendations'],
  queryFn: () => apiClient.get('/recommendations').then(r => r.data),
  retry: false,           // no reintentar si falla
  throwOnError: false,    // no propagar el error
})

// Y donde se renderiza, usa fallback vacío:
const recList = Array.isArray(recommendations) ? recommendations : []
```

### 3. Solución B — Si se llama 3 veces innecesariamente

Si el componente hace múltiples llamadas por re-renders, agrega:
```javascript
staleTime: 5 * 60 * 1000,  // 5 minutos
```

### 4. Elimina el toast/mensaje de error para esta query específica

El mensaje "Error del servidor" se muestra porque algún interceptor global o `onError` está mostrando un toast para CUALQUIER error.

Busca en `src/api/client.js` el interceptor de respuesta. Debe tener algo como:
```javascript
response => response,
error => {
  toast.error('Error del servidor...')  // ← esto muestra el mensaje
  return Promise.reject(error)
}
```

Modifica para que errores de endpoints no críticos (como recommendations) no muestren toast.
La forma más limpia: agrega una opción `silent: true` en la config de la request:

```javascript
// En el interceptor:
error => {
  if (!error.config?.silent) {
    toast.error('Error del servidor. Por favor intenta más tarde.')
  }
  return Promise.reject(error)
}

// En la llamada a recommendations:
apiClient.get('/recommendations', { silent: true })
```

## Archivos a modificar
- `src/pages/Dashboard.jsx` — query de recommendations
- `src/api/client.js` — interceptor de error (agregar soporte a `silent`)
- El hook o archivo donde se defina la query de recommendations si está separado

## NO modificar
- Otras queries del Dashboard (invoices, properties)
- Lógica de autenticación
- Ningún archivo del backend