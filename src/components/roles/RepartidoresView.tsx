import React, { useState } from 'react';
import { Order, RepartidorId } from '../../types';
import { REPARTIDORES_INFO } from '../../data/mockOrders';
import { getRepartidorPersonalSummary } from '../../services/storage';
import { 
  Bike, 
  PlusCircle, 
  Heart, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  DollarSign, 
  Wallet, 
  CheckCheck, 
  Users,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface RepartidoresViewProps {
  orders: Order[];
  selectedRepartidorId: RepartidorId;
  onSelectRepartidorId: (id: RepartidorId) => void;
  onOpenNewOrder: () => void;
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
}

export const RepartidoresView: React.FC<RepartidoresViewProps> = ({
  orders,
  selectedRepartidorId,
  onSelectRepartidorId,
  onOpenNewOrder,
  onUpdateOrder
}) => {
  const [activeTab, setActiveTab] = useState<'mis_pedidos' | 'ruta_general' | 'entregados'>('mis_pedidos');
  
  // 2-step delivery modal state
  const [orderToDeliver, setOrderToDeliver] = useState<Order | null>(null);

  const summary = getRepartidorPersonalSummary(orders, selectedRepartidorId);
  const currentRepartidorInfo = REPARTIDORES_INFO.find(r => r.id === selectedRepartidorId) || REPARTIDORES_INFO[0];

  // Orders assigned to this driver that are ready or in route
  const myActiveOrders = orders.filter(o => 
    o.assignedRepartidor === selectedRepartidorId && 
    (o.status === 'listo' || o.status === 'en_ruta')
  );

  // General unassigned orders ready for delivery
  const generalReadyOrders = orders.filter(o => 
    !o.assignedRepartidor && 
    o.status === 'listo'
  );

  // Orders delivered by this driver today
  const myDeliveredOrders = orders.filter(o => 
    o.status === 'entregado' && 
    o.collectedBy === `repartidor_${selectedRepartidorId}`
  );

  const handleTakeOrder = (order: Order) => {
    onUpdateOrder(order.id, {
      assignedRepartidor: selectedRepartidorId,
      status: 'en_ruta'
    });
  };

  const handleConfirmDelivery = (collectionType: 'efectivo_propio' | 'transferencia' | 'ya_pagado_ventas') => {
    if (!orderToDeliver) return;

    let collectedBy: Order['collectedBy'] = null;
    let paymentMethod = orderToDeliver.paymentMethod;
    let transferStatus = orderToDeliver.transferStatus;
    let cashCollectedAmount = 0;

    if (collectionType === 'efectivo_propio') {
      collectedBy = `repartidor_${selectedRepartidorId}`;
      paymentMethod = 'efectivo';
      cashCollectedAmount = orderToDeliver.totalAmount;
    } else if (collectionType === 'transferencia') {
      collectedBy = `repartidor_${selectedRepartidorId}`;
      paymentMethod = 'transferencia';
      transferStatus = 'confirmada';
    } else if (collectionType === 'ya_pagado_ventas') {
      collectedBy = 'ventas_mostrador';
      cashCollectedAmount = 0;
    }

    onUpdateOrder(orderToDeliver.id, {
      status: 'entregado',
      deliveredAt: new Date().toISOString(),
      collectedBy,
      paymentMethod,
      transferStatus,
      cashCollectedAmount
    });

    setOrderToDeliver(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Driver Selector Tabs (1 to 7) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Users className="w-4 h-4 text-[#075E54]" />
            <span>Turno Activo: Repartidor en Ruta</span>
          </div>
          <span className="text-[11px] font-bold text-[#075E54] bg-emerald-50 px-2 py-0.5 rounded-md">
            {currentRepartidorInfo.name}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {REPARTIDORES_INFO.map(r => (
            <button
              key={r.id}
              onClick={() => onSelectRepartidorId(r.id)}
              className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition active:scale-95 ${
                selectedRepartidorId === r.id
                  ? 'bg-[#075E54] text-white shadow-sm ring-2 ring-emerald-400/40'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              <Bike className="w-3.5 h-3.5 mb-0.5 opacity-80" />
              <span>Rep {r.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RESUMEN DE TURNO PERSONAL (Efectivo en mano y Entregas) */}
      <div className="bg-linear-to-r from-[#075E54] to-[#128C7E] text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Driver identity & cash in hand */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Wallet className="w-7 h-7 text-[#25D366]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold block">
                Efectivo en Mano (Turno de Hoy)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono-numbers text-white tracking-tight">
                  ${summary.cashOnHand.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-200">MXN</span>
              </div>
              <span className="text-[11px] text-emerald-100/80">
                Debes entregar este efectivo exacto en el corte de caja
              </span>
            </div>
          </div>

          {/* Quick Metrics & Levantamiento Móvil */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-center border border-white/10">
              <span className="text-xl font-bold font-mono-numbers block">{summary.deliveredCount}</span>
              <span className="text-[10px] text-emerald-100 uppercase tracking-wider">Entregados</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-center border border-white/10">
              <span className="text-xl font-bold font-mono-numbers block">{myActiveOrders.length}</span>
              <span className="text-[10px] text-emerald-100 uppercase tracking-wider">En Ruta</span>
            </div>

            <button
              onClick={onOpenNewOrder}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Levantar Pedido en Calle</span>
            </button>
          </div>

        </div>
      </div>

      {/* Tabs: Mis Pedidos Listos vs Ruta General vs Entregados */}
      <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTab('mis_pedidos')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition ${
            activeTab === 'mis_pedidos'
              ? 'bg-[#075E54] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Mis Asignados ({myActiveOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('ruta_general')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition relative ${
            activeTab === 'ruta_general'
              ? 'bg-[#075E54] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ruta Libre ({generalReadyOrders.length})
          {generalReadyOrders.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-900 font-extrabold">
              Tomar
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('entregados')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition ${
            activeTab === 'entregados'
              ? 'bg-[#075E54] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Historial ({myDeliveredOrders.length})
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: MIS PEDIDOS ASIGNADOS */}
      {activeTab === 'mis_pedidos' && (
        <div className="space-y-3">
          {myActiveOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Bike className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-700">No tienes pedidos pendientes en tu ruta</h4>
              <p className="text-xs text-slate-500 mt-1">
                Revisa la pestaña "Ruta Libre" para tomar pedidos recién salidos de barra o levanta uno nuevo.
              </p>
              <button
                onClick={() => setActiveTab('ruta_general')}
                className="mt-3 px-4 py-2 bg-[#075E54] text-white rounded-lg text-xs font-bold hover:bg-[#128C7E]"
              >
                Ver Pedidos de Ruta Libre ({generalReadyOrders.length})
              </button>
            </div>
          ) : (
            myActiveOrders.map(order => {
              const isAlreadyPaid = order.paymentLocation === 'adelantado_ventas';
              const isTransfer = order.paymentMethod === 'transferencia';

              return (
                <div 
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 font-mono-numbers">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#075E54]">
                          ✨ Listo para Entrega
                        </span>
                        {isAlreadyPaid && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                            7️⃣ Ya Pagó en Mostrador
                          </span>
                        )}
                        {isTransfer && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                            🏦 Transferencia
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-start gap-1.5 text-sm font-bold text-slate-800">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{order.businessNameOrAddress}</span>
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5 pl-5">
                        Cliente: <strong className="text-slate-700">{order.customerName}</strong>
                        {order.customerPhone && (
                          <a 
                            href={`https://wa.me/52${order.customerPhone}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="ml-2 text-[#075E54] hover:underline font-mono-numbers inline-flex items-center gap-0.5"
                          >
                            <Phone className="w-3 h-3 inline" /> {order.customerPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Amount to collect */}
                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-[#075E54] font-mono-numbers block">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isAlreadyPaid ? 'No cobrar (7)' : 'Cobrar en destino'}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-xs text-slate-700 font-semibold">
                        {item.quantity}x {item.flavor} ({item.size})
                      </span>
                    ))}
                    {order.notes && (
                      <span className="text-xs text-amber-800 italic block w-full mt-1">
                        Nota: {order.notes}
                      </span>
                    )}
                  </div>

                  {/* 2-TAP CONFIRM BUTTON (❤️ Entregado & Cobro) */}
                  <div className="pt-1">
                    <button
                      onClick={() => setOrderToDeliver(order)}
                      className="w-full py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm sm:text-base shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                      <span>CONFIRMAR ENTREGA Y COBRO</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: RUTA LIBRE (PEDIDOS LISTOS SIN ASIGNAR) */}
      {activeTab === 'ruta_general' && (
        <div className="space-y-3">
          {generalReadyOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <CheckCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-700">No hay pedidos sin asignar en ruta</h4>
              <p className="text-xs text-slate-500 mt-1">Todos los pedidos listos ya tienen repartidor.</p>
            </div>
          ) : (
            generalReadyOrders.map(order => (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 font-mono-numbers">#{order.orderNumber}</span>
                    <span className="text-xs font-bold text-slate-800">{order.businessNameOrAddress}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {order.items.map(i => `${i.quantity}x ${i.flavor} (${i.size})`).join(', ')}
                  </p>
                  <span className="text-xs font-bold text-[#075E54] font-mono-numbers mt-1 block">
                    Total: ${order.totalAmount.toFixed(2)} {order.paymentLocation === 'adelantado_ventas' ? '(Pagado 7)' : ''}
                  </span>
                </div>

                <button
                  onClick={() => handleTakeOrder(order)}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Bike className="w-4 h-4" />
                  <span>Tomar para mi ruta</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: HISTORIAL DEL TURNO */}
      {activeTab === 'entregados' && (
        <div className="space-y-2">
          {myDeliveredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-700">Aún no has registrado entregas en este turno</h4>
            </div>
          ) : (
            myDeliveredOrders.map(order => (
              <div 
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono-numbers">#{order.orderNumber}</span>
                    <span className="text-xs font-bold text-slate-700">{order.businessNameOrAddress}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Entregado
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {order.customerName} &bull; {order.items.map(i => `${i.quantity}x ${i.flavor}`).join(', ')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 font-mono-numbers block">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {order.paymentMethod === 'efectivo' ? '💵 Efectivo cobrado' : '🏦 Transferencia'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* STEP 2 MODAL: "¿QUIÉN COBRÓ?" */}
      {orderToDeliver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Confirmar Entrega #{orderToDeliver.orderNumber}
              </h3>
              <p className="text-xs text-slate-500">
                {orderToDeliver.businessNameOrAddress}
              </p>
              <div className="text-2xl font-black text-[#075E54] font-mono-numbers pt-1">
                ${orderToDeliver.totalAmount.toFixed(2)} MXN
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 text-center">
                Paso 2: ¿Quién cobró este pedido?
              </label>

              <div className="space-y-2">
                {/* Repartidor propio en efectivo */}
                <button
                  onClick={() => handleConfirmDelivery('efectivo_propio')}
                  className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-950 font-bold text-sm flex items-center justify-between transition active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💵</span>
                    <div className="text-left">
                      <span>Cobré en Efectivo (Repartidor {selectedRepartidorId})</span>
                      <span className="block text-[11px] text-emerald-700 font-normal">
                        Se sumará a tu corte de efectivo personal
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-mono-numbers">
                    +${orderToDeliver.totalAmount.toFixed(2)}
                  </span>
                </button>

                {/* Transferencia bancaria */}
                <button
                  onClick={() => handleConfirmDelivery('transferencia')}
                  className="w-full p-3 rounded-xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-teal-950 font-bold text-sm flex items-center justify-between transition active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🏦</span>
                    <div className="text-left">
                      <span>Transferencia Bancaria</span>
                      <span className="block text-[11px] text-teal-700 font-normal">
                        El cliente pagó por SPEI / Transferencia
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded font-semibold">
                    Banco
                  </span>
                </button>

                {/* Ya estaba pagado a ventas / mostrador */}
                <button
                  onClick={() => handleConfirmDelivery('ya_pagado_ventas')}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-sm flex items-center justify-between transition active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">7️⃣</span>
                    <div className="text-left">
                      <span>Ya estaba pagado a Ventas</span>
                      <span className="block text-[11px] text-slate-500 font-normal">
                        No cobras efectivo (ya cobrado en mostrador)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    Mostrador
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setOrderToDeliver(null)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg transition"
              >
                Cancelar y regresar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
