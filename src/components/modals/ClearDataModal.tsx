import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  ShieldAlert,
  Server
} from 'lucide-react';
import { 
  clearAllSystemData, 
  restoreDemoData, 
  isDemoCleared,
  loadSupabaseConfig, 
  saveSupabaseConfig, 
  SupabaseConfig 
} from '../../services/storage';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({
  isOpen,
  onClose,
  onDataChanged
}) => {
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(loadSupabaseConfig());
  const [isCleared, setIsCleared] = useState(isDemoCleared());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPurgingSupabase, setIsPurgingSupabase] = useState(false);

  if (!isOpen) return null;

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que deseas borrar TODOS los datos de muestra del sistema? El navegador recordará tu elección y no volverá a cargar datos ficticios al reiniciar.')) {
      clearAllSystemData();
      setIsCleared(true);
      setStatusMessage({
        type: 'success',
        text: '¡Datos de muestra eliminados! El sistema ahora está listo para producción real limpia.'
      });
      onDataChanged();
    }
  };

  const handleRestoreDemo = () => {
    restoreDemoData();
    setIsCleared(false);
    setStatusMessage({
      type: 'success',
      text: 'Se han cargado 160 pedidos de prueba para demostrar el corte de caja y los 7 repartidores.'
    });
    onDataChanged();
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseConfig);
    setStatusMessage({
      type: 'success',
      text: 'Configuración de conexión Supabase guardada correctamente.'
    });
  };

  const handlePurgeSupabase = async () => {
    if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor ingresa primero la URL y Anon Key de Supabase para poder borrar los registros remotos.'
      });
      return;
    }

    if (!window.confirm('¿Confirmas que deseas enviar la orden de vaciado a la tabla de Supabase?')) {
      return;
    }

    setIsPurgingSupabase(true);
    try {
      // Execute REST DELETE on Supabase endpoint
      const endpoint = `${supabaseConfig.supabaseUrl.replace(/\/$/, '')}/rest/v1/${supabaseConfig.tableName}?id=neq.0`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseConfig.supabaseAnonKey,
          'Authorization': `Bearer ${supabaseConfig.supabaseAnonKey}`,
          'Prefer': 'return=representation'
        }
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `Registros borrados con éxito en la tabla "${supabaseConfig.tableName}" de Supabase.`
        });
      } else {
        const errText = await res.text();
        setStatusMessage({
          type: 'error',
          text: `Respuesta de Supabase: ${res.status} - ${errText || 'Verifica permisos o RLS'}`
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({
        type: 'error',
        text: `No se pudo conectar a Supabase: ${msg}`
      });
    } finally {
      setIsPurgingSupabase(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Gestión de Datos y Base de Datos Supabase</h2>
              <p className="text-xs text-emerald-100/80">Limpieza permanente de datos de muestra y conexión remota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* SECTION 1: BORRAR DATOS DE MUESTRA (LOCAL/SISTEMA) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Datos de Muestra del Sistema
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCleared ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isCleared ? 'Estado: Datos Limpios / Vacíos' : 'Estado: Datos de Prueba Activos'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Al borrar los datos de muestra, el navegador activará la directiva de memoria permanente y 
              <strong> NO volverá a mostrar los datos de prueba</strong> al recargar o reiniciar la aplicación, dejando el sistema en ceros para producción real.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Borrar Datos de Muestra del Sistema</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreDemo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Restaurar 160 Pedidos de Demostración</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: CONFIGURACIÓN SUPABASE & BORRADO REMOTO */}
          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#075E54]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Conexión y Borrado en Supabase
                </span>
              </div>
              <span className="text-[10px] text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-mono">
                PostgreSQL
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ingresa tus credenciales de proyecto en Supabase para sincronizar o ejecutar la orden de vaciado remoto de la tabla cuando esté configurada:
            </p>

            <form onSubmit={handleSaveSupabase} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Project URL de Supabase:
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseConfig.supabaseUrl}
                  onChange={e => setSupabaseConfig({ ...supabaseConfig, supabaseUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Supabase Anon Key:
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseConfig.supabaseAnonKey}
                  onChange={e => setSupabaseConfig({ ...supabaseConfig, supabaseAnonKey: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Nombre de la Tabla:
                </label>
                <input
                  type="text"
                  placeholder="pedidos"
                  value={supabaseConfig.tableName}
                  onChange={e => setSupabaseConfig({ ...supabaseConfig, tableName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366] bg-white"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-bold rounded-lg transition"
                >
                  Guardar Configuración Supabase
                </button>

                <button
                  type="button"
                  onClick={handlePurgeSupabase}
                  disabled={isPurgingSupabase}
                  className="px-4 py-2 bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isPurgingSupabase ? 'Borrando en Supabase...' : 'Borrar Registros en Supabase'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
