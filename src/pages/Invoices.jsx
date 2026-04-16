import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { invoicesApi } from '../api/invoices.api';
import InvoiceCard from '../components/ui/InvoiceCard';
import { SkeletonInvoiceCard } from '../components/ui/SkeletonCard';
import Icon from '../components/ui/Icon';
import { ConfirmModal } from '../components/ConfirmModal';

const FILTERS = ['TODAS', 'PENDIENTE', 'PAGADA', 'VENCIDA'];

export default function Invoices() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('TODAS');
  const [pagina, setPagina] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => invoicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factura eliminada');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('No se pudo eliminar la factura');
      setDeleteId(null);
    },
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['invoices', filtro, pagina],
    queryFn: () =>
      invoicesApi
        .getAll({ estado: filtro !== 'TODAS' ? filtro : undefined, page: pagina, size: 10 })
        .then((r) => r.data),
  });

  const invoices = data?.content || data || [];
  const hasMore = data?.totalPages ? pagina < data.totalPages - 1 : false;

  return (
    <div className="max-w-5xl mx-auto px-6 pt-8 pb-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-teal-900 tracking-tight mb-2">Mis Facturas</h1>
        <p className="text-on-surface-variant max-w-md">
          Administra y paga todos tus servicios públicos en un solo lugar.
        </p>
      </header>

      {/* Mobile search */}
      <div className="md:hidden mb-6">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" />
          <input
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Buscar servicios..."
            type="text"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => { setFiltro(f); setPagina(0); }}
            className={`px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all active:scale-95 ${
              filtro === f
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            {f === 'TODAS' ? 'Todas' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Invoice grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonInvoiceCard key={i} />)
          : invoices.length > 0
          ? invoices.map((invoice) => (
              <div key={invoice.id} className="relative group">
                <InvoiceCard invoice={invoice} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(invoice.id);
                  }}
                  className="absolute top-3 right-3 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar factura"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            ))
          : (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center opacity-40">
              <div className="w-32 h-32 mb-6 bg-surface-container rounded-full flex items-center justify-center">
                <Icon name="receipt_long" className="text-6xl text-outline-variant" />
              </div>
              <h3 className="text-xl font-bold text-teal-900">No hay facturas</h3>
              <p className="text-on-surface-variant text-sm mt-2">
                Agrega una nueva factura para empezar a gestionarla.
              </p>
            </div>
          )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPagina((p) => p + 1)}
            disabled={isFetching}
            className="px-8 py-3 border-2 border-primary/20 text-primary font-bold rounded-full hover:bg-primary/5 transition-colors disabled:opacity-60"
          >
            {isFetching ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/invoices/upload')}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(25,28,29,0.06)] active:scale-95 transition-transform z-50"
      >
        <Icon name="add" className="text-3xl" />
      </button>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Eliminar factura"
        message="¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer."
        onConfirm={() => deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
