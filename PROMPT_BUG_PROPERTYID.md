# Tarea: Corregir envío de propertyId en InvoiceUpload y AiInsights

## Contexto
Frontend React + Vite conectado a backend Spring Boot en Railway.
Hay dos bugs relacionados con el propertyId que se envía incorrectamente al backend.

## Bug 1 — InvoiceUpload envía "default" como propertyId
### Archivo: src/pages/InvoiceUpload.jsx

### Problema
En la función handleUpload existe esta línea:
const propertyId = properties?.[0]?.id || 'default';

Cuando las propiedades aún no han cargado o el array está vacío,
se envía la cadena literal "default" como propertyId al backend,
que falla porque espera un UUID válido.

### Solución
1. Agregar un estado de carga que espere a que las propiedades estén disponibles
2. Si no hay propiedades redirigir al usuario a /properties antes de continuar
3. Nunca usar un string literal como fallback de un UUID

Cambiar la función handleUpload así:

```javascript
const handleUpload = async () => {
  if (!selectedFile) return;
  
  // Obtener propertyId real — nunca usar fallback string
  const props = extractArray(propertiesData);
  const realPropertyId = props[0]?.id;
  
  if (!realPropertyId) {
    toast.error('Necesitas crear una propiedad primero');
    navigate('/properties');
    return;
  }
  
  try {
    const { data } = await invoicesApi.upload(selectedFile, realPropertyId);
    setInvoiceId(data.invoiceId || data.id);
    setPollingEnabled(true);
  } catch (err) {
    if (err.response?.status === 500) {
      toast.error('No pudimos procesar tu imagen. Puedes ingresar los datos manualmente.');
      setManualMode(true);
      setStep(2);
    }
  }
};
```

También agregar al inicio del componente la función extractArray
si no existe ya en el archivo:

```javascript
const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.content && Array.isArray(data.content)) return data.content;
  return [];
};
```

Y asegurarse que useNavigate está importado desde react-router-dom.

## Bug 2 — AiInsights llama a recommendations sin propertyId
### Archivo: src/pages/AiInsights.jsx

### Problema
La query de recommendations se ejecuta antes de que propertyId
tenga un valor válido, enviando la petición sin el parámetro
requerido por el backend.

### Solución
Agregar enabled: !!propertyId a todas las queries que dependan
de propertyId para que no se ejecuten hasta tener un UUID válido:

```javascript
// recommendations
const { data: recommendations, isLoading: loadingRec } = useQuery({
  queryKey: ['ai-insights/recommendations', propertyId],
  queryFn: () => aiApi.getRecommendations({ propertyId }).then((r) => r.data),
  enabled: !!propertyId,  // <-- agregar esto si no existe
});

// predictions
const { data: predictions } = useQuery({
  queryKey: ['ai-insights/predictions', propertyId, 'ENERGIA'],
  queryFn: () => aiApi.getPredictions(propertyId, 'ENERGIA').then((r) => r.data),
  enabled: !!propertyId,  // <-- agregar esto si no existe
});

// benchmark
const { data: benchmark } = useQuery({
  queryKey: ['ai-insights/benchmark', propertyId, 'ENERGIA'],
  queryFn: () => aiApi.getBenchmark(propertyId, 'ENERGIA').then((r) => r.data),
  enabled: !!propertyId,  // <-- agregar esto si no existe
});

// invoiceHistory
const { data: invoiceHistory } = useQuery({
  queryKey: ['invoices', { propertyId }],
  queryFn: () => invoicesApi.getAll({ propertyId, size: 50 }).then((r) => r.data),
  enabled: !!propertyId,  // <-- agregar esto si no existe
});
```

## Archivos a modificar
1. src/pages/InvoiceUpload.jsx
2. src/pages/AiInsights.jsx

## Instrucciones importantes
- NO ejecutes git add, git commit, git push ni ningún comando de git
- NO modifiques ningún otro archivo fuera de los listados
- NO cambies lógica visual ni diseño
- Después de cada cambio confirma qué líneas exactas fueron modificadas
- Si enabled: !!propertyId ya existe en alguna query no lo dupliques

## Verificación esperada
1. Al subir una factura sin propiedad → redirige a /properties con toast
2. Al subir una factura con propiedad válida → envía UUID real al backend
3. AiInsights no llama al backend hasta tener propertyId válido
4. No aparece el error "Invalid UUID string: default" en los logs
