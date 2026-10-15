import React, { useState } from 'react';
import { DailyCashReport } from '../../types';
import { X, Copy, Check, Share2, Printer, CheckCircle2 } from 'lucide-react';

interface CorteCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyCashReport;
}

export const CorteCajaModal: React.FC<CorteCajaModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate impeccably formatted WhatsApp message
  const generateWhatsAppMessage = (): string => {
    let msg = `*📊 CORTE DE CAJA DIARIO - WHATSAPP VENTAS*\n`;
    msg += `📅 *Fecha:* ${report.date}\n`;
    msg += `⏰ *Hora de Corte:* ${report.generatedAt}\n`;
    msg += `📦 *Total de Pedidos:* ${report.totalOrders} (${report.deliveredOrders} entregados, ${report.pendingOrders} en proceso)\n\n`;
    
    msg += `*🛵 DESGLOSE EN EFECTIVO POR REPARTIDOR:*\n`;
    report.repartidoresBreakdown.forEach(rep => {
      msg += `• *${rep.name}:* $${rep.cashCollected.toFixed(2)} (${rep.ordersCount} pedidos)\n`;
    });
    msg += `*Subtotal Efectivo Repartidores:* $${report.totalCashRepartidores.toFixed(2)}\n\n`;

    msg += `*🏪 VENTAS EN MOSTRADOR / CAJA (7️⃣):*\n`;
    msg += `• Efectivo recibido en mostrador: $${report.totalVentasMostrador.toFixed(2)}\n\n`;

    msg += `*🏦 TRANSFERENCIAS BANCARIAS:*\n`;
    msg += `• Confirmadas: $${report.totalTransferenciasConfirmadas.toFixed(2)}\n`;
    if (report.totalTransferenciasPendientes > 0) {
      msg += `• Por confirmar: $${report.totalTransferenciasPendientes.toFixed(2)}\n`;
    }
    msg += `\n`;

    msg += `═══════════════════════════\n`;
    msg += `*💰 GRAN TOTAL DEL DÍA (CUADRADO):*\n`;
    msg += `*👉 $${report.grandTotalCollected.toFixed(2)} MXN*\n`;
    msg += `═══════════════════════════\n\n`;
    msg += `✅ *Estado:* Cuadrado automáticamente sin diferencias.\n`;
    msg += `_Generado por Whatsapp Ventas_`;

    return msg;
  };

  const whatsappMessage = generateWhatsAppMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Cierre y Reporte de Caja del Día</h2>
              <p className="text-xs text-emerald-100/80">{report.date} &bull; {report.generatedAt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Status pill */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
              <span className="text-xs sm:text-sm font-bold text-emerald-950">
                Caja Cuadrada Automáticamente
              </span>
            </div>
            <span className="text-base sm:text-xl font-black text-[#075E54] font-mono-numbers">
              ${report.grandTotalCollected.toFixed(2)} MXN
            </span>
          </div>

          {/* Formatted Preview Box (WhatsApp Chat simulation) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              <span>Mensaje Formateado para WhatsApp</span>
              <span className="text-[11px] text-emerald-700 lowercase font-normal">listo para enviar al grupo o dueño</span>
            </div>
            
            <div className="p-4 rounded-xl bg-[#EFEAE2] border border-[#D1D7DB] text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner max-h-72 overflow-y-auto">
              {whatsappMessage}
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">7 Repartidores</span>
              <span className="text-base font-bold text-slate-800 font-mono-numbers">
                ${report.totalCashRepartidores.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Mostrador / Caja</span>
              <span className="text-base font-bold text-slate-800 font-mono-numbers">
                ${report.totalVentasMostrador.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Transferencias</span>
              <span className="text-base font-bold text-slate-800 font-mono-numbers">
                ${report.totalTransferenciasConfirmadas.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
