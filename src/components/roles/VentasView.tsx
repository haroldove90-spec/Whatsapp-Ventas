import React, { useState } from 'react';
import { Order, RepartidorId } from '../../types';
import { REPARTIDORES_INFO } from '../../data/mockOrders';
import { 
  Store, 
  Search, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ArrowUpDown,
  Filter,
  CheckCheck,
  Bike
} from 'lucide-react';

interface VentasViewProps {
  orders: Order[];
  onOpenNewOrder: () => void;
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
}

export const VentasView: React.FC<VentasViewProps> = ({
  orders,
  onOpenNewOrder,
  onUpdateOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'adelantado' | 'contra_entrega' | 'transferencias' | 'en_proceso'>('todos');

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toString().includes(q);
      const matchClient = order.customerName.toLowerCase().includes(q);
      const matchAddress = order.businessNameOrAddress.toLowerCase().includes(q);
      const matchFlavor = order.items.some(i => i.flavor.toLowerCase().includes(q));
      if (!matchNum && !matchClient && !matchAddress && !matchFlavor) {
        return false;
      }
    }

    if (filterType === 'adelantado') {
      return order.paymentLocation === 'adelantado_ventas';
    }
    if (filterType === 'contra_entrega') {
      return order.paymentLocation === 'contra_entrega';
    }
    if (filterType === 'transferencias') {
      return order.paymentMethod === 'transferencia';
    }
    if (filterType === 'en_proceso') {
      return order.status !== 'entregado' && order.status !== 'cancelado';
    }

    return true;
  });

  // Calculate quick metrics
  const totalOrders = orders.length;
  const counterPaidCash = orders
    .filter(o => o.paymentLocation === 'adelantado_ventas' && o.paymentMethod === 'efectivo' && o.status !== 'cancelado')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingTransferCount = orders
    .filter(o => o.paymentMethod === 'transferencia' && o.transferStatus === 'por_transferir')
    .length;

  const handleToggleTransferStatus = (order: Order) => {
    const nextStatus = order.transferStatus === 'por_transferir' ? 'confirmada' : 'por_transferir';
    onUpdateOrder(order.id, { transferStatus: nextStatus });
  };

  const handleTogglePaymentLocation = (order: Order) => {
    if (order.paymentLocation === 'contra_entrega') {
      onUpdateOrder(order.id, {
        paymentLocation: 'adelantado_ventas',
        collectedBy: 'ventas_mostrador',
        cashCollectedAmount: order.paymentMethod === 'efectivo' ? order.totalAmount : 0
      });
    } else {
      onUpdateOrder(order.id, {
        paymentLocation: 'contra_entrega',
        collectedBy: null,
        cashCollectedAmount: 0
      });
    }
  };

  const handleReassignRepartidor = (orderId: string, repId: RepartidorId | null) => {
    onUpdateOrder(orderId, { assignedRepartidor: repId });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#075E54] flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                Mostrador / Ventas
              </h1>
              <p className="text-xs text-slate-500">
                Captura ultra rápida, control de cobro directo (7️⃣) y transferencias
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white font-bold text-sm shadow-md transition active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Captura Rápida de Pedido</span>
          </button>
        </div>

        {/* Mini metric counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Total del Día</span>
            <span className="text-xl font-extrabold text-slate-800 font-mono-numbers">{totalOrders}</span>
            <span className="text-[10px] text-slate-400 block">pedidos entrantes</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800 block">Cobro en Mostrador 7️⃣</span>
            <span className="text-xl font-extrabold text-[#075E54] font-mono-numbers">${counterPaidCash.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-700/80 block">efectivo adelantado</span>
          </div>

          <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100">
            <span className="text-[11px] font-semibold text-sky-800 block">Contra Entrega</span>
            <span className="text-xl font-extrabold text-sky-800 font-mono-numbers">
              {orders.filter(o => o.paymentLocation === 'contra_entrega').length}
            </span>
            <span className="text-[10px] text-sky-700/80 block">a cobrar por repartidores</span>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800 block">Transferencias Pend.</span>
            <span className="text-xl font-extrabold text-amber-800 font-mono-numbers">{pendingTransferCount}</span>
            <span className="text-[10px] text-amber-700/80 block">por validar comprobante</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por #pedido, cliente, dirección o sabor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] bg-slate-50/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'todos' ? 'bg-[#075E54] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilterType('en_proceso')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'en_proceso' ? 'bg-[#075E54] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En Proceso
          </button>
          <button
            onClick={() => setFilterType('adelantado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'adelantado' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            7️⃣ Pagado Ventas
          </button>
          <button
            onClick={() => setFilterType('contra_entrega')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'contra_entrega' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            🛵 Contra Entrega
          </button>
          <button
            onClick={() => setFilterType('transferencias')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'transferencias' ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
          >
            🏦 Transferencias
          </button>
        </div>
      </div>

      {/* Orders List / Cards Grid */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 font-medium">No se encontraron pedidos con estos filtros.</p>
            <button
              onClick={onOpenNewOrder}
              className="mt-3 px-4 py-2 bg-[#25D366] text-white rounded-lg text-xs font-bold hover:bg-[#1eb956]"
            >
              + Capturar Nuevo Pedido
            </button>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isDelivered = order.status === 'entregado';
            const isAdvancePaid = order.paymentLocation === 'adelantado_ventas';
            const isTransfer = order.paymentMethod === 'transferencia';
            const isPendingTransfer = isTransfer && order.transferStatus === 'por_transferir';

            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md ${
                  isAdvancePaid ? 'border-emerald-200/80 bg-linear-to-r from-emerald-50/20 to-white' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-base font-mono-numbers">
                        #{order.orderNumber}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.status === 'pendiente' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'en_preparacion' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'listo' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'en_ruta' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status === 'pendiente' ? '⏳ En cola' :
                         order.status === 'en_preparacion' ? '🔥 En barra' :
                         order.status === 'listo' ? '✨ Listo' :
                         order.status === 'en_ruta' ? '🛵 En ruta' :
                         '✅ Entregado'}
                      </span>

                      {/* Payment tag: 7️⃣ vs Contra Entrega */}
                      <button
                        onClick={() => handleTogglePaymentLocation(order)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                          isAdvancePaid 
                            ? 'bg-emerald-100 text-[#075E54] border-emerald-300 hover:bg-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                        }`}
                        title="Clic para cambiar entre Pagado a Ventas (7) o Contra Entrega"
                      >
                        {isAdvancePaid ? '7️⃣ Pagado Ventas' : '🛵 Contra Entrega'}
                      </button>

                      {/* Transfer Badge / Toggle */}
                      {isTransfer && (
                        <button
                          onClick={() => handleToggleTransferStatus(order)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
                            isPendingTransfer 
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                              : 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100'
                          }`}
                          title="Clic para conmutar estado de transferencia"
                        >
                          🏦 {isPendingTransfer ? '⏳ Por transferir' : '✅ Transf. Confirmada'}
                        </button>
                      )}
                    </div>

                    {/* Customer & Address */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs">
                      <span className="font-bold text-slate-800 text-sm">
                        {order.businessNameOrAddress}
                      </span>
                      {order.customerName && (
                        <span className="text-slate-500">
                          Contacto: <strong className="text-slate-700">{order.customerName}</strong>
                        </span>
                      )}
                      {order.customerPhone && (
                        <span className="text-slate-400 font-mono-numbers">
                          {order.customerPhone}
                        </span>
                      )}
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-medium">
                          <strong className="text-slate-900">{item.quantity}x</strong> {item.flavor} ({item.size})
                        </span>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/60 p-1.5 rounded-md italic">
                        Nota: {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Repartidor Assignment */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-extrabold text-[#075E54] font-mono-numbers block">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {order.paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                      </span>
                    </div>

                    {/* Repartidor selector dropdown */}
                    <div className="flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={order.assignedRepartidor || ''}
                        onChange={e => handleReassignRepartidor(order.id, e.target.value ? Number(e.target.value) as RepartidorId : null)}
                        className="text-xs font-semibold py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-[#25D366]"
                      >
                        <option value="">Ruta General</option>
                        {REPARTIDORES_INFO.map(r => (
                          <option key={r.id} value={r.id}>
                            Repartidor {r.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
