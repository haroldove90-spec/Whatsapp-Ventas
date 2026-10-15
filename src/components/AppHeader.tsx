import React, { useState } from 'react';
import { UserRole, RepartidorId } from '../types';
import { REPARTIDORES_INFO } from '../data/mockOrders';
import { 
  Download, 
  LogOut, 
  Smartphone, 
  ChevronDown, 
  Database, 
  Store, 
  Flame, 
  Bike, 
  ShieldCheck, 
  Trash2,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppHeaderProps {
  currentRole: UserRole;
  selectedRepartidorId: RepartidorId;
  onSelectRole: (role: UserRole) => void;
  onSelectRepartidorId: (id: RepartidorId) => void;
  onLogout: () => void;
  onOpenNewOrderModal: () => void;
  onOpenClearDataModal: () => void;
  onOpenInstallGuide: () => void;
  ordersCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentRole,
  selectedRepartidorId,
  onSelectRole,
  onSelectRepartidorId,
  onLogout,
  onOpenNewOrderModal,
  onOpenClearDataModal,
  onOpenInstallGuide,
  ordersCount
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleMeta = () => {
    switch (currentRole) {
      case 'ventas':
        return {
          title: 'Ventas / Mostrador',
          color: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40',
          icon: <Store className="w-4 h-4 text-[#25D366]" />
        };
      case 'produccion':
        return {
          title: 'Producción / Barra',
          color: 'bg-amber-500/20 text-amber-100 border-amber-400/40',
          icon: <Flame className="w-4 h-4 text-amber-300" />
        };
      case 'repartidores':
        return {
          title: `Repartidor ${selectedRepartidorId}`,
          color: 'bg-sky-500/20 text-sky-100 border-sky-400/40',
          icon: <Bike className="w-4 h-4 text-sky-300" />
        };
      case 'admin':
        return {
          title: 'Administrador / Caja',
          color: 'bg-teal-500/20 text-teal-100 border-teal-400/40',
          icon: <ShieldCheck className="w-4 h-4 text-[#25D366]" />
        };
    }
  };

  const roleMeta = getRoleMeta();

  return (
    <header className="sticky top-0 z-30 bg-[#075E54] text-white shadow-md select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0 shadow-inner">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight truncate text-white">
                Whatsapp Ventas
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-900/60 text-[#25D366] border border-emerald-600/30">
                PWA
              </span>
            </div>
            <span className="text-[11px] text-emerald-100/70 hidden sm:block truncate">
              {ordersCount} pedidos registrados hoy
            </span>
          </div>
        </div>

        {/* Center/Right: Identificación del Rol Activo */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition active:scale-95 ${roleMeta.color}`}
            title="Cambiar de Rol"
          >
            {roleMeta.icon}
            <span className="truncate max-w-[130px] sm:max-w-[160px]">{roleMeta.title}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Role Switcher Dropdown */}
          {roleDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1">
                  Cambiar Rol Activo
                </div>

                <button
                  onClick={() => { onSelectRole('ventas'); setRoleDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm text-left hover:bg-slate-100 transition ${currentRole === 'ventas' ? 'bg-emerald-50 text-[#075E54] font-bold' : ''}`}
                >
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Ventas / Mostrador</span>
                </button>

                <button
                  onClick={() => { onSelectRole('produccion'); setRoleDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm text-left hover:bg-slate-100 transition ${currentRole === 'produccion' ? 'bg-amber-50 text-amber-800 font-bold' : ''}`}
                >
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Producción / Barra</span>
                </button>

                <button
                  onClick={() => { onSelectRole('repartidores'); setRoleDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm text-left hover:bg-slate-100 transition ${currentRole === 'repartidores' ? 'bg-sky-50 text-sky-800 font-bold' : ''}`}
                >
                  <Bike className="w-4 h-4 text-sky-600" />
                  <span>Repartidores (1 al 7)</span>
                </button>

                {currentRole === 'repartidores' && (
                  <div className="px-3 py-1.5 bg-slate-50 border-y border-slate-100 my-1">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Seleccionar Repartidor:</span>
                    <div className="grid grid-cols-7 gap-1">
                      {REPARTIDORES_INFO.map(r => (
                        <button
                          key={r.id}
                          onClick={() => {
                            onSelectRepartidorId(r.id);
                            setRoleDropdownOpen(false);
                          }}
                          className={`py-1 text-xs rounded font-bold transition ${selectedRepartidorId === r.id ? 'bg-[#075E54] text-white' : 'bg-white border text-slate-700 hover:bg-slate-100'}`}
                        >
                          {r.id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { onSelectRole('admin'); setRoleDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm text-left hover:bg-slate-100 transition ${currentRole === 'admin' ? 'bg-teal-50 text-[#075E54] font-bold' : ''}`}
                >
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Administrador / Dueño (Caja)</span>
                </button>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      onOpenClearDataModal();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Borrar datos / Supabase</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Actions: Quick Capture, Quick Install, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Order button (except strictly production where no distraction) */}
          {currentRole !== 'produccion' && (
            <button
              onClick={onOpenNewOrderModal}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#25D366] hover:bg-[#1eb956] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </button>
          )}

          {/* Botón de instalación rápida de la aplicación */}
          {!isInstalled && (
            <>
              {isInstallable && (
                <button
                  onClick={install}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-lg border border-emerald-600/40 transition active:scale-95"
                  title="Instalar en tu dispositivo"
                >
                  <Download className="w-4 h-4 text-[#25D366]" />
                  <span className="hidden md:inline">Instalar</span>
                </button>
              )}
              {isIOS && (
                <button
                  onClick={onOpenInstallGuide}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-lg border border-emerald-600/40 transition active:scale-95"
                  title="Cómo instalar en iPhone / iPad"
                >
                  <Smartphone className="w-4 h-4 text-[#25D366]" />
                  <span className="hidden md:inline">Instalar en iOS</span>
                </button>
              )}
            </>
          )}

          {/* Quick Database/Supabase / Clear Data icon */}
          <button
            onClick={onOpenClearDataModal}
            className="p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800/60 transition"
            title="Gestión de Datos y Supabase"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Botón de cierre de sesión */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-rose-900/50 hover:text-rose-200 text-emerald-100 border border-emerald-700/40 transition active:scale-95 text-xs sm:text-sm font-medium"
            title="Cerrar sesión y volver al inicio"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Salir</span>
          </button>
        </div>

      </div>
    </header>
  );
};
