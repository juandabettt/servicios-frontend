import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertiesApi } from '../api/properties.api';
import Icon from '../components/ui/Icon';
import ConfirmModal from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

const propertySchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').max(100),
  direccion: z.string().max(255).optional(),
  ciudad: z.string().max(100).optional(),
  esPrincipal: z.boolean().default(false),
});

function PropertyForm({ initial, onSave, onCancel, isSaving }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: initial || { nombre: '', direccion: '', ciudad: '', esPrincipal: false },
  });

  const esPrincipal = watch('esPrincipal');

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">
          Nombre <span className="text-error">*</span>
        </label>
        <input
          {...register('nombre')}
          placeholder="Casa principal"
          className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
        />
        {errors.nombre && (
          <p className="text-error text-xs mt-1">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">Dirección</label>
        <input
          {...register('direccion')}
          placeholder="Calle 10 # 5-20"
          className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">Ciudad</label>
        <input
          {...register('ciudad')}
          placeholder="Pasto"
          className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <button
        type="button"
        onClick={() => setValue('esPrincipal', !esPrincipal)}
        className="flex items-center gap-3 w-full"
      >
        <div
          className={`w-12 h-6 rounded-full transition-colors ${
            esPrincipal ? 'bg-primary' : 'bg-surface-container-high'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 mt-0.5 ${
              esPrincipal ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </div>
        <span className="text-sm font-medium text-on-surface">¿Es tu propiedad principal?</span>
      </button>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border-2 border-outline-variant/30 text-on-surface-variant font-bold rounded-full hover:bg-surface-container transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default function Properties() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll().then((r) => r.data),
  });

  const properties = propertiesData?.content || propertiesData || [];

  const createMutation = useMutation({
    mutationFn: (data) => propertiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Propiedad guardada');
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => propertiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Propiedad guardada');
      setEditingProperty(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Propiedad eliminada');
      setDeleteTarget(null);
    },
  });

  const handleSaveNew = (data) => createMutation.mutate(data);
  const handleSaveEdit = (data) => updateMutation.mutate({ id: editingProperty.id, data });

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface">Mis propiedades</h1>
          <p className="text-on-surface-variant mt-1">Administra tus inmuebles y propiedades.</p>
        </div>
        {!showForm && !editingProperty && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Icon name="add" />
            Nueva propiedad
          </button>
        )}
      </div>

      {/* Formulario nueva propiedad */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
          <h2 className="text-lg font-bold text-on-surface mb-4">Nueva propiedad</h2>
          <PropertyForm
            onSave={handleSaveNew}
            onCancel={() => setShowForm(false)}
            isSaving={createMutation.isPending}
          />
        </div>
      )}

      {/* Lista de propiedades */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-high rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 && !showForm ? (
        <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-3xl p-12 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="home" className="text-4xl text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface">Sin propiedades aún</h3>
            <p className="text-on-surface-variant mt-2">
              Registra tu primera propiedad para empezar a gestionar tus facturas de servicios públicos.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
          >
            <Icon name="add_home" />
            Crear primera propiedad
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((property) =>
            editingProperty?.id === property.id ? (
              <div
                key={property.id}
                className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20"
              >
                <h2 className="text-lg font-bold text-on-surface mb-4">Editar propiedad</h2>
                <PropertyForm
                  initial={editingProperty}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingProperty(null)}
                  isSaving={updateMutation.isPending}
                />
              </div>
            ) : (
              <div
                key={property.id}
                className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="home" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-on-surface truncate">{property.nombre}</p>
                    {property.esPrincipal && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                        Principal
                      </span>
                    )}
                  </div>
                  {property.direccion && (
                    <p className="text-xs text-on-surface-variant mt-0.5 truncate">{property.direccion}</p>
                  )}
                  {property.ciudad && (
                    <p className="text-xs text-on-surface-variant truncate">{property.ciudad}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingProperty(property)}
                    className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(property.id)}
                    className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar propiedad"
        message="¿Seguro que quieres eliminar esta propiedad? También se eliminarán sus facturas asociadas."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
