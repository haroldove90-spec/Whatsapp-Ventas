import React from 'react';
import { X, Share, PlusSquare, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Instalar Whatsapp Ventas</h3>
              <p className="text-[11px] text-emerald-100/80">Guía de instalación en iOS / Android / PC</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          
          {/* iOS Safari steps */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Smartphone className="w-4 h-4 text-[#075E54]" />
              <span>En iPhone o iPad (Safari):</span>
            </div>
            <ol className="space-y-1.5 list-decimal pl-4 leading-relaxed text-slate-600">
              <li>Abre esta app en el navegador <strong>Safari</strong>.</li>
              <li>
                Toca el botón <Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> <strong>Compartir</strong> en la barra inferior.
              </li>
              <li>
                Desliza hacia abajo y selecciona <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-800" /> <strong>Agregar a pantalla de inicio</strong>.
              </li>
              <li>¡Listo! La app aparecerá con su icono <strong>Whatsapp Ventas</strong> como app nativa.</li>
            </ol>
          </div>

          {/* Android / Chrome steps */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Smartphone className="w-4 h-4 text-[#25D366]" />
              <span>En Android (Chrome):</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Toca el botón verde <strong>"Instalar App"</strong> en la cabecera o el menú de 3 puntos de Chrome y elige <strong>"Instalar aplicación"</strong>.
            </p>
          </div>

          {/* Computer / Desktop steps */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Monitor className="w-4 h-4 text-slate-700" />
              <span>En Computadoras (Chrome / Edge):</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Haz clic en el icono de instalación en la barra de direcciones o en el botón "Instalar" de la barra lateral para usarla en ventana completa independiente.
            </p>
          </div>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#075E54] hover:bg-[#128C7E] text-white font-bold text-xs"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
