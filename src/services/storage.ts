import { Order, DailyCashReport, RepartidorSummary, RepartidorId } from '../types';
import { generateInitialOrders, REPARTIDORES_INFO } from '../data/mockOrders';

const STORAGE_ORDERS_KEY = 'whatsapp_ventas_orders_v1';
const STORAGE_CLEARED_FLAG = 'whatsapp_ventas_cleared_demo';
const STORAGE_SUPABASE_CFG = 'whatsapp_ventas_supabase_config';
const STORAGE_ACTIVE_ROLE = 'whatsapp_ventas_active_role';
const STORAGE_ACTIVE_REPARTIDOR = 'whatsapp_ventas_active_repartidor_id';

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  tableName: string;
  isConnected: boolean;
  lastSync?: string;
}

export function isDemoCleared(): boolean {
  try {
    return localStorage.getItem(STORAGE_CLEARED_FLAG) === 'true';
  } catch {
    return false;
  }
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading orders from localStorage', e);
  }

  // If user previously chose to clear demo data, do not restore demo data!
  if (isDemoCleared()) {
    return [];
  }

  // First time initialization: generate demo data
  const initial = generateInitialOrders();
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(initial));
  } catch (e) {
    console.error('Error caching initial demo orders', e);
  }
  return initial;
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    // Trigger custom event so reactive components update across tabs or modules
    window.dispatchEvent(new Event('whatsapp_ventas_orders_updated'));
  } catch (e) {
    console.error('Error saving orders', e);
  }
}

export function addOrder(newOrder: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
  const current = loadOrders();
  const maxNumber = current.reduce((max, o) => Math.max(max, o.orderNumber || 1000), 1000);
  const orderNumber = maxNumber + 1;
  const id = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const createdOrder: Order = {
    ...newOrder,
    id,
    orderNumber,
    createdAt: new Date().toISOString()
  };

  const updated = [createdOrder, ...current];
  saveOrders(updated);
  return createdOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const current = loadOrders();
  const index = current.findIndex(o => o.id === id);
  if (index === -1) return null;

  const existing = current[index];
  const updatedOrder: Order = {
    ...existing,
    ...updates
  };

  current[index] = updatedOrder;
  saveOrders(current);
  return updatedOrder;
}

export function deleteOrder(id: string): boolean {
  const current = loadOrders();
  const filtered = current.filter(o => o.id !== id);
  if (filtered.length !== current.length) {
    saveOrders(filtered);
    return true;
  }
  return false;
}

export function clearAllSystemData(): void {
  try {
    localStorage.setItem(STORAGE_CLEARED_FLAG, 'true');
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('whatsapp_ventas_orders_updated'));
  } catch (e) {
    console.error('Error clearing data', e);
  }
}

export function restoreDemoData(): Order[] {
  try {
    localStorage.removeItem(STORAGE_CLEARED_FLAG);
    const demo = generateInitialOrders();
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(demo));
    window.dispatchEvent(new Event('whatsapp_ventas_orders_updated'));
    return demo;
  } catch (e) {
    console.error('Error restoring demo', e);
    return [];
  }
}

export function calculateDailyCashReport(orders: Order[]): DailyCashReport {
  const now = new Date();
  const todayStr = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const repartidoresBreakdown = REPARTIDORES_INFO.map(rep => {
    // Orders where this delivery driver collected cash in hand
    const driverCollectedOrders = orders.filter(o => 
      o.status === 'entregado' &&
      o.collectedBy === `repartidor_${rep.id}` &&
      o.paymentMethod === 'efectivo'
    );

    const cashCollected = driverCollectedOrders.reduce((sum, o) => 
      sum + (o.cashCollectedAmount !== undefined ? o.cashCollectedAmount : o.totalAmount), 0
    );

    return {
      repartidorId: rep.id,
      name: rep.name,
      cashCollected,
      ordersCount: driverCollectedOrders.length
    };
  });

  const totalCashRepartidores = repartidoresBreakdown.reduce((sum, r) => sum + r.cashCollected, 0);

  // Total recaudado por Ventas en mostrador/caja (efectivo pagado por adelantado o ventas de mostrador)
  const counterCashOrders = orders.filter(o => 
    (o.collectedBy === 'ventas_mostrador' || o.paymentLocation === 'adelantado_ventas') &&
    o.paymentMethod === 'efectivo' &&
    o.status !== 'cancelado'
  );
  const totalVentasMostrador = counterCashOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Total transferencias bancarias
  const transferOrders = orders.filter(o => o.paymentMethod === 'transferencia' && o.status !== 'cancelado');
  const transferenciasConfirmadas = transferOrders
    .filter(o => o.transferStatus === 'confirmada')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const transferenciasPendientes = transferOrders
    .filter(o => o.transferStatus === 'por_transferir')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Gran Total Cuadrado
  const grandTotalCollected = totalCashRepartidores + totalVentasMostrador + transferenciasConfirmadas;

  // Monto pendiente de cobro (pedidos en ruta o pendientes que aún no se cobran)
  const pendingCollectionOrders = orders.filter(o => 
    o.status !== 'entregado' && 
    o.status !== 'cancelado' && 
    o.paymentLocation === 'contra_entrega'
  );
  const totalPendingCollection = pendingCollectionOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const deliveredOrders = orders.filter(o => o.status === 'entregado').length;
  const pendingOrders = orders.filter(o => o.status !== 'entregado' && o.status !== 'cancelado').length;

  return {
    date: todayStr,
    generatedAt: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    totalOrders: orders.length,
    deliveredOrders,
    pendingOrders,
    repartidoresBreakdown,
    totalCashRepartidores,
    totalVentasMostrador,
    totalTransferenciasConfirmadas: transferenciasConfirmadas,
    totalTransferenciasPendientes: transferenciasPendientes,
    grandTotalCollected,
    totalPendingCollection
  };
}

export function getRepartidorPersonalSummary(orders: Order[], repartidorId: RepartidorId): {
  deliveredCount: number;
  cashOnHand: number;
  assignedPendingCount: number;
  unassignedReadyCount: number;
} {
  const driverDelivered = orders.filter(o => 
    o.status === 'entregado' && 
    o.collectedBy === `repartidor_${repartidorId}`
  );

  const cashOnHand = driverDelivered
    .filter(o => o.paymentMethod === 'efectivo')
    .reduce((sum, o) => sum + (o.cashCollectedAmount !== undefined ? o.cashCollectedAmount : o.totalAmount), 0);

  const assignedPendingCount = orders.filter(o => 
    o.assignedRepartidor === repartidorId && 
    (o.status === 'listo' || o.status === 'en_ruta')
  ).length;

  const unassignedReadyCount = orders.filter(o => 
    !o.assignedRepartidor && 
    o.status === 'listo'
  ).length;

  return {
    deliveredCount: driverDelivered.length,
    cashOnHand,
    assignedPendingCount,
    unassignedReadyCount
  };
}

// Supabase configuration helpers
export function loadSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_SUPABASE_CFG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading Supabase config', e);
  }
  return {
    supabaseUrl: '',
    supabaseAnonKey: '',
    tableName: 'pedidos',
    isConnected: false
  };
}

export function saveSupabaseConfig(cfg: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_SUPABASE_CFG, JSON.stringify(cfg));
  } catch (e) {
    console.error('Error saving Supabase config', e);
  }
}

// Save & load active role and repartidor preferences
export function getStoredRole(): string | null {
  try {
    return localStorage.getItem(STORAGE_ACTIVE_ROLE);
  } catch {
    return null;
  }
}

export function setStoredRole(role: string | null): void {
  try {
    if (role) {
      localStorage.setItem(STORAGE_ACTIVE_ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_ROLE);
    }
  } catch (e) {
    console.error(e);
  }
}

export function getStoredRepartidorId(): RepartidorId {
  try {
    const id = localStorage.getItem(STORAGE_ACTIVE_REPARTIDOR);
    if (id && Number(id) >= 1 && Number(id) <= 7) {
      return Number(id) as RepartidorId;
    }
  } catch {}
  return 1;
}

export function setStoredRepartidorId(id: RepartidorId): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_REPARTIDOR, id.toString());
  } catch {}
}
