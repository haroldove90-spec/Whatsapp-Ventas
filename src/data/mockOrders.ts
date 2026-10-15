import { Order, RepartidorId } from '../types';

export const FLAVORS = [
  'Horchata Artesanal',
  'Jamaica con Canela',
  'Limonada con Chía',
  'Té Verde con Durazno',
  'Maracuyá Silvestre',
  'Cold Brew Vainilla',
  'Mango Pasión',
  'Tamarindo Tradicional',
  'Piña Coco Refrescante'
];

export const SIZES = [
  { name: '500 ml', price: 35 },
  { name: '1 Litro', price: 60 },
  { name: 'Galón (3.78 L)', price: 180 }
];

export const BUSINESSES_AND_CLIENTS = [
  { client: 'Don Carlos Mendoza', address: 'Taquería El Pastorcito - Av. Hidalgo 102' },
  { client: 'Lic. Mariana Ruiz', address: 'Notaría Pública 14 - Piso 3' },
  { client: 'Chef Roberto V.', address: 'Restaurante Sabor Criollo - Calle 5 #210' },
  { client: 'Sra. Lupita Gómez', address: 'Abarrotes La Providencia - Col. Centro' },
  { client: 'Dr. Alejandro Peña', address: 'Clínica Dental San José - Consultorio 4' },
  { client: 'Ing. Fernando Soto', address: 'Taller Mecánico El Pistón - Periférico Sur 45' },
  { client: 'Valeria Cárdenas', address: 'Gimnasio FitZone - Recepción' },
  { client: 'Lic. Guillermo Arce', address: 'Despacho Contable Arce & Asoc. - Blvd. 5 de Mayo' },
  { client: 'Sofía Montelongo', address: 'Boutique Magnolia - Plaza Las Palmas Local 12' },
  { client: 'Don Esteban Ramos', address: 'Carnitas Los Michoacanos - Esq. Morelos' },
  { client: 'Claudia Salinas', address: 'Salón de Belleza Chic - Av. Juárez 89' },
  { client: 'Gabriel Morales', address: 'Mariscos Don Cangrejo - Local 5' },
  { client: 'Patricia Delgado', address: 'Farmacia La Paz - Mostrador 2' },
  { client: 'Óscar Navarro', address: 'Tacos de Barbacoa El Güero' },
  { client: 'Andrea Benítez', address: 'Escuela de Idiomas Harmon Hall' },
  { client: 'Héctor Fuentes', address: 'Ferretería El Tornillo - Callejon 4' },
  { client: 'Maricela Treviño', address: 'Consultorio Médico Familiar' },
  { client: 'Jorge Valenzuela', address: 'Imprenta Gráfica Express' },
  { client: 'Lucía Barragán', address: 'Veterinaria Huellitas Felices' },
  { client: 'Raúl Cisneros', address: 'Autolavado Speedy - Av. Revolución' }
];

export const REPARTIDORES_INFO: { id: RepartidorId; name: string; phone: string }[] = [
  { id: 1, name: 'Repartidor 1 (Mateo R.)', phone: '5512340001' },
  { id: 2, name: 'Repartidor 2 (Javier M.)', phone: '5512340002' },
  { id: 3, name: 'Repartidor 3 (Carlos T.)', phone: '5512340003' },
  { id: 4, name: 'Repartidor 4 (Diego L.)', phone: '5512340004' },
  { id: 5, name: 'Repartidor 5 (Luis E.)', phone: '5512340005' },
  { id: 6, name: 'Repartidor 6 (Ángel B.)', phone: '5512340006' },
  { id: 7, name: 'Repartidor 7 (Raúl G.)', phone: '5512340007' }
];

export function generateInitialOrders(): Order[] {
  const orders: Order[] = [];
  const baseDate = new Date();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  // Create 160 realistic orders across today from 8:00 AM to present
  let orderNumberCounter = 1001;

  for (let i = 0; i < 160; i++) {
    const orderNum = orderNumberCounter++;
    
    // Spread hours from 08:00 to 19:30
    const minuteOffset = (i * 4) + Math.floor(Math.random() * 3);
    const orderTime = new Date(year, month, day, 8, 0, 0);
    orderTime.setMinutes(orderTime.getMinutes() + minuteOffset);

    const clientObj = BUSINESSES_AND_CLIENTS[i % BUSINESSES_AND_CLIENTS.length];
    const flavor1 = FLAVORS[i % FLAVORS.length];
    const size1 = SIZES[i % SIZES.length];
    const qty1 = 1 + (i % 4);

    const items = [
      {
        flavor: flavor1,
        size: size1.name,
        quantity: qty1,
        unitPrice: size1.price
      }
    ];

    // Some orders have second item
    if (i % 3 === 0) {
      const flavor2 = FLAVORS[(i + 3) % FLAVORS.length];
      const size2 = SIZES[(i + 1) % SIZES.length];
      items.push({
        flavor: flavor2,
        size: size2.name,
        quantity: 1,
        unitPrice: size2.price
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Distribution:
    // Recent orders (last 20) are in queue/preparation/route
    // First 140 are mostly delivered for cash cut preview
    let status: Order['status'] = 'entregado';
    if (i >= 152) {
      status = 'pendiente';
    } else if (i >= 144) {
      status = 'en_preparacion';
    } else if (i >= 134) {
      status = 'listo';
    } else if (i >= 126) {
      status = 'en_ruta';
    } else {
      status = 'entregado';
    }

    // Direct counter sale vs delivery route
    const isCounterSale = (i % 5 === 0);
    const repartidorId: RepartidorId | null = isCounterSale 
      ? null 
      : ((i % 7) + 1 as RepartidorId);

    // Payment configuration
    let paymentLocation: Order['paymentLocation'] = 'contra_entrega';
    let paymentMethod: Order['paymentMethod'] = 'efectivo';
    let transferStatus: Order['transferStatus'] = 'no_aplica';
    let collectedBy: Order['collectedBy'] = null;
    let cashCollectedAmount = 0;

    if (isCounterSale) {
      paymentLocation = 'adelantado_ventas';
      if (i % 4 === 1) {
        paymentMethod = 'transferencia';
        transferStatus = 'confirmada';
        collectedBy = 'ventas_mostrador';
      } else {
        paymentMethod = 'efectivo';
        collectedBy = 'ventas_mostrador';
        cashCollectedAmount = totalAmount;
      }
    } else {
      // Repartidor delivery
      if (i % 7 === 2) {
        // Transferencia bancaria
        paymentMethod = 'transferencia';
        paymentLocation = 'contra_entrega';
        transferStatus = (status === 'entregado') ? 'confirmada' : 'por_transferir';
        if (status === 'entregado') {
          collectedBy = repartidorId ? `repartidor_${repartidorId}` : 'ventas_mostrador';
        }
      } else if (i % 9 === 0) {
        // Pagado por adelantado a ventas (emoji 7)
        paymentLocation = 'adelantado_ventas';
        paymentMethod = 'efectivo';
        collectedBy = 'ventas_mostrador';
        cashCollectedAmount = totalAmount;
      } else {
        // Cobro en efectivo por el repartidor contra entrega
        paymentLocation = 'contra_entrega';
        paymentMethod = 'efectivo';
        if (status === 'entregado' && repartidorId) {
          collectedBy = `repartidor_${repartidorId}`;
          cashCollectedAmount = totalAmount;
        }
      }
    }

    const readyAt = status !== 'pendiente' 
      ? new Date(orderTime.getTime() + 10 * 60000).toISOString() 
      : undefined;
      
    const deliveredAt = status === 'entregado' 
      ? new Date(orderTime.getTime() + 35 * 60000).toISOString() 
      : undefined;

    orders.push({
      id: `ord_${orderNum}_${i}`,
      orderNumber: orderNum,
      createdAt: orderTime.toISOString(),
      readyAt,
      deliveredAt,
      customerName: clientObj.client,
      customerPhone: `55${Math.floor(10000000 + Math.random() * 89999999)}`,
      businessNameOrAddress: clientObj.address,
      items,
      totalAmount,
      notes: i % 4 === 0 ? 'Sin hielo extra, bien sellado' : (i % 7 === 0 ? 'Llamar al llegar' : undefined),
      status,
      assignedRepartidor: repartidorId,
      paymentLocation,
      paymentMethod,
      transferStatus,
      collectedBy,
      cashCollectedAmount,
      isDirectCounterSale: isCounterSale
    });
  }

  // Sort descending by orderNumber for easy viewing or time order
  return orders;
}
