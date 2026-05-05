import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { autopayApi } from '../api/autopay.api';
import Icon from '../components/ui/Icon';
import ConfirmModal from '../components/ui/ConfirmModal';
import AutoPayRuleModal from '../components/ui/AutoPayRuleModal';
import { useState } from 'react';
import toast from 'react-hot-toast';

const TIPO_ICON = {
  ENERGIA: 'bolt',
  AGUA: 'water_drop',
  GAS: 'local_fire_department',
  INTERNET: 'wifi',
  TODOS: 'autorenew',
};

const TIPO_LABEL = {
  ENERGIA: 'Energía',
  AGUA: 'Agua',
  GAS: 'Gas',
  INTERNET: 'Internet',
  TODOS: 'Todos los servicios',
};

export default function AutoPay() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showNewRule, setShowNewRule] = useState(false);

  const { data: rules, isLoading } = useQuery({
    queryKey: ['autopay-rules'],
    queryFn: () => autopayApi.getRules().then((r) => r.data),
  });

  const createRule = useMutation({
    mutationFn: (data) => autopayApi.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopay-rules'] });
      toast.success('Regla creada');
      setShowNewRule(false);
    },
    onError: () => toast.error('Error al crear la regla'),
  });

  const toggle = useMutation({
    mutationFn: ({ id, active }) => autopayApi.toggleRule(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopay-rules'] });
      toast.success('Autopago actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteRule = useMutation({
    mutationFn: (id) => autopayApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopay-rules'] });
      toast.success('Regla eliminada');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Error al eliminar la regla'),
  });

  const rulesList = rules?.content || rules || [];

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface">Autopago</h1>
          <p className="text-on-surface-variant mt-1">Configura pagos automáticos para tus servicios.</p>
        </div>
        <button
          onClick={() => setShowNewRule(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
        >
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
          {rulesList.map((rule) => {
            const tipo = rule.tipoServicio || 'TODOS';
            return (
              <div
                key={rule.id}
                className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center shrink-0">
                  <Icon name={TIPO_ICON[tipo] || 'autorenew'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface truncate">{rule.nombre || rule.nombreServicio}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {TIPO_LABEL[tipo] || tipo}
                    {rule.diasAntesVencimiento && ` · ${rule.diasAntesVencimiento}d antes`}
                    {rule.montoMaximo && ` · Máx $${rule.montoMaximo.toLocaleString('es-CO')}`}
                  </p>
                  {rule.totalPagosRealizados > 0 && (
                    <p className="text-xs text-primary mt-0.5">{rule.totalPagosRealizados} pagos realizados</p>
                  )}
                </div>
                <button
                  onClick={() => toggle.mutate({ id: rule.id, active: !rule.activa })}
                  aria-label={rule.activa ? 'Desactivar regla' : 'Activar regla'}
                  className={`w-12 h-6 rounded-full transition-colors shrink-0 ${rule.activa ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${rule.activa ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <button
                  onClick={() => setDeleteTarget(rule.id)}
                  className="p-2 text-error hover:bg-error-container/20 rounded-lg shrink-0"
                >
                  <Icon name="delete" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AutoPayRuleModal
        open={showNewRule}
        onClose={() => setShowNewRule(false)}
        onSubmit={(data) => createRule.mutate(data)}
        loading={createRule.isPending}
      />

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
