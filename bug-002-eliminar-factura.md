# FEATURE-002 FRONTEND: Eliminar factura

## Contexto
El backend ya tiene el endpoint `DELETE /api/v1/invoices/{id}`. Se necesita implementar la UI para eliminar facturas desde el listado y desde el detalle, con modal de confirmación.

## Lo que necesitas hacer

### 1. Agregar función en la API de facturas

En `src/api/invoices.api.js` agrega al final:

```javascript
export const deleteInvoice = (id) =>
  apiClient.delete(`/invoices/${id}`)
```

### 2. Verificar si existe ConfirmModal

Busca si existe `src/components/ConfirmModal.jsx`. Si no existe, créalo:

```jsx
export function ConfirmModal({ isOpen, onConfirm, onCancel, title, message, confirmLabel = 'Eliminar', isLoading = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 3. Agregar eliminar en el listado de facturas

En `src/pages/Invoices.jsx`:

Agrega los imports necesarios al inicio:
```javascript
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteInvoice } from '../api/invoices.api'
import { ConfirmModal } from '../components/ConfirmModal'
import toast from 'react-hot-toast'
```

Dentro del componente agrega el estado y la mutación:
```javascript
const [deleteId, setDeleteId] = useState(null)
const queryClient = useQueryClient()

const deleteMutation = useMutation({
  mutationFn: (id) => deleteInvoice(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    toast.success('Factura eliminada')
    setDeleteId(null)
  },
  onError: () => {
    toast.error('No se pudo eliminar la factura')
    setDeleteId(null)
  }
})
```

En cada card o fila de factura, agrega el botón de eliminar. Ubícalo en la esquina superior derecha o en un menú de opciones:
```jsx
<button
  onClick={(e) => {
    e.stopPropagation() // evita navegar al detalle al hacer clic
    setDeleteId(factura.id)
  }}
  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
  title="Eliminar factura"
>
  <span className="material-symbols-outlined text-xl">delete</span>
</button>
```

Al final del componente, antes del cierre del return, agrega el modal:
```jsx
<ConfirmModal
  isOpen={!!deleteId}
  title="Eliminar factura"
  message="¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer."
  onConfirm={() => deleteMutation.mutate(deleteId)}
  onCancel={() => setDeleteId(null)}
  isLoading={deleteMutation.isPending}
/>
```

### 4. Agregar eliminar en el detalle de factura

En `src/pages/InvoiceDetail.jsx`:

Agrega los imports:
```javascript
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteInvoice } from '../api/invoices.api'
import { ConfirmModal } from '../components/ConfirmModal'
import toast from 'react-hot-toast'
```

Dentro del componente:
```javascript
const navigate = useNavigate()
const { id } = useParams()
const queryClient = useQueryClient()
const [showDeleteModal, setShowDeleteModal] = useState(false)

const deleteMutation = useMutation({
  mutationFn: () => deleteInvoice(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    toast.success('Factura eliminada')
    navigate('/invoices')
  },
  onError: () => {
    toast.error('No se pudo eliminar la factura')
  }
})
```

Agrega el botón de eliminar en la parte inferior de la pantalla o junto al botón de pagar:
```jsx
<button
  onClick={() => setShowDeleteModal(true)}
  className="w-full py-3 rounded-xl border border-red-200 dark:border-red-900 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
>
  Eliminar factura
</button>
```

Y el modal antes del cierre del return:
```jsx
<ConfirmModal
  isOpen={showDeleteModal}
  title="Eliminar factura"
  message="¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer."
  onConfirm={() => deleteMutation.mutate()}
  onCancel={() => setShowDeleteModal(false)}
  isLoading={deleteMutation.isPending}
/>
```

## Archivos a modificar
- `src/api/invoices.api.js` — agregar función deleteInvoice
- `src/components/ConfirmModal.jsx` — crear si no existe
- `src/pages/Invoices.jsx` — agregar botón y modal en listado
- `src/pages/InvoiceDetail.jsx` — agregar botón y modal con redirección

## NO modificar
- Lógica de upload de facturas
- Lógica de pagos
- Cualquier otro componente no relacionado