import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { autopayApi } from '../api/autopay.api';
import { propertiesApi } from '../api/properties.api';
import Icon from '../components/ui/Icon';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AutoPay() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: rules, isLoading } = useQuery({
    queryKey: ['autopay-rules'],
    queryFn: () => autopayApi.getRules().then((r) => r.data),
  });

  const toggle = useMutation({
    mutationFn: ({ id, active }) => autopayApi.toggleRule(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopay-rules'] });
      toast.success('Autopago configurado');
    },
  });

  const deleteRule = useMutation({
    mutationFn: (id) => autopayApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopay-rules'] });
      toast.success('Regla eliminada');
      setDeleteTarget(null);
    },
  });

  const rulesList = rules?.content || rules || [];

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface">Autopago</h1>
          <p className="text-on-surface-variant mt-1">Configura pagos automáticos para tus servicios.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90">
          <Icon name="add" />
          Nueva regla
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-high rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : rulesList.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4 text-center opacity-50">
          <Icon name="autorenew" className="text-6xl text-outline-variant" />
          <h3 className="font-bold text-on-surface">Sin reglas de autopago</h3>
          <p className="text-sm text-on-surface-variant">Crea reglas para pagar tus facturas automáticamente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rulesList.map((rule) => (
            <div key={rule.id} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center">
                <Icon name="autorenew" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">{rule.nombreServicio || rule.tipoServicio}</p>
                <p className="text-xs text-on-surface-variant">{rule.descripcion || `Día ${rule.diaPago} de cada mes`}</p>
              </div>
              <button
                onClick={() => toggle.mutate({ id: rule.id, active: !rule.activa })}
                className={`w-12 h-6 rounded-full transition-colors ${rule.activa ? 'bg-primary' : 'bg-surface-container-high'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${rule.activa ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <button onClick={() => setDeleteTarget(rule.id)} className="p-2 text-error hover:bg-error-container/20 rounded-lg">
                <Icon name="delete" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar regla"
        message="¿Seguro que quieres eliminar esta regla de autopago?"
        confirmLabel="Eliminar"
        danger
        onConfirm={() => deleteRule.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
