import React, { useState } from 'react';
import { Order, DailyCashReport, RepartidorId } from '../../types';
import { calculateDailyCashReport } from '../../services/storage';
import { CorteCajaModal } from '../modals/CorteCajaModal';
import { 
  ShieldCheck, 
  DollarSign, 
  Bike, 
  Store, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Flame, 
  FileSpreadsheet, 
  Share2, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface AdminCajaViewProps {
  orders: Order[];
  onOpenNewOrder: () => void;
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
}

export const AdminCajaView: React.FC<AdminCajaViewProps> = ({
  orders,
  onOpenNewOrder,
  onUpdateOrder
}) => {
  const [isCorteModalOpen, setIsCorteModalOpen] = useState(false);
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<RepartidorId | 'mostrador' | 'transferencias' | null>(null);

  const report: DailyCashReport = calculateDailyCashReport(orders);

  // Status breakdown for the 150-200 daily orders monitor
  const countPendientes = orders.filter(o => o.status === 'pendiente').length;
  const countPreparacion = orders.filter(o => o.status === 'en_preparacion').length;
  const countEnRutaOListo = orders.filter(o => o.status === 'listo' || o.status === 'en_ruta').length;
  const countEntregados = orders.filter(o => o.status === 'entregado').length;
  const totalCount = orders.length;

  const deliveredPercentage = totalCount > 0 ? Math.round((countEntregados / totalCount) * 100) : 0;

  // Filtered orders for inspector drawer
  const getInspectOrders = () => {
    if (selectedDriverFilter === null) return [];
    if (selectedDriverFilter === 'mostrador') {
      return orders.filter(o => 
        (o.collectedBy === 'ventas_mostrador' || o.paymentLocation === 'adelantado_ventas') &&
        o.paymentMethod === 'efectivo'
      );
    }
    if (selectedDriverFilter === 'transferencias') {
      return orders.filter(o => o.paymentMethod === 'transferencia');
    }
    return orders.filter(o => 
      o.status === 'entregado' && 
      o.collectedBy === `repartidor_${selectedDriverFilter}` &&
      o.paymentMethod === 'efectivo'
    );
  };

  const inspectOrders = getInspectOrders();

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Administrador & Botón Cerrar Caja del Día */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#075E54] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                Administración y Corte de Caja
              </h1>
              <span className="text-xs bg-emerald-100 text-[#075E54] font-bold px-2 py-0.5 rounded-full">
                Cuadrado en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Supervisión de pedidos del día y liquidación exacta de efectivo por repartidor
            </p>
          </div>
        </div>

        {/* Big Action: Cerrar Caja del Día */}
        <button
          onClick={() => setIsCorteModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#075E54] hover:bg-[#128C7E] text-white font-extrabold text-sm sm:text-base shadow-md transition active:scale-95 cursor-pointer"
        >
          <FileSpreadsheet className="w-5 h-5 text-[#25D366]" />
          <span>Cerrar Caja del Día (Reporte WhatsApp)</span>
        </button>
      </div>

      {/* 1. TABLERO EN VIVO: MONITOR GLOBAL DE 150 A 200 PEDIDOS DEL DÍA */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#128C7E]" />
              <span>Monitor en Vivo: Avance Diario ({totalCount} pedidos)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Flujo en tiempo real desde recepción hasta entrega final
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#075E54] font-mono-numbers">
              {deliveredPercentage}%
            </span>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Completado</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${totalCount ? (countEntregados / totalCount) * 100 : 0}%` }}
            className="bg-[#25D366] h-full transition-all duration-500"
            title={`Entregados: ${countEntregados}`}
          />
          <div 
            style={{ width: `${totalCount ? (countEnRutaOListo / totalCount) * 100 : 0}%` }}
            className="bg-sky-500 h-full transition-all duration-500"
            title={`En Ruta / Listos: ${countEnRutaOListo}`}
          />
          <div 
            style={{ width: `${totalCount ? (countPreparacion / totalCount) * 100 : 0}%` }}
            className="bg-amber-400 h-full transition-all duration-500"
            title={`En Preparación: ${countPreparacion}`}
          />
          <div 
            style={{ width: `${totalCount ? (countPendientes / totalCount) * 100 : 0}%` }}
            className="bg-slate-300 h-full transition-all duration-500"
            title={`Pendientes: ${countPendientes}`}
          />
        </div>

        {/* 4 Buckets Monitor */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Pendientes */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>⏳ Pendientes Cola</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono-numbers">{countPendientes}</div>
            <span className="text-[10px] text-slate-400">Por iniciar en barra</span>
          </div>

          {/* En Preparación */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
              <span>🔥 En Preparación</span>
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900 font-mono-numbers">{countPreparacion}</div>
            <span className="text-[10px] text-amber-700/80">Embotellándose en barra</span>
          </div>

          {/* Listos / En Ruta */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200">
            <div className="flex items-center justify-between text-sky-800 text-xs font-semibold mb-1">
              <span>🛵 En Ruta / Listos</span>
              <Bike className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-900 font-mono-numbers">{countEnRutaOListo}</div>
            <span className="text-[10px] text-sky-700/80">En camino o por salir</span>
          </div>

          {/* Entregados */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
              <span>✅ Entregados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-[#075E54] font-mono-numbers">{countEntregados}</div>
            <span className="text-[10px] text-emerald-700/80">Entregados con éxito</span>
          </div>
        </div>
      </div>

      {/* 2. MÓDULO DE CORTE DE CAJA DIARIO (EL DOLOR PRINCIPAL DEL CLIENTE) */}
      <div className="space-y-4">
        
        {/* Gran Total Cuadrado Header */}
        <div className="bg-linear-to-br from-[#075E54] via-[#128C7E] to-[#0b4d45] text-white p-6 rounded-2xl shadow-lg border border-emerald-700/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#25D366] block">
                Corte de Caja Diario Automatizado
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-5xl font-black font-mono-numbers text-white tracking-tight">
                  ${report.grandTotalCollected.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-emerald-200">MXN</span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Total cuadrado automáticamente sumando 7 repartidores + mostrador + transferencias</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCorteModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white font-extrabold text-sm shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Generar Mensaje WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* DESGLOSE AUTOMÁTICO POR CADA REPARTIDOR (1 AL 7) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <Bike className="w-4 h-4 text-[#075E54]" />
              <span>Desglose de Efectivo en Mano por Repartidor (1 al 7)</span>
            </h3>
            <span className="text-xs font-bold text-[#075E54] bg-emerald-50 px-2.5 py-1 rounded-lg">
              Subtotal Repartidores: ${report.totalCashRepartidores.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.repartidoresBreakdown.map(rep => {
              const isSelected = selectedDriverFilter === rep.repartidorId;

              return (
                <div
                  key={rep.repartidorId}
                  onClick={() => setSelectedDriverFilter(isSelected ? null : rep.repartidorId)}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all shadow-xs hover:shadow-md ${
                    isSelected ? 'border-[#075E54] ring-2 ring-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                        R{rep.repartidorId}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                        {rep.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {rep.ordersCount} pedidos
                    </span>
                  </div>

                  <div className="mt-1">
                    <span className="text-xl sm:text-2xl font-black text-[#075E54] font-mono-numbers block">
                      ${rep.cashCollected.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Efectivo en mano a entregar
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#075E54] font-semibold">
                    <span>{isSelected ? 'Ocultar pedidos' : 'Ver pedidos'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DESGLOSE MOSTRADOR Y TRANSFERENCIAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          
          {/* Ventas en Mostrador / Caja */}
          <div 
            onClick={() => setSelectedDriverFilter(selectedDriverFilter === 'mostrador' ? null : 'mostrador')}
            className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition shadow-xs hover:shadow-md ${
              selectedDriverFilter === 'mostrador' ? 'border-[#075E54] ring-2 ring-emerald-200 bg-emerald-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#075E54] flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Total Recaudado por Ventas en Mostrador (7️⃣)</h4>
                  <span className="text-[11px] text-slate-500">Cobrado directamente en caja por adelantado</span>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#075E54] font-mono-numbers block">
                ${report.totalVentasMostrador.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">Efectivo en caja central</span>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#075E54] font-semibold">
              <span>{selectedDriverFilter === 'mostrador' ? 'Ocultar ventas' : 'Inspeccionar ventas mostrador'}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedDriverFilter === 'mostrador' ? 'rotate-90' : ''}`} />
            </div>
          </div>

          {/* Transferencias Bancarias */}
          <div 
            onClick={() => setSelectedDriverFilter(selectedDriverFilter === 'transferencias' ? null : 'transferencias')}
            className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition shadow-xs hover:shadow-md ${
              selectedDriverFilter === 'transferencias' ? 'border-[#075E54] ring-2 ring-emerald-200 bg-emerald-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <span className="font-bold text-sm">🏦</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Total Ingresado por Transferencias Bancarias</h4>
                  <span className="text-[11px] text-slate-500">Depósitos directos a cuenta bancaria</span>
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-teal-800 font-mono-numbers block">
                  ${report.totalTransferenciasConfirmadas.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-700 font-medium">✅ Confirmadas en cuenta</span>
              </div>

              {report.totalTransferenciasPendientes > 0 && (
                <div className="text-right">
                  <span className="text-base font-bold text-amber-700 font-mono-numbers block">
                    ${report.totalTransferenciasPendientes.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-amber-600 font-medium">⏳ Por confirmar</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold">
              <span>{selectedDriverFilter === 'transferencias' ? 'Ocultar transferencias' : 'Ver transferencias'}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedDriverFilter === 'transferencias' ? 'rotate-90' : ''}`} />
            </div>
          </div>

        </div>

        {/* DETALLE INSPECCIONADO CUANDO SE TOCA UN REPARTIDOR O MOSTRADOR */}
        {selectedDriverFilter !== null && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pedidos auditados: {selectedDriverFilter === 'mostrador' ? 'Ventas Mostrador' : selectedDriverFilter === 'transferencias' ? 'Transferencias' : `Repartidor ${selectedDriverFilter}`} ({inspectOrders.length})
              </span>
              <button
                onClick={() => setSelectedDriverFilter(null)}
                className="text-xs text-slate-400 hover:text-slate-700 underline"
              >
                Cerrar vista
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {inspectOrders.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No hay pedidos registrados para este filtro.</p>
              ) : (
                inspectOrders.map(o => (
                  <div key={o.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 font-mono-numbers mr-2">#{o.orderNumber}</span>
                      <span className="text-slate-700">{o.businessNameOrAddress}</span>
                      <span className="text-slate-400 block text-[10px]">{o.items.map(i => `${i.quantity}x ${i.flavor}`).join(', ')}</span>
                    </div>
                    <span className="font-extrabold text-[#075E54] font-mono-numbers">
                      ${o.totalAmount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modal de Corte de Caja Diario (Reporte WhatsApp) */}
      <CorteCajaModal
        isOpen={isCorteModalOpen}
        onClose={() => setIsCorteModalOpen(false)}
        report={report}
      />

    </div>
  );
};
