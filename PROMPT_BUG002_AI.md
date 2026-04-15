# Tarea: Corregir crash en página de Análisis IA

## Contexto
La página de Análisis IA en src/pages/AiInsights.jsx crashea completamente 
con el error "TypeError: c.map is not a function" al intentar cargar.

## Causa del problema
El código intenta hacer .map() directamente sobre respuestas del backend que 
devuelven objetos paginados con esta estructura:
{
  "content": [],
  "totalElements": 0,
  "totalPages": 0,
  "pageable": {...}
}

Cuando el código espera un array directo [] y recibe un objeto, al intentar 
hacer .map() sobre el objeto la app explota completamente.

Además el hook useQuery de TanStack Query v5 ya no soporta el callback 
onSuccess dentro de las opciones — eso también causa errores silenciosos.

## Archivo a modificar
src/pages/AiInsights.jsx

## Cambios requeridos

### CAMBIO 1 — Corregir extracción de datos paginados
En todas las líneas donde se extraen datos de las queries, asegurarse de 
manejar tanto arrays directos como objetos paginados:

Reemplazar este patrón donde aparezca:
```javascript
const insights = recommendations?.content || recommendations || [];
const properties = propertiesData?.content || propertiesData || [];
const invoices = invoiceHistory?.content || invoiceHistory || [];
```

Por este patrón más robusto que maneja todos los casos posibles:
```javascript
const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.content && Array.isArray(data.content)) return data.content;
  return [];
};

const insights = extractArray(recommendations);
const properties = extractArray(propertiesData);
const invoices = extractArray(invoiceHistory);
```

### CAMBIO 2 — Eliminar callbacks onSuccess de useQuery
TanStack Query v5 eliminó el callback onSuccess de useQuery. 
Buscar este bloque en AiInsights.jsx:

```javascript
const { data: properties } = useQuery({
  queryKey: ['properties'],
  queryFn: () => propertiesApi.getAll().then((r) => r.data),
  onSuccess: (data) => {
    if (data?.length && !selectedProperty) setSelectedProperty(data[0]?.id);
  },
});
```

Reemplazarlo por:
```javascript
const { data: propertiesData } = useQuery({
  queryKey: ['properties'],
  queryFn: () => propertiesApi.getAll().then((r) => r.data),
});

// Usar useEffect para manejar el efecto secundario
useEffect(() => {
  const props = extractArray(propertiesData);
  if (props.length > 0 && !selectedProperty) {
    setSelectedProperty(props[0]?.id);
  }
}, [propertiesData]);
```

Asegurarse de que useEffect está importado desde React al inicio del archivo.

### CAMBIO 3 — Agregar estado de carga y error
Agregar manejo de estados para cuando las queries están cargando o fallan,
evitando que el componente intente renderizar datos undefined:

```javascript
// Si las propiedades están cargando mostrar spinner
if (loadingProperties) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-fixed 
                      border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// Si no hay propiedades mostrar mensaje
if (properties.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-16 
                    gap-4 text-center px-6">
      <span className="material-symbols-outlined text-6xl 
                       text-outline-variant">home</span>
      <h3 className="text-xl font-bold text-on-surface">
        Primero crea una propiedad
      </h3>
      <p className="text-on-surface-variant">
        Necesitas al menos una propiedad para ver el análisis IA.
      </p>
      <button
        onClick={() => navigate('/properties')}
        className="px-8 py-4 bg-primary text-on-primary font-bold 
                   rounded-full hover:opacity-90 transition-all"
      >
        Crear propiedad
      </button>
    </div>
  );
}
```

Asegurarse de que useNavigate está importado desde react-router-dom.

### CAMBIO 4 — Proteger todos los .map() con fallback
Buscar TODAS las líneas en el archivo donde se use .map() y asegurarse 
de que siempre tengan un fallback a array vacío antes de llamar .map():

Patrón a buscar y corregir:
```javascript
// MALO — puede crashear
someData.map(item => ...)

// BUENO — seguro
(someData || []).map(item => ...)

// También verificar en JSX
{someArray.map(...)}  // MALO
{(someArray || []).map(...)}  // BUENO
```

Revisar especialmente estas variables en el JSX:
- properties.map(...)
- insights.map(...)
- invoices.map(...)
- filteredInvoices.map(...)
- MONTHS.map(...) — esta está bien porque es constante

### CAMBIO 5 — Corregir propertyId inicial
El estado inicial de selectedProperty es null. Cuando se usa en las queries 
habilitadas con `enabled: !!propertyId` esto causa que no carguen hasta que 
el useEffect lo setee. Asegurarse de que propertyId siempre tenga un valor 
válido cuando hay propiedades:

```javascript
const properties = extractArray(propertiesData);
const propertyId = selectedProperty || properties[0]?.id || null;
```

## Instrucciones importantes
- NO ejecutes git add, git commit, git push ni ningún comando de git
- NO modifiques ningún otro archivo fuera de AiInsights.jsx
- Mantén toda la lógica visual y el diseño exactamente igual
- Solo corrige el manejo de datos y los crashes
- Después de los cambios confirma qué líneas exactas fueron modificadas

## Verificación esperada
Al terminar, la página /ai debe:
1. Cargar sin crashear
2. Si no hay datos mostrar el estado vacío con diseño correcto
3. Si hay datos mostrarlos correctamente
4. No mostrar ningún error "c.map is not a function"