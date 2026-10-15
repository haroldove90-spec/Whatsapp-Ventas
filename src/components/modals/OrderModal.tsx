import React, { useState } from 'react';
import { Order, RepartidorId, PaymentLocation, PaymentMethod, TransferStatus } from '../../types';
import { FLAVORS, SIZES, REPARTIDORES_INFO, BUSINESSES_AND_CLIENTS } from '../../data/mockOrders';
import { X, Plus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => void;
  defaultRepartidorId?: RepartidorId | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultRepartidorId = null
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<string>(FLAVORS[0]);
  const [customFlavor, setCustomFlavor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>(SIZES[1].name); // default 1 Litro
  const [quantity, setQuantity] = useState<number>(1);
  const [customUnitPrice, setCustomUnitPrice] = useState<number>(SIZES[1].price);

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [businessNameOrAddress, setBusinessNameOrAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Asignación
  const [assignedRepartidor, setAssignedRepartidor] = useState<RepartidorId | null>(defaultRepartidorId);

  // Cobro directo
  const [paymentLocation, setPaymentLocation] = useState<PaymentLocation>('contra_entrega');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [transferStatus, setTransferStatus] = useState<TransferStatus>('confirmada');

  if (!isOpen) return null;

  const currentSizeObj = SIZES.find(s => s.name === selectedSize) || SIZES[1];
  const unitPrice = customUnitPrice > 0 ? customUnitPrice : currentSizeObj.price;
  const totalAmount = unitPrice * quantity;

  const handleSizeChange = (sizeName: string) => {
    setSelectedSize(sizeName);
    const found = SIZES.find(s => s.name === sizeName);
    if (found) {
      setCustomUnitPrice(found.price);
    }
  };

  const handleSelectQuickBusiness = (client: string, address: string) => {
    setCustomerName(client);
    setBusinessNameOrAddress(address);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFlavor = customFlavor.trim() ? customFlavor.trim() : selectedFlavor;
    
    if (!businessNameOrAddress.trim()) {
      alert('Por favor ingresa la dirección o nombre del negocio');
      return;
    }

    const isCounterDirect = paymentLocation === 'adelantado_ventas' && !assignedRepartidor;

    let collectedBy: Order['collectedBy'] = null;
    let cashCollectedAmount = 0;

    if (paymentLocation === 'adelantado_ventas') {
      collectedBy = 'ventas_mostrador';
      if (paymentMethod === 'efectivo') {
        cashCollectedAmount = totalAmount;
      }
    }

    onSubmit({
      customerName: customerName.trim() || 'Cliente Mostrador',
      customerPhone: customerPhone.trim() || undefined,
      businessNameOrAddress: businessNameOrAddress.trim(),
      items: [
        {
          flavor: finalFlavor,
          size: selectedSize,
          quantity,
          unitPrice
        }
      ],
      totalAmount,
      notes: notes.trim() || undefined,
      status: 'pendiente', // entra directo a la cola de barra/producción
      assignedRepartidor,
      paymentLocation,
      paymentMethod,
      transferStatus: paymentMethod === 'transferencia' ? transferStatus : 'no_aplica',
      collectedBy,
      cashCollectedAmount,
      isDirectCounterSale: isCounterDirect
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center font-black">
              +
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Captura Rápida de Pedido</h2>
              <p className="text-xs text-emerald-100/80">Entrada directa a barra de producción y ruta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Sabor (chips de selección rápida) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              1. Sabor de Bebida
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {FLAVORS.map(flavor => (
                <button
                  type="button"
                  key={flavor}
                  onClick={() => { setSelectedFlavor(flavor); setCustomFlavor(''); }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
                    selectedFlavor === flavor && !customFlavor
                      ? 'bg-[#075E54] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="O escribe otro sabor personalizado..."
              value={customFlavor}
              onChange={e => setCustomFlavor(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
            />
          </div>

          {/* Tamaño, Cantidad y Monto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {/* Tamaño */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Tamaño
              </label>
              <div className="space-y-1">
                {SIZES.map(s => (
                  <button
                    type="button"
                    key={s.name}
                    onClick={() => handleSizeChange(s.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition ${
                      selectedSize === s.name
                        ? 'bg-emerald-50 border-[#25D366] text-[#075E54]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="font-bold text-slate-900">${s.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cantidad
              </label>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 active:scale-95 text-base flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 text-center font-bold text-base py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366]"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 active:scale-95 text-base flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Calculado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total a Cobrar
              </label>
              <div className="mt-2 p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-center">
                <span className="text-xl sm:text-2xl font-extrabold text-[#075E54] font-mono-numbers">
                  ${totalAmount.toFixed(2)}
                </span>
                <span className="block text-[10px] text-emerald-800 font-medium">MXN</span>
              </div>
            </div>
          </div>

          {/* Cliente y Dirección / Negocio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                3. Cliente y Dirección / Negocio
              </label>
              {/* Quick autofill sample */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectQuickBusiness(BUSINESSES_AND_CLIENTS[0].client, BUSINESSES_AND_CLIENTS[0].address)}
                  className="text-[10px] text-[#075E54] hover:underline bg-emerald-50 px-1.5 py-0.5 rounded"
                >
                  + Taquería
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuickBusiness('Cliente Mostrador', 'Entrega en Mostrador / Barra')}
                  className="text-[10px] text-[#075E54] hover:underline bg-emerald-50 px-1.5 py-0.5 rounded"
                >
                  + Mostrador
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nombre del Cliente o Contacto"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366]"
              />
              <input
                type="text"
                placeholder="Teléfono / WhatsApp (opcional)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366]"
              />
            </div>

            <input
              type="text"
              required
              placeholder="Dirección completa o Negocio (ej. Tacos El Rey - Av. Central 420)"
              value={businessNameOrAddress}
              onChange={e => setBusinessNameOrAddress(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366] font-medium"
            />
          </div>

          {/* Asignación inicial: Repartidor 1-7 o General */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              4. Asignación de Ruta / Repartidor
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              <button
                type="button"
                onClick={() => setAssignedRepartidor(null)}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition text-center ${
                  assignedRepartidor === null
                    ? 'bg-[#075E54] text-white border-[#075E54] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Ruta Libre
              </button>
              {REPARTIDORES_INFO.map(r => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setAssignedRepartidor(r.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition text-center ${
                    assignedRepartidor === r.id
                      ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Rep {r.id}
                </button>
              ))}
            </div>
          </div>

          {/* Registro de Cobro Directo & Transferencias */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                5. Control de Cobro Directo
              </label>
              <span className="text-[11px] font-bold text-emerald-800">
                {paymentLocation === 'adelantado_ventas' ? '🟢 Pagado por Adelantado' : '🟡 Cobro en Destino'}
              </span>
            </div>

            {/* Switch adelantado (Emoji 7) vs Contra Entrega */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentLocation('adelantado_ventas')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  paymentLocation === 'adelantado_ventas'
                    ? 'bg-[#075E54] text-white border-[#075E54] shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">7️⃣</span>
                <span>Pagado a Ventas (Mostrador)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentLocation('contra_entrega')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  paymentLocation === 'contra_entrega'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">🛵</span>
                <span>Cobrar contra entrega</span>
              </button>
            </div>

            {/* Método de Pago y Transferencias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
              <div>
                <span className="block text-[11px] font-semibold text-slate-600 mb-1">Método:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border ${
                      paymentMethod === 'efectivo'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border ${
                      paymentMethod === 'transferencia'
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    🏦 Transferencia
                  </button>
                </div>
              </div>

              {/* Si es transferencia: Por transferir vs Transferencia confirmada */}
              {paymentMethod === 'transferencia' && (
                <div>
                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">Estado Transferencia:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTransferStatus('por_transferir')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border ${
                        transferStatus === 'por_transferir'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      ⏳ Por transferir
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferStatus('confirmada')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border ${
                        transferStatus === 'confirmada'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      ✅ Confirmada
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notas opcionales */}
          <div>
            <input
              type="text"
              placeholder="Notas para barra (ej. sin azúcar extra, poco hielo, entregar con cambio de $500)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#25D366]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#1eb956] text-white text-sm font-bold rounded-xl shadow-md transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar y Despachar a Barra</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
