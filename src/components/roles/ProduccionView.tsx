import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { Flame, CheckCircle, Clock, Volume2, VolumeX, Sparkles, Check, ArrowRight } from 'lucide-react';

interface ProduccionViewProps {
  orders: Order[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
}

export const ProduccionView: React.FC<ProduccionViewProps> = ({
  orders,
  onUpdateOrder
}) => {
  const [viewTab, setViewTab] = useState<'cola' | 'despachados'>('cola');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastDispatchedOrder, setLastDispatchedOrder] = useState<number | null>(null);

  // Filter orders for production screen:
  // Cola: pendiente or en_preparacion
  // Despachados: listo (recent)
  const pendingOrders = orders
    .filter(o => o.status === 'pendiente' || o.status === 'en_preparacion')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // First in, first out

  const recentlyDispatched = orders
    .filter(o => o.status === 'listo' || o.status === 'en_ruta')
    .sort((a, b) => new Date(b.readyAt || b.createdAt).getTime() - new Date(a.readyAt || a.createdAt).getTime())
    .slice(0, 16);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const handleMarkServed = (order: Order) => {
    playChime();
    setLastDispatchedOrder(order.orderNumber);
    setTimeout(() => {
      setLastDispatchedOrder(null);
    }, 2500);

    onUpdateOrder(order.id, {
      status: 'listo',
      readyAt: new Date().toISOString()
    });
  };

  const handleRevertToPending = (order: Order) => {
    onUpdateOrder(order.id, {
      status: 'en_preparacion'
    });
  };

  // Helper to format minutes elapsed
  const getElapsedMinutes = (isoString: string) => {
    const elapsedMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.max(1, Math.floor(elapsedMs / 60000));
    return mins;
  };

  return (
    <div className="space-y-4">
      
      {/* Top Bar Screen Control for Barra */}
      <div className="bg-[#075E54] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-inner">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Barra de Embotellado
              </h1>
              <span className="text-xs bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                {pendingOrders.length} en espera
              </span>
            </div>
            <p className="text-xs text-emerald-100/80">
              Toca la tarjeta para marcar Servido / Listo (😮) y avisar a repartidores
            </p>
          </div>
        </div>

        {/* Tab & Audio controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              soundEnabled ? 'bg-emerald-800 border-emerald-600 text-white' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
            }`}
            title="Sonido al despachar"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sonido On' : 'Silencio'}</span>
          </button>

          <div className="bg-emerald-900/80 p-1 rounded-xl flex gap-1 border border-emerald-700/50">
            <button
              onClick={() => setViewTab('cola')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewTab === 'cola' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Cola de Preparación ({pendingOrders.length})
            </button>
            <button
              onClick={() => setViewTab('despachados')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewTab === 'despachados' ? 'bg-white text-slate-900 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Despachados ({recentlyDispatched.length})
            </button>
          </div>
        </div>
      </div>

      {/* Dispatched banner toast */}
      {lastDispatchedOrder && (
        <div className="bg-[#25D366] text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-5 h-5" />
          <span>¡Pedido #{lastDispatchedOrder} servido y notificado a repartidores!</span>
        </div>
      )}

      {/* MAIN KITCHEN CARDS GRID */}
      {viewTab === 'cola' ? (
        pendingOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#075E54] flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">¡Barra limpia y al día!</h3>
            <p className="text-sm text-slate-500">No hay pedidos pendientes en la cola de embotellado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOrders.map((order, index) => {
              const elapsedMinutes = getElapsedMinutes(order.createdAt);
              const isUrgent = elapsedMinutes >= 15;
              const isOldest = index === 0;

              return (
                <div
                  key={order.id}
                  onClick={() => handleMarkServed(order)}
                  role="button"
                  tabIndex={0}
                  className={`group relative bg-white rounded-2xl border-2 p-5 text-left transition-all duration-150 cursor-pointer shadow-sm hover:shadow-xl active:scale-[0.98] flex flex-col justify-between select-none ${
                    isUrgent 
                      ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200' 
                      : isOldest 
                        ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-200' 
                        : 'border-slate-200 hover:border-[#25D366]'
                  }`}
                >
                  {/* Card Header: Order # & Elapsed Time */}
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 font-mono-numbers">
                          #{order.orderNumber}
                        </span>
                        {isOldest && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            Siguiente
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isUrgent ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Hace {elapsedMinutes} min</span>
                      </div>
                    </div>

                    {/* Customer Destination / Business name */}
                    <div className="mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Destino / Cliente:
                      </span>
                      <span className="text-sm font-bold text-slate-800 truncate block">
                        {order.businessNameOrAddress}
                      </span>
                      {order.assignedRepartidor && (
                        <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                          🛵 Repartidor {order.assignedRepartidor}
                        </span>
                      )}
                    </div>

                    {/* ITEMS LIST (Bold, large size & flavor) */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                              {item.flavor}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              Tamaño: <strong className="text-slate-800">{item.size}</strong>
                            </span>
                          </div>
                          
                          <div className="w-10 h-10 rounded-xl bg-[#075E54] text-white flex items-center justify-center font-mono-numbers font-black text-lg shadow-xs">
                            {item.quantity}x
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes if any */}
                    {order.notes && (
                      <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold mb-4">
                        ⚠️ NOTA: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* ONE TAP BUTTON: Servido / Listo (😮) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkServed(order);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white font-black text-base shadow-md group-hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">😮</span>
                      <span>SERVIDO / LISTO</span>
                    </button>
                    <span className="block text-center text-[10px] text-slate-400 mt-1.5 font-medium">
                      Toca aquí o cualquier parte de la tarjeta
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )
      ) : (
        /* RECIENTEMENTE DESPACHADOS */
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pedidos Despachados Recientemente (Últimos minutos)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyDispatched.map(order => (
              <div 
                key={order.id} 
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs opacity-90"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">#{order.orderNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ✨ Listo
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-1 truncate max-w-[200px]">
                    {order.items.map(i => `${i.quantity}x ${i.flavor} (${i.size})`).join(', ')}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {order.businessNameOrAddress}
                  </span>
                </div>

                <button
                  onClick={() => handleRevertToPending(order)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 transition"
                  title="Regresar a preparación si fue un error"
                >
                  Regresar a cola
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
