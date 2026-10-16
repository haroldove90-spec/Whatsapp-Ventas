import React, { useState } from 'react';
import { ShieldAlert, Lock, Unlock, KeyRound } from 'lucide-react';

interface DeactivatedScreenProps {
  onReactivate?: () => void;
}

export const DeactivatedScreen: React.FC<DeactivatedScreenProps> = ({ onReactivate }) => {
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [errorPin, setErrorPin] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple admin override (accepts 'admin', '1234', or direct reactivation)
    if (adminPin.trim() === 'admin' || adminPin.trim() === '1234' || adminPin.trim() === 'ventas' || adminPin.trim() === '') {
      if (onReactivate) onReactivate();
    } else {
      setErrorPin(true);
      setTimeout(() => setErrorPin(false), 2000);
    }
  };

  return (
    <div className="min-h-screen wa-pattern-bg flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      
      {/* Brand Header */}
      <div className="w-full max-w-lg flex items-center justify-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#075E54] flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
          </svg>
        </div>
        <span className="font-extrabold text-slate-800 text-xl tracking-tight">Whatsapp Ventas</span>
      </div>

      {/* Main Deactivation Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden text-center p-8 sm:p-10 animate-in fade-in zoom-in-95">
        
        {/* Warning Icon Badge */}
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-rose-50">
          <Lock className="w-10 h-10 stroke-[2.2]" />
        </div>

        {/* Status Badge */}
        <span className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 mb-4">
          Programa Desactivado
        </span>

        {/* User's Exact Legend in Large Bold Typography */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-4">
          No hagas perder el tiempo si no vas a coimprar
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          El acceso a los módulos de ventas, cocina, repartidores y corte de caja se encuentra temporalmente fuera de servicio.
        </p>

        {/* Discreet Admin Reactivation Toggle */}
        <div className="pt-6 border-t border-slate-100">
          {!showAdminUnlock ? (
            <button
              onClick={() => setShowAdminUnlock(true)}
              className="text-xs font-semibold text-slate-400 hover:text-[#075E54] transition flex items-center justify-center gap-1.5 mx-auto"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Acceso de reactivación administrativa</span>
            </button>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-3 max-w-xs mx-auto animate-in fade-in">
              <input
                type="password"
                placeholder="PIN o presiona reactivar..."
                value={adminPin}
                onChange={e => setAdminPin(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border text-center font-mono ${
                  errorPin ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300 focus:border-[#25D366]'
                }`}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminUnlock(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#075E54] hover:bg-[#128C7E] rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Reactivar</span>
                </button>
              </div>
              {errorPin && (
                <span className="text-[11px] text-rose-600 block">PIN incorrecto</span>
              )}
            </form>
          )}
        </div>

      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        Whatsapp Ventas &bull; Sistema en pausa temporal
      </div>

    </div>
  );
};
