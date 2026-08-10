import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, X, Trash2, Plus, Minus, Truck, CreditCard, 
  User, Mail, Phone, Sparkles, Check, ChevronRight, Tag,
  Building2, MapPin, Copy, ShieldCheck, ArrowRight, Lock, Clock, Gift
} from "lucide-react";
import { Product } from "../types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  cartTotal: number;
  getAdjustedPrice: (price: number) => number;
  deliveryMethod: "retiro" | "moto" | "gba" | "correo";
  setDeliveryMethod: (method: "retiro" | "moto" | "gba" | "correo") => void;
  deliveryInfo: {
    tallerDireccion?: string;
    tallerHorarios?: string;
    envioCaba?: string;
    envioGba?: string;
    envioInterior?: string;
    disableShippingCosts?: boolean;
  };
  paymentMethod: "transferencia" | "mercado_pago" | "efectivo";
  setPaymentMethod: (method: "transferencia" | "mercado_pago" | "efectivo") => void;
  paymentInfo: {
    banco?: string;
    titular?: string;
    cbu?: string;
    alias?: string;
    cuit?: string;
    mercadoPago?: string;
    descuentoEfectivo?: string;
    disableTransferencia?: boolean;
    promoTransferencia?: string;
    disableMercadoPago?: boolean;
    promoMercadoPago?: string;
    disableEfectivo?: boolean;
    promoEfectivo?: string;
  };
  getPaymentDiscountPct: (method: string) => number;
  getPaymentDiscountValue: (method: string) => number;
  getShippingCostValue: (method: string) => number;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerMail: string;
  setCustomerMail: (mail: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  onConfirmPurchase: () => void;
  storeName: string;
  primaryColor?: string;
  handleCopyText?: (text: string, label: string) => void;
}

export default function CartDrawerModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  cartTotal,
  getAdjustedPrice,
  deliveryMethod,
  setDeliveryMethod,
  deliveryInfo,
  paymentMethod,
  setPaymentMethod,
  paymentInfo,
  getPaymentDiscountPct,
  getPaymentDiscountValue,
  getShippingCostValue,
  customerName,
  setCustomerName,
  customerMail,
  setCustomerMail,
  customerPhone,
  setCustomerPhone,
  onConfirmPurchase,
  storeName,
  primaryColor = "#8B5CF6",
  handleCopyText
}: CartDrawerModalProps) {
  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discountVal = getPaymentDiscountValue(paymentMethod);
  const shippingVal = getShippingCostValue(deliveryMethod);
  const finalTotal = Math.max(0, cartTotal - discountVal + shippingVal);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm select-none overflow-hidden">
        {/* Backdrop click to close */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-transparent cursor-pointer"
        />

        {/* Drawer Panel - Light & Clean Aesthetic Matching Main Website */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white text-slate-800 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200/90"
        >
          {/* Decorative Top Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[var(--primary-color)] via-purple-500 to-indigo-600" />

          {/* Drawer Header */}
          <div className="p-6 pb-4 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 flex items-center justify-center text-[var(--primary-color)] shadow-sm">
                <ShoppingBag size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                    Mi Carrito de Compras
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20">
                    Boutique 3D
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <span className="font-semibold text-slate-700">{storeName}</span>
                  <span>·</span>
                  <span className="text-[var(--primary-color)] font-bold">
                    {totalItemsCount} {totalItemsCount === 1 ? "producto seleccionado" : "productos seleccionados"}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-2xl transition-all cursor-pointer border border-slate-200"
              title="Cerrar carrito"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Tu carrito está vacío</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Explora nuestro catálogo exclusivo de impresiones y diseños 3D y agrega tus favoritos.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[var(--primary-color)] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <>
                {/* 1. DETALLE DE PRODUCTOS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Tag size={14} className="text-[var(--primary-color)]" />
                      1. Productos en Carrito ({cart.length})
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Detalle unitario y categoría
                    </span>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item) => {
                      const unitPrice = getAdjustedPrice(item.product.price);
                      const itemTotal = unitPrice * item.quantity;
                      const imgSrc = item.product.imageUrl || item.product.image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600";

                      return (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 bg-slate-50/70 hover:bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm hover:shadow-md hover:border-[var(--primary-color)]/40"
                        >
                          {/* Image & Product Info */}
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 relative shadow-inner">
                              <img 
                                src={imgSrc} 
                                alt={item.product.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="space-y-1 min-w-0">
                              {/* CATEGORÍA */}
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200/60">
                                  {item.product.category || "General 3D"}
                                </span>
                              </div>

                              {/* PRODUCTO */}
                              <h4 className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                                {item.product.name}
                              </h4>

                              {/* UNIDAD */}
                              <p className="text-[11px] text-slate-500 font-medium">
                                Precio Unitario: <span className="text-slate-800 font-bold">${unitPrice.toLocaleString("es-AR")}</span>
                              </p>
                            </div>
                          </div>

                          {/* Controls & Subtotal */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                            {/* CANTIDAD / UNIDAD CONTADOR */}
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, -1)}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer text-xs"
                                title="Reducir cantidad"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-black text-slate-900 px-1 font-mono min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, 1)}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer text-xs"
                                title="Aumentar cantidad"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* ITEM SUBTOTAL */}
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Subtotal</span>
                              <span className="text-xs font-black text-slate-900 font-mono">
                                ${itemTotal.toLocaleString("es-AR")}
                              </span>
                            </div>

                            {/* REMOVE BUTTON */}
                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Eliminar del carrito"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. FORMA DE ENTREGA */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Truck size={14} className="text-[var(--primary-color)]" />
                    2. Forma de Entrega
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Retiro por taller */}
                    <div
                      onClick={() => setDeliveryMethod("retiro")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                        deliveryMethod === "retiro"
                          ? "bg-purple-50/80 border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 shadow-sm"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>📍</span> Retiro por Taller / Showroom
                        </span>
                        <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                          Gratis
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p className="font-semibold text-slate-800">{deliveryInfo?.tallerDireccion || "Av. Cabildo 2300, Belgrano, CABA"}</p>
                        <p className="text-[10px] text-slate-500">{deliveryInfo?.tallerHorarios || "Lun a Sáb 11 a 19 hs"}</p>
                      </div>
                    </div>

                    {!deliveryInfo?.disableShippingCosts && (
                      <>
                        {/* Moto Express CABA */}
                        <div
                          onClick={() => setDeliveryMethod("moto")}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                            deliveryMethod === "moto"
                              ? "bg-purple-50/80 border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 shadow-sm"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>🏍️</span> Envío Moto CABA
                            </span>
                            <span className="text-[11px] font-black text-slate-900 font-mono">
                              {deliveryInfo?.envioCaba || "$2.500"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">Entrega rápida en 24 a 48 hs hábiles.</p>
                        </div>

                        {/* Moto GBA */}
                        <div
                          onClick={() => setDeliveryMethod("gba")}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                            deliveryMethod === "gba"
                              ? "bg-purple-50/80 border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 shadow-sm"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>🛵</span> Envío Moto GBA
                            </span>
                            <span className="text-[11px] font-black text-slate-900 font-mono">
                              {deliveryInfo?.envioGba || "$4.500"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">Primer y segundo cordón de Gran Buenos Aires.</p>
                        </div>

                        {/* Correo Argentino */}
                        <div
                          onClick={() => setDeliveryMethod("correo")}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                            deliveryMethod === "correo"
                              ? "bg-purple-50/80 border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 shadow-sm"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>📦</span> Correo Argentino
                            </span>
                            <span className="text-[9px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              A Cotizar
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">Despachos a todo el país con seguimiento en vivo.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. MEDIO DE PAGO */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-[var(--primary-color)]" />
                    3. Medio de Pago
                  </h3>

                  <div className="space-y-2.5">
                    {/* Transferencia Bancaria */}
                    {!paymentInfo?.disableTransferencia && (
                      <div
                        onClick={() => setPaymentMethod("transferencia")}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                          paymentMethod === "transferencia"
                            ? "bg-purple-50/80 border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 shadow-sm"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🏦</span>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900">Transferencia Bancaria</h4>
                              <p className="text-[10px] text-slate-500">{paymentInfo?.banco || "Banco Galicia"} · {paymentInfo?.titular || "Azurita 3D"}</p>
                            </div>
                          </div>
                          {getPaymentDiscountPct("transferencia") > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {getPaymentDiscountPct("transferencia")}% Descuento
                            </span>
                          )}
                        </div>

                        {paymentMethod === "transferencia" && (
                          <div className="mt-2 pt-2.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-bold block">Alias:</span>
                              <span className="font-bold text-slate-900 select-all">{paymentInfo?.alias || "azurita.3d.mp"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-bold block">CBU / CVU:</span>
                              <span className="font-mono text-[10px] text-slate-800 select-all">{paymentInfo?.cbu || "0070012345678901234567"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mercado Pago */}
                    {!paymentInfo?.disableMercadoPago && (
                      <div
                        onClick={() => setPaymentMethod("mercado_pago")}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                          paymentMethod === "mercado_pago"
                            ? "bg-sky-50 border-[#009EE3] ring-2 ring-[#009EE3]/20 shadow-sm"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">💳</span>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900">Mercado Pago (Tarjeta o Débito)</h4>
                              <p className="text-[10px] text-slate-500">Checkout oficial con acreditación inmediata</p>
                            </div>
                          </div>
                          {getPaymentDiscountPct("mercado_pago") > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {getPaymentDiscountPct("mercado_pago")}% Descuento
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Efectivo al retirar */}
                    {!paymentInfo?.disableEfectivo && (
                      <div
                        onClick={() => setPaymentMethod("efectivo")}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                          paymentMethod === "efectivo"
                            ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">💵</span>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900">Efectivo al Retirar</h4>
                              <p className="text-[10px] text-slate-500">{paymentInfo?.descuentoEfectivo || "Abona al momento de retirar en el taller"}</p>
                            </div>
                          </div>
                          {getPaymentDiscountPct("efectivo") > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {getPaymentDiscountPct("efectivo")}% Descuento
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. DATOS PARA LA COORDINACIÓN */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <User size={14} className="text-[var(--primary-color)]" />
                    4. Datos para la Coordinación
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <User size={10} /> Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej: Valeria Rossi"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <Mail size={10} /> Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        value={customerMail}
                        onChange={(e) => setCustomerMail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <Phone size={10} /> Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej: 11 2345 6789"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer - Resumen y Confirmación */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-slate-200 space-y-4 shrink-0 shadow-lg">
              {/* Desglose de Totales */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Productos ({totalItemsCount} ítems):</span>
                  <span className="font-mono text-slate-900 font-bold">${cartTotal.toLocaleString("es-AR")}</span>
                </div>

                {discountVal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Gift size={12} />
                      Descuento Medio de Pago ({getPaymentDiscountPct(paymentMethod)}%):
                    </span>
                    <span className="font-mono font-bold">-${discountVal.toLocaleString("es-AR")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Costo de Entrega / Envío:</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {shippingVal === 0 ? "Gratis" : `$${shippingVal.toLocaleString("es-AR")}`}
                  </span>
                </div>

                <div className="border-t border-slate-200/80 pt-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-slate-900 tracking-wider block">
                      TOTAL A ABONAR
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Incluye impuestos y descuentos aplicados</span>
                  </div>
                  <span className="text-xl font-black text-slate-900 font-mono tracking-tight">
                    ${finalTotal.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <button
                onClick={onConfirmPurchase}
                className="w-full py-4 bg-[var(--primary-color)] hover:opacity-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} />
                <span>Confirmar Pedido</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
