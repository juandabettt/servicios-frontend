import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../api/invoices.api';
import { propertiesApi } from '../api/properties.api';
import { usePolling } from '../hooks/usePolling';
import Icon from '../components/ui/Icon';
import { formatCOP } from '../utils/currency';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const correctionSchema = z.object({
  proveedor: z.string().min(1),
  periodoFacturado: z.string().min(1),
  fechaVencimiento: z.string().min(1),
  montoTotal: z.number().positive(),
  consumo: z.number().optional(),
  unidadConsumo: z.string().optional(),
});

const STEP_LABELS = ['Captura', 'Verificación', 'Confirmación'];

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.content && Array.isArray(data.content)) return data.content;
  return [];
};

export default function InvoiceUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const cameraInputRef = useRef();

  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [payNow, setPayNow] = useState(false);

  const { data: propertiesData } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll().then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(correctionSchema),
  });

  // OCR polling
  const { data: pollingData, isTimeout } = usePolling({
    queryFn: () => invoicesApi.getById(invoiceId),
    stopCondition: (data) => {
      const d = data?.data ?? data;
      return d?.estado && d.estado !== 'PROCESANDO_OCR';
    },
    intervalMs: 3000,
    timeoutMs: 60000,
    enabled: pollingEnabled && !!invoiceId,
  });

  const invoice = pollingData?.data ?? pollingData;

  // When OCR finishes, pre-fill form and go to step 2
  if (pollingEnabled && invoice && invoice.estado !== 'PROCESANDO_OCR' && step === 1) {
    setPollingEnabled(false);
    setOcrData(invoice);
    reset({
      proveedor: invoice.proveedor || '',
      periodoFacturado: invoice.periodoFacturado || '',
      fechaVencimiento: invoice.fechaVencimiento?.split('T')[0] || '',
      montoTotal: invoice.montoTotal || 0,
      consumo: invoice.consumo || undefined,
      unidadConsumo: invoice.unidadConsumo || 'm³',
    });
    setStep(2);
  }

  if (isTimeout && step === 1 && pollingEnabled) {
    setPollingEnabled(false);
    setManualMode(true);
    setStep(2);
  }

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Solo se aceptan imágenes JPEG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('La imagen no puede superar los 10MB.');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

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

  const onSubmitCorrection = async (formData) => {
    if (invoiceId) {
      await invoicesApi.correct(invoiceId, formData);
    }
    setOcrData(formData);
    setStep(3);
  };

  const handleSave = () => {
    toast.success('¡Factura guardada correctamente');
    navigate('/invoices');
  };

  const handleSaveAndPay = () => {
    navigate(`/payments/${invoiceId}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-8">
      {/* Progress steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > i + 1
                  ? 'bg-primary text-on-primary'
                  : step === i + 1
                  ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {step > i + 1 ? <Icon name="check" className="text-sm" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-primary' : 'bg-surface-container-high'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-on-surface-variant">Paso {step} de {STEP_LABELS.length}</p>
      </div>

      {/* STEP 1: Capture */}
      {step === 1 && !pollingEnabled && (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-on-surface">Subir factura</h1>
          <p className="text-on-surface-variant">Toma una foto o sube una imagen de tu factura.</p>

          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-outline-variant rounded-3xl p-12 flex flex-col items-center gap-6 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }}
            >
              <div className="w-20 h-20 bg-primary-fixed rounded-2xl flex items-center justify-center">
                <Icon name="upload_file" className="text-4xl text-primary" />
              </div>
              <div>
                <p className="font-bold text-on-surface text-lg">Arrastra tu factura aquí</p>
                <p className="text-on-surface-variant text-sm mt-1">o haz clic para seleccionar</p>
                <p className="text-on-surface-variant text-xs mt-2">JPEG, PNG o WebP — máximo 10MB</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden">
              <img src={preview} alt="Preview factura" className="w-full max-h-80 object-cover" />
              <button
                onClick={() => { setSelectedFile(null); setPreview(null); }}
                className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm"
              >
                Cambiar foto
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-4 bg-surface-container-low rounded-2xl font-bold text-on-surface hover:bg-primary-fixed transition-colors"
            >
              <Icon name="photo_camera" className="text-primary" />
              Tomar foto
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-4 bg-surface-container-low rounded-2xl font-bold text-on-surface hover:bg-primary-fixed transition-colors"
            >
              <Icon name="photo_library" className="text-primary" />
              Desde galería
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          {selectedFile && (
            <button
              onClick={handleUpload}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all"
            >
              Procesar factura
            </button>
          )}
        </div>
      )}

      {/* OCR loading state */}
      {step === 1 && pollingEnabled && (
        <div className="flex flex-col items-center justify-center py-16 gap-8">
          <div className="relative w-32 h-40 bg-surface-container-low rounded-2xl overflow-hidden border-2 border-outline-variant/30">
            <Icon name="receipt_long" className="absolute inset-0 m-auto text-6xl text-outline-variant" />
            <div className="absolute inset-x-0 h-0.5 bg-primary/60 animate-scan shadow-[0_0_8px_rgba(0,83,68,0.6)]" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-on-surface">Estamos leyendo tu factura...</h2>
            <p className="text-on-surface-variant mt-2">Tarda unos segundos</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Verify OCR data */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmitCorrection)} className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface">Verifica los datos</h1>
            {manualMode ? (
              <p className="text-on-surface-variant mt-1">Ingresa los datos de tu factura manualmente.</p>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                {ocrData?.ocrConfianza >= 85 ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Alta confianza ✓
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                    ⚠ Verifica estos datos
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Proveedor</label>
              <input {...register('proveedor')} className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" placeholder="Ej: EMPOPASTO" />
              {errors.proveedor && <p className="mt-1 text-xs text-error">Requerido</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Período facturado</label>
              <input {...register('periodoFacturado')} className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" placeholder="Ej: Octubre 2024" />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Fecha de vencimiento</label>
              <input {...register('fechaVencimiento')} type="date" className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Monto total</label>
              <input
                {...register('montoTotal', { valueAsNumber: true })}
                type="number"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                placeholder="84500"
              />
              {errors.montoTotal && <p className="mt-1 text-xs text-error">Monto inválido</p>}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-on-surface mb-1.5">Consumo</label>
                <input {...register('consumo', { valueAsNumber: true })} type="number" className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" placeholder="125" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Unidad</label>
                <select {...register('unidadConsumo')} className="bg-surface-container-low border border-outline-variant rounded-xl py-3 px-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
                  <option value="kWh">kWh</option>
                  <option value="m³">m³</option>
                  <option value="GB">GB</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all">
            Continuar
          </button>
        </form>
      )}

      {/* STEP 3: Confirmation */}
      {step === 3 && ocrData && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Success animation */}
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#16a34a" strokeWidth="3" fill="none" />
                <path d="M12 20 L18 26 L28 14" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-check" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-on-surface">¡Datos guardados!</h2>
          </div>

          {/* Summary */}
          <div className="bg-surface-container-low rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-on-surface text-lg">Resumen de la factura</h3>
            {[
              { label: 'Proveedor', value: ocrData.proveedor },
              { label: 'Período', value: ocrData.periodoFacturado },
              { label: 'Vencimiento', value: ocrData.fechaVencimiento },
              { label: 'Monto', value: formatCOP(ocrData.montoTotal) },
              ocrData.consumo && { label: 'Consumo', value: `${ocrData.consumo} ${ocrData.unidadConsumo || ''}` },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-outline-variant/20 last:border-0">
                <span className="text-sm text-on-surface-variant">{label}</span>
                <span className="text-sm font-bold text-on-surface">{value}</span>
              </div>
            ))}
          </div>

          {/* Pay now toggle */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-on-surface">¿Pagar ahora?</span>
              <button
                onClick={() => setPayNow(!payNow)}
                className={`w-12 h-6 rounded-full transition-colors ${payNow ? 'bg-primary' : 'bg-surface-container-high'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${payNow ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleSave} className="flex-1 py-4 bg-surface-container-low text-on-surface font-bold rounded-full hover:bg-surface-container transition-colors">
              Guardar factura
            </button>
            {payNow && invoiceId && (
              <button onClick={handleSaveAndPay} className="flex-1 py-4 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 active:scale-95 transition-all">
                Guardar y pagar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
