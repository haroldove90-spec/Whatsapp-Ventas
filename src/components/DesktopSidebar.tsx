import React from 'react';
import { UserRole, RepartidorId } from '../types';
import { REPARTIDORES_INFO } from '../data/mockOrders';
import { 
  Store, 
  Flame, 
  Bike, 
  ShieldCheck, 
  PlusCircle, 
  FileSpreadsheet, 
  Trash2, 
  Database, 
  LogOut, 
  Download,
  Users
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DesktopSidebarProps {
  currentRole: UserRole;
  selectedRepartidorId: RepartidorId;
  onSelectRole: (role: UserRole) => void;
  onSelectRepartidorId: (id: RepartidorId) => void;
  onOpenNewOrder: () => void;
  onOpenCorteCaja: () => void;
  onOpenClearDataModal: () => void;
  onLogout: () => void;
  pendingProductionCount: number;
  readyDeliveryCount: number;
  totalOrdersToday: number;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentRole,
  selectedRepartidorId,
  onSelectRole,
  onSelectRepartidorId,
  onOpenNewOrder,
  onOpenCorteCaja,
  onOpenClearDataModal,
  onLogout,
  pendingProductionCount,
  readyDeliveryCount,
  totalOrdersToday
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const navItems = [
    {
      id: 'ventas' as UserRole,
      label: 'Ventas / Mostrador',
      icon: Store,
      badge: `${totalOrdersToday} hoy`,
      badgeColor: 'bg-emerald-100 text-[#075E54]'
    },
    {
      id: 'produccion' as UserRole,
      label: 'Producción / Barra',
      icon: Flame,
      badge: pendingProductionCount > 0 ? `${pendingProductionCount} pendientes` : 'Al día',
      badgeColor: pendingProductionCount > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-600'
    },
    {
      id: 'repartidores' as UserRole,
      label: 'Repartidores (Ruta)',
      icon: Bike,
      badge: readyDeliveryCount > 0 ? `${readyDeliveryCount} listos` : '0 listos',
      badgeColor: readyDeliveryCount > 0 ? 'bg-sky-100 text-sky-800 font-bold' : 'bg-slate-100 text-slate-600'
    },
    {
      id: 'admin' as UserRole,
      label: 'Administrador / Caja',
      icon: ShieldCheck,
      badge: 'Corte',
      badgeColor: 'bg-emerald-50 text-[#075E54]'
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 select-none shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      
      {/* Top Action: Big New Order Button */}
      <div className="p-4 border-b border-slate-100">
        <button
          onClick={onOpenNewOrder}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white font-bold text-sm shadow-sm transition active:scale-[0.98]"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.2]" />
          <span>Capturar Pedido</span>
        </button>
      </div>

      {/* Main Navigation Modules */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Módulos Principales
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRole === item.id;
          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => onSelectRole(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#075E54] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#25D366]' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-white/20 text-white' : item.badgeColor}`}>
                  {item.badge}
                </span>
              </button>

              {/* Sub-menu if Repartidores is active: quick driver picker */}
              {isActive && item.id === 'repartidores' && (
                <div className="pl-4 pr-2 py-2 bg-slate-50 rounded-xl my-1 border border-slate-200/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Seleccionar Repartidor:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {REPARTIDORES_INFO.map(r => (
                      <button
                        key={r.id}
                        onClick={() => onSelectRepartidorId(r.id)}
                        className={`py-1 text-xs rounded-lg font-bold transition text-center ${
                          selectedRepartidorId === r.id
                            ? 'bg-[#075E54] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Rep {r.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Operational Shortcut: Corte de Caja */}
        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Operaciones Rápidas
          </div>

          <button
            onClick={onOpenCorteCaja}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#075E54] transition"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-[#128C7E]" />
              <span>Corte de Caja Diario</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-[#075E54] px-1.5 py-0.5 rounded">
              WhatsApp
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Actions: PWA Install, Clear Data, Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-1.5">
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[#075E54] font-semibold text-xs transition"
          >
            <Download className="w-4 h-4 text-[#075E54]" />
            <span>Instalar Aplicación PWA</span>
          </button>
        )}

        <button
          onClick={onOpenClearDataModal}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition text-left"
        >
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>Datos / Supabase</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition text-left"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Cambiar Rol / Salir</span>
        </button>
      </div>

    </aside>
  );
};
