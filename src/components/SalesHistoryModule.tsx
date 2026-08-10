import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, Search, Filter, CheckCircle2, Clock, XCircle, 
  Eye, MessageCircle, Trash2, DollarSign, Calendar, User, 
  Mail, Phone, Truck, CreditCard, RefreshCw, ChevronDown, 
  Printer, ArrowUpRight, ShieldCheck, Tag
} from "lucide-react";
import { Order } from "../types";

interface SalesHistoryModuleProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: "Pagado" | "Pendiente" | "Cancelado") => void;
  onDeleteOrder: (id: string) => void;
  onRefreshOrders?: () => void;
  sellerWhatsApp: string;
  storeName: string;
}

export default function SalesHistoryModule({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  onRefreshOrders,
  sellerWhatsApp,
  storeName
}: SalesHistoryModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [methodFilter, setMethodFilter] = useState<string>("todos");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.id || "").toLowerCase().includes(term) ||
      (order.customerName || "").toLowerCase().includes(term) ||
      (order.customerEmail || "").toLowerCase().includes(term) ||
      (order.customerPhone || "").toLowerCase().includes(term) ||
      (order.items || []).some(item => (item?.productName || "").toLowerCase().includes(term));

    const matchesStatus = 
      statusFilter === "todos" || 
      (statusFilter === "pagado" && order.paymentStatus === "Pagado") ||
      (statusFilter === "pendiente" && order.paymentStatus === "Pendiente") ||
      (statusFilter === "cancelado" && order.paymentStatus === "Cancelado");

    const matchesMethod = 
      methodFilter === "todos" ||
      order.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate Metrics
  const totalSalesRevenue = orders
    .filter(o => o.paymentStatus === "Pagado")
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrdersCount = orders.length;
  const paidOrdersCount = orders.filter(o => o.paymentStatus === "Pagado").length;
  const pendingOrdersCount = orders.filter(o => o.paymentStatus === "Pendiente").length;
  const averageTicket = paidOrdersCount > 0 ? totalSalesRevenue / paidOrdersCount : 0;

  // Format delivery label
  const getDeliveryLabel = (method: string) => {
    switch (method) {
      case "retiro": return "Retiro por Taller";
      case "moto": return "Moto CABA";
      case "gba": return "Moto GBA";
      case "correo": return "Correo Argentino";
      default: return method;
    }
  };

  // Format payment method label & badge
  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "mercado_pago":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#009EE3]/10 text-[#009EE3] border border-[#009EE3]/20">
            <CreditCard size={11} /> Mercado Pago
          </span>
        );
      case "transferencia":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <DollarSign size={11} /> Transferencia
          </span>
        );
      case "efectivo":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign size={11} /> Efectivo
          </span>
        );
      default:
        return <span className="text-xs font-semibold">{method}</span>;
    }
  };

  // Format payment status badge
  const getStatusBadge = (status: "Pagado" | "Pendiente" | "Cancelado") => {
    switch (status) {
      case "Pagado":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs">
            <CheckCircle2 size={11} /> Pagado
          </span>
        );
      case "Pendiente":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
            <Clock size={11} /> Pendiente
          </span>
        );
      case "Cancelado":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-xs">
            <XCircle size={11} /> Cancelado
          </span>
        );
    }
  };

  // WhatsApp post-purchase logistics link
  const openWhatsAppLogistics = (order: Order) => {
    if (!order) return;
    const cleanPhone = (order.customerPhone || "").replace(/\D/g, "");
    const itemsList = (order.items || [])
      .map(i => `• ${i?.quantity || 1}x ${i?.productName || "Producto"} ($${(i?.unitPrice || 0).toLocaleString("es-AR")} c/u)`)
      .join("\n");

    const text = 
      `*🚚 COORDINACIÓN DE ENTREGA - ${(storeName || "AZURITA 3D").toUpperCase()} 🚚*\n\n` +
      `¡Hola ${order.customerName || "Cliente"}! Te contactamos de *${storeName || "Azurita 3D"}* por tu Orden *#${order.id || "AZ-00000"}*.\n\n` +
      `📦 *DETALLE DE TU COMPRA:*\n${itemsList}\n\n` +
      `💳 *ESTADO PAGO:* ${order.paymentStatus === "Pagado" ? "PAGADO ✅" : "PENDIENTE DE PAGO ⏳"}\n` +
      `📍 *MÉTODO DE ENTREGA:* ${getDeliveryLabel(order.deliveryMethod || "retiro")}\n` +
      `💰 *TOTAL:* $${(order.total || 0).toLocaleString("es-AR")}\n\n` +
      `Por favor, indícanos tus días y horarios de preferencia para coordinar el despacho o retiro. ¡Muchas gracias!`;

    const encoded = encodeURIComponent(text);
    const targetPhone = cleanPhone.length >= 8 ? cleanPhone : (sellerWhatsApp || "").replace(/\D/g, "");
    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, "_blank");
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-2xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Historial de Ventas / Compras
            </h2>
            <p className="text-xs text-slate-500">
              Registro completo de transacciones, estado de pagos y coordinación de logística.
            </p>
          </div>
        </div>

        {onRefreshOrders && (
          <button
            onClick={onRefreshOrders}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <RefreshCw size={14} />
            <span>Actualizar Registro</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Ingresos Confirmados</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ${totalSalesRevenue.toLocaleString("es-AR")}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Ventas con estado Pagado
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Transacciones</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalOrdersCount}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {paidOrdersCount} Pagadas · {pendingOrdersCount} Pendientes
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Ticket Promedio</span>
          <div className="text-2xl font-black text-[var(--primary-color)] font-mono">
            ${Math.round(averageTicket).toLocaleString("es-AR")}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Por orden completada
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Pagos Pendientes</span>
          <div className="text-2xl font-black text-amber-500 font-mono">
            {pendingOrdersCount}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold block">
            A la espera de confirmación
          </span>
        </div>

      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, mail, tel u orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/25 outline-none transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mr-1">
            <Filter size={13} />
            <span>Filtrar:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/25 cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="pagado">🟢 Solo Pagados</option>
            <option value="pendiente">🟡 Solo Pendientes</option>
            <option value="cancelado">🔴 Solo Cancelados</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/25 cursor-pointer"
          >
            <option value="todos">Todos los medios de pago</option>
            <option value="mercado_pago">Mercado Pago</option>
            <option value="transferencia">Transferencia Bancaria</option>
            <option value="efectivo">Efectivo</option>
          </select>

        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No se encontraron ventas</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "todos" || methodFilter !== "todos"
                ? "No hay pedidos que coincidan con los filtros aplicados."
                : "Aún no se han registrado compras en la plataforma."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider select-none">
                <tr>
                  <th className="py-3.5 px-4">N° Orden & Fecha</th>
                  <th className="py-3.5 px-4">Cliente / Contacto</th>
                  <th className="py-3.5 px-4">Productos</th>
                  <th className="py-3.5 px-4">Medio & Estado Pago</th>
                  <th className="py-3.5 px-4">Entrega</th>
                  <th className="py-3.5 px-4 text-right">Total ($)</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* ID & Date */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono font-black text-slate-900 block text-xs">
                        #{order.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-900 block">
                          {order.customerName}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Mail size={10} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]" title={order.customerEmail}>
                            {order.customerEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Phone size={10} className="text-slate-400 shrink-0" />
                          <span className="font-mono">{order.customerPhone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Products summary */}
                    <td className="py-3.5 px-4 align-top max-w-[200px]">
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-[11px] text-slate-700 truncate" title={`${item.quantity}x ${item.productName}`}>
                            <span className="font-bold text-[var(--primary-color)]">{item.quantity}x</span> {item.productName}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            +{order.items.length - 2} productos más
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Payment Method & Status */}
                    <td className="py-3.5 px-4 align-top space-y-1.5">
                      <div>{getPaymentMethodBadge(order.paymentMethod)}</div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.paymentStatus)}
                        {/* Quick Toggle Status */}
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, order.paymentStatus === "Pagado" ? "Pendiente" : "Pagado")}
                          className="text-[9px] text-slate-400 hover:text-[var(--primary-color)] underline cursor-pointer"
                          title="Alternar estado de pago"
                        >
                          Cambiar
                        </button>
                      </div>
                    </td>

                    {/* Delivery Method */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="text-slate-700 font-semibold block text-[11px]">
                        {getDeliveryLabel(order.deliveryMethod)}
                      </span>
                      {order.shippingCost > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +${order.shippingCost.toLocaleString("es-AR")} envío
                        </span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <span className="font-mono font-black text-sm text-slate-900 block">
                        ${order.total.toLocaleString("es-AR")}
                      </span>
                      {order.discountAmount > 0 && (
                        <span className="text-[9px] text-emerald-600 font-bold block">
                          Desc: -${order.discountAmount.toLocaleString("es-AR")}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* View Order Detail */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                          title="Ver detalle de venta"
                        >
                          <Eye size={14} />
                        </button>

                        {/* WhatsApp Logistics Contact */}
                        <button
                          onClick={() => openWhatsAppLogistics(order)}
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all cursor-pointer shadow-xs"
                          title="Coordinar logística por WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </button>

                        {/* Delete Order */}
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la orden #${order.id} del historial?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                          title="Eliminar de historial"
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED ORDER RECEIPT MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden my-8"
            >
              {/* Receipt Header */}
              <div className="bg-slate-900 text-white p-6 relative">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck size={14} />
                  <span>Comprobante de Venta · {storeName}</span>
                </div>
                <h3 className="text-xl font-black font-mono">
                  ORDEN #{selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Registrada el {new Date(selectedOrder.createdAt).toLocaleString("es-AR")}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
                
                {/* Customer Details Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Datos del Cliente</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Nombre Completo:</span>
                      <span className="font-extrabold text-slate-900">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Teléfono / WhatsApp:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">Correo Electrónico:</span>
                      <span className="font-mono text-slate-800">{selectedOrder.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Products Purchased Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Detalle de Productos</span>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{item.productName}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.quantity} unidad(es) × ${item.unitPrice.toLocaleString("es-AR")}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          ${(item.quantity * item.unitPrice).toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment & Delivery Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Medio de Pago</span>
                    <div>{getPaymentMethodBadge(selectedOrder.paymentMethod)}</div>
                    <div className="mt-1.5">{getStatusBadge(selectedOrder.paymentStatus)}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Método de Entrega</span>
                    <span className="font-bold text-slate-800 block text-xs">{getDeliveryLabel(selectedOrder.deliveryMethod)}</span>
                    <span className="text-[10px] text-slate-500">
                      {selectedOrder.shippingCost > 0 ? `$${selectedOrder.shippingCost.toLocaleString("es-AR")}` : "Sin cargo"}
                    </span>
                  </div>
                </div>

                {/* Financial Totals */}
                <div className="border-t border-slate-200 pt-3 space-y-1.5 font-mono text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toLocaleString("es-AR")}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Descuento aplicado:</span>
                      <span>-${selectedOrder.discountAmount.toLocaleString("es-AR")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Costo de Envío:</span>
                    <span>${selectedOrder.shippingCost.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                    <span>TOTAL COMPRA:</span>
                    <span className="text-[var(--primary-color)]">${selectedOrder.total.toLocaleString("es-AR")}</span>
                  </div>
                </div>

              </div>

              {/* Receipt Modal Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => openWhatsAppLogistics(selectedOrder)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <MessageCircle size={15} />
                  <span>Coordinar por WhatsApp</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
