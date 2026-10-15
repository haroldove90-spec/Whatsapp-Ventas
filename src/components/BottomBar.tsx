import React from 'react';
import { UserRole } from '../types';
import { Store, Flame, Bike, ShieldCheck, Plus } from 'lucide-react';

interface BottomBarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenNewOrder: () => void;
  pendingProductionCount: number;
  readyDeliveryCount: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentRole,
  onSelectRole,
  onOpenNewOrder,
  pendingProductionCount,
  readyDeliveryCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        
        {/* Ventas */}
        <button
          onClick={() => onSelectRole('ventas')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors ${currentRole === 'ventas' ? 'text-[#075E54] font-bold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <div className="relative">
            <Store className={`w-5 h-5 ${currentRole === 'ventas' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Ventas</span>
        </button>

        {/* Producción */}
        <button
          onClick={() => onSelectRole('produccion')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors ${currentRole === 'produccion' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <div className="relative">
            <Flame className={`w-5 h-5 ${currentRole === 'produccion' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {pendingProductionCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingProductionCount > 9 ? '9+' : pendingProductionCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Barra</span>
        </button>

        {/* Floating Quick Action: Nuevo Pedido */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenNewOrder}
            className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-[#1eb956]"
            aria-label="Registrar Nuevo Pedido"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Repartidores */}
        <button
          onClick={() => onSelectRole('repartidores')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors ${currentRole === 'repartidores' ? 'text-sky-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <div className="relative">
            <Bike className={`w-5 h-5 ${currentRole === 'repartidores' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {readyDeliveryCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-sky-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {readyDeliveryCount > 9 ? '9+' : readyDeliveryCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Reparto</span>
        </button>

        {/* Admin / Caja */}
        <button
          onClick={() => onSelectRole('admin')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors ${currentRole === 'admin' ? 'text-[#075E54] font-bold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <div className="relative">
            <ShieldCheck className={`w-5 h-5 ${currentRole === 'admin' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Caja</span>
        </button>

      </div>
    </nav>
  );
};
