/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, RepartidorId, Order, DailyCashReport } from './types';
import { 
  loadOrders, 
  addOrder, 
  updateOrder, 
  getStoredRole, 
  setStoredRole, 
  getStoredRepartidorId, 
  setStoredRepartidorId,
  calculateDailyCashReport
} from './services/storage';

import { RolePicker } from './components/RolePicker';
import { AppHeader } from './components/AppHeader';
import { BottomBar } from './components/BottomBar';
import { DesktopSidebar } from './components/DesktopSidebar';

import { VentasView } from './components/roles/VentasView';
import { ProduccionView } from './components/roles/ProduccionView';
import { RepartidoresView } from './components/roles/RepartidoresView';
import { AdminCajaView } from './components/roles/AdminCajaView';

import { OrderModal } from './components/modals/OrderModal';
import { ClearDataModal } from './components/modals/ClearDataModal';
import { CorteCajaModal } from './components/modals/CorteCajaModal';
import { PWAInstallGuideModal } from './components/modals/PWAInstallGuideModal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const stored = getStoredRole();
    if (stored && ['ventas', 'produccion', 'repartidores', 'admin'].includes(stored)) {
      return stored as UserRole;
    }
    return null;
  });

  const [selectedRepartidorId, setSelectedRepartidorId] = useState<RepartidorId>(() => {
    return getStoredRepartidorId();
  });

  const [orders, setOrders] = useState<Order[]>(() => loadOrders());

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isCorteCajaModalOpen, setIsCorteCajaModalOpen] = useState(false);
  const [isInstallGuideModalOpen, setIsInstallGuideModalOpen] = useState(false);

  // Sync orders with custom storage events
  useEffect(() => {
    const handleStorageUpdate = () => {
      setOrders(loadOrders());
    };
    window.addEventListener('whatsapp_ventas_orders_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('whatsapp_ventas_orders_updated', handleStorageUpdate);
    };
  }, []);

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setStoredRole(role);
  };

  const handleSelectRepartidorId = (id: RepartidorId) => {
    setSelectedRepartidorId(id);
    setStoredRepartidorId(id);
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setStoredRole(null);
  };

  const handleCreateOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    addOrder(orderData);
    setOrders(loadOrders());
  };

  const handleUpdateOrder = (id: string, updates: Partial<Order>) => {
    updateOrder(id, updates);
    setOrders(loadOrders());
  };

  // Counters for UI notifications
  const pendingProductionCount = orders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion').length;
  const readyDeliveryCount = orders.filter(o => o.status === 'listo').length;
  const totalOrdersToday = orders.length;

  const dailyReport: DailyCashReport = calculateDailyCashReport(orders);

  // 1. Initial State: Role Picker (Clean 2 Col Mobile / 4 Col Desktop Grid without Header)
  if (!currentRole) {
    return (
      <>
        <RolePicker 
          onSelectRole={handleSelectRole} 
          onOpenInstallGuide={() => setIsInstallGuideModalOpen(true)}
        />
        <PWAInstallGuideModal
          isOpen={isInstallGuideModalOpen}
          onClose={() => setIsInstallGuideModalOpen(false)}
        />
      </>
    );
  }

  // 2. Active Role Workspace with Unified Header, Desktop Sidebar & Mobile Bottom Bar
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans selection:bg-[#25D366] selection:text-white">
      
      {/* Cabecera Institucional Unificada */}
      <AppHeader
        currentRole={currentRole}
        selectedRepartidorId={selectedRepartidorId}
        onSelectRole={handleSelectRole}
        onSelectRepartidorId={handleSelectRepartidorId}
        onLogout={handleLogout}
        onOpenNewOrderModal={() => setIsOrderModalOpen(true)}
        onOpenClearDataModal={() => setIsClearDataModalOpen(true)}
        onOpenInstallGuide={() => setIsInstallGuideModalOpen(true)}
        ordersCount={totalOrdersToday}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Menú Lateral Desplegable en Escritorio */}
        <DesktopSidebar
          currentRole={currentRole}
          selectedRepartidorId={selectedRepartidorId}
          onSelectRole={handleSelectRole}
          onSelectRepartidorId={handleSelectRepartidorId}
          onOpenNewOrder={() => setIsOrderModalOpen(true)}
          onOpenCorteCaja={() => setIsCorteCajaModalOpen(true)}
          onOpenClearDataModal={() => setIsClearDataModalOpen(true)}
          onLogout={handleLogout}
          pendingProductionCount={pendingProductionCount}
          readyDeliveryCount={readyDeliveryCount}
          totalOrdersToday={totalOrdersToday}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-3.5 sm:p-6 pb-24 lg:pb-8 min-w-0">
          {currentRole === 'ventas' && (
            <VentasView
              orders={orders}
              onOpenNewOrder={() => setIsOrderModalOpen(true)}
              onUpdateOrder={handleUpdateOrder}
            />
          )}

          {currentRole === 'produccion' && (
            <ProduccionView
              orders={orders}
              onUpdateOrder={handleUpdateOrder}
            />
          )}

          {currentRole === 'repartidores' && (
            <RepartidoresView
              orders={orders}
              selectedRepartidorId={selectedRepartidorId}
              onSelectRepartidorId={handleSelectRepartidorId}
              onOpenNewOrder={() => setIsOrderModalOpen(true)}
              onUpdateOrder={handleUpdateOrder}
            />
          )}

          {currentRole === 'admin' && (
            <AdminCajaView
              orders={orders}
              onOpenNewOrder={() => setIsOrderModalOpen(true)}
              onUpdateOrder={handleUpdateOrder}
            />
          )}
        </main>

      </div>

      {/* Navegación Móvil y Tablet (Bottom Bar) */}
      <BottomBar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        onOpenNewOrder={() => setIsOrderModalOpen(true)}
        pendingProductionCount={pendingProductionCount}
        readyDeliveryCount={readyDeliveryCount}
      />

      {/* MODALS */}
      
      {/* 1. Fast Order Capture Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmit={handleCreateOrder}
        defaultRepartidorId={currentRole === 'repartidores' ? selectedRepartidorId : null}
      />

      {/* 2. Clear System Demo Data & Supabase Bridge Modal */}
      <ClearDataModal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onDataChanged={() => setOrders(loadOrders())}
      />

      {/* 3. Corte de Caja WhatsApp Export Modal */}
      <CorteCajaModal
        isOpen={isCorteCajaModalOpen}
        onClose={() => setIsCorteCajaModalOpen(false)}
        report={dailyReport}
      />

      {/* 4. PWA Installation Guide Modal for iOS & Desktop */}
      <PWAInstallGuideModal
        isOpen={isInstallGuideModalOpen}
        onClose={() => setIsInstallGuideModalOpen(false)}
      />

    </div>
  );
}
