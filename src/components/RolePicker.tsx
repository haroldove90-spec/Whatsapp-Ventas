import React from 'react';
import { UserRole } from '../types';
import { Store, Flame, Bike, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface RolePickerProps {
  onSelectRole: (role: UserRole) => void;
  onOpenInstallGuide?: () => void;
}

export const RolePicker: React.FC<RolePickerProps> = ({ onSelectRole, onOpenInstallGuide }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const roles: { id: UserRole; name: string; icon: React.ReactNode; color: string; badge?: string }[] = [
    {
      id: 'ventas',
      name: 'Ventas / Mostrador',
      icon: <Store className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8]" />,
      color: 'bg-emerald-50 text-[#075E54] border-emerald-200 hover:border-[#25D366] hover:bg-emerald-100/60'
    },
    {
      id: 'produccion',
      name: 'Producción / Barra',
      icon: <Flame className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8]" />,
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-500 hover:bg-amber-100/60'
    },
    {
      id: 'repartidores',
      name: 'Repartidores',
      icon: <Bike className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8]" />,
      color: 'bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-500 hover:bg-blue-100/60',
      badge: '7 en ruta'
    },
    {
      id: 'admin',
      name: 'Administrador / Dueño',
      icon: <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8]" />,
      color: 'bg-teal-50 text-[#075E54] border-teal-200 hover:border-[#128C7E] hover:bg-teal-100/60',
      badge: 'Caja'
    }
  ];

  return (
    <div className="min-h-screen wa-pattern-bg flex flex-col justify-center items-center p-4 sm:p-8">
      {/* Discreet installation utility when on root screen */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#075E54] flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Whatsapp Ventas</span>
        </div>

        {!isInstalled && (
          <div className="flex items-center gap-2">
            {isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#1eb956] shadow-sm transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar App
              </button>
            )}
            {isIOS && onOpenInstallGuide && (
              <button
                onClick={onOpenInstallGuide}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#075E54]" />
                Instalar en iOS
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid 2 Columnas Móvil / 4 Columnas Escritorio: Tarjetas limpias, sin header, sin descripciones, solo nombre del rol y el logo */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`group relative flex flex-col items-center justify-center p-6 sm:p-10 rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl active:scale-[0.98] ${role.color} min-h-[190px] sm:min-h-[260px]`}
            >
              {role.badge && (
                <span className="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 shadow-xs border border-slate-200">
                  {role.badge}
                </span>
              )}
              
              <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-transform duration-200 flex items-center justify-center mb-4 sm:mb-6">
                {role.icon}
              </div>

              <span className="text-base sm:text-xl font-bold text-center tracking-tight text-slate-800 group-hover:text-[#075E54] transition-colors leading-snug">
                {role.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
