export type UserRole = 
  | 'ventas' 
  | 'produccion' 
  | 'repartidores' 
  | 'admin';

export type OrderStatus = 
  | 'pendiente'      // Recibido en cola
  | 'en_preparacion' // En barra
  | 'listo'          // Embotellado / Servido listo para ruta o mostrador
  | 'en_ruta'        // Tomado por repartidor
  | 'entregado'      // Entregado al cliente
  | 'cancelado';

export type PaymentLocation = 
  | 'adelantado_ventas' // Pagado por adelantado en mostrador (Emoji 7)
  | 'contra_entrega';   // Se cobrará al entregar

export type PaymentMethod = 
  | 'efectivo'
  | 'transferencia';

export type TransferStatus = 
  | 'por_transferir'
  | 'confirmada'
  | 'no_aplica';

export type RepartidorId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface OrderItem {
  flavor: string;
  size: string; // ej: 500 ml, 1 Litro, Galón
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  createdAt: string;       // ISO string
  readyAt?: string;
  deliveredAt?: string;
  customerName: string;
  customerPhone?: string;
  businessNameOrAddress: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  
  // Asignación
  assignedRepartidor?: RepartidorId | null; // null = General / Mostrador
  
  // Cobro
  paymentLocation: PaymentLocation; // adelantado_ventas o contra_entrega
  paymentMethod: PaymentMethod;
  transferStatus: TransferStatus;
  
  // Quién cobró efectivamente
  collectedBy?: 'ventas_mostrador' | `repartidor_${RepartidorId}` | null;
  cashCollectedAmount?: number; // Monto en efectivo si aplica
  
  isDirectCounterSale?: boolean; // Venta de mostrador directa
}

export interface RepartidorSummary {
  id: RepartidorId;
  name: string;
  phone: string;
  ordersDeliveredCount: number;
  cashOnHand: number;
  pendingOrdersCount: number;
}

export interface DailyCashReport {
  date: string;
  generatedAt: string;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  
  // Repartidores 1 al 7
  repartidoresBreakdown: {
    repartidorId: RepartidorId;
    name: string;
    cashCollected: number;
    ordersCount: number;
  }[];
  
  totalCashRepartidores: number;
  totalVentasMostrador: number;
  totalTransferenciasConfirmadas: number;
  totalTransferenciasPendientes: number;
  
  // Gran Total Cuadrado
  grandTotalCollected: number;
  totalPendingCollection: number;
  closedBy?: string;
  notes?: string;
}
