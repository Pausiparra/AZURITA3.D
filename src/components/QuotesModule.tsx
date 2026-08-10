import React, { useState, useMemo, useEffect } from "react";
import { 
  Calculator, MessageSquare, Copy, ExternalLink, Check, ShoppingBag, 
  Ruler, Clock, CreditCard, User, Sparkles, Send, Smartphone, 
  FileText, RefreshCw, AlertCircle, ArrowRight, History, Trash2, CheckCircle2
} from "lucide-react";
import { Product } from "../types";

interface QuotesModuleProps {
  products: Product[];
  priceMultiplier?: number;
  sellerWhatsApp?: string;
  storeName?: string;
  showToast: (text: string, type?: "success" | "error") => void;
}

export interface QuoteTemplateOption {
  id: "detallado" | "rapido" | "seguimiento";
  title: string;
  badge: string;
  description: string;
  templateText: string;
}

const DEFAULT_TEMPLATES: QuoteTemplateOption[] = [
  {
    id: "detallado",
    title: "Presupuesto Detallado",
    badge: "Oficial Marca",
    description: "Incluye medidas, tiempo de elaboración (3-5 días), seña del 50% y llamada a la acción para datos.",
    templateText: `¡Hola {NOMBRE}! 👋

Te paso el presupuesto detallado para tu pedido personalizado de *{PRODUCTO}*:

📐 *Medidas:* {MEDIDAS}
🛠️ *Detalles:* {DETALLES}
⏱️ *Tiempo de elaboración:* {TIEMPO}

💰 *Precio Total:* ${"{MONTO}"}
💳 *Seña 50% para congelar y comenzar:* ${"{SENA}"}

¿Te gustaría enviarnos tu logo, QR o datos para armar la muestra gráfica antes de imprimir? Quedamos a tu entera disposición. 🎨✨`
  },
  {
    id: "rapido",
    title: "Presupuesto Rápido / Cierre",
    badge: "Cierre Directo",
    description: "Incluye total, seña 50% y datos de pago fijos (Alias: terapias-azurita.mp, Titular: Sonia Marlene Bareiro).",
    templateText: `¡Hola {NOMBRE}! ✨

Te confirmo los datos para congelar la seña y comenzar con la producción de *{PRODUCTO}* ({MEDIDAS}):

💵 *Total:* ${"{MONTO}"}
🔒 *Seña 50%:* ${"{SENA}"}

📌 *Datos de pago para la transferencia:*
• *Alias:* terapias-azurita.mp
• *Titular:* Sonia Marlene Bareiro
• *Entidad:* Mercado Pago

Una vez realizado el pago, envíanos el comprobante por este medio para agendar el pedido. ¡Muchas gracias! 🙌`
  },
  {
    id: "seguimiento",
    title: "Mensaje de Seguimiento",
    badge: "Reactivación",
    description: "Mensaje amable para retomar contacto con clientes que aún no han respondido.",
    templateText: `¡Hola {NOMBRE}! 👋 ¿Cómo estás?

Te escribo para saber si pudiste revisar el presupuesto de *{PRODUCTO}* ({MEDIDAS}) o si te quedó alguna duda respecto al diseño o los tiempos de entrega.

Cualquier consulta estamos a disposición para ayudarte a adaptarlo a tu presupuesto. ¡Que tengas un excelente día! 😊`
  }
];

interface RecentQuote {
  id: string;
  clientName: string;
  productName: string;
  amount: number;
  date: string;
  messageText: string;
}

export default function QuotesModule({
  products,
  priceMultiplier = 1.0,
  sellerWhatsApp = "5491123456789",
  storeName = "Azurita3D",
  showToast
}: QuotesModuleProps) {
  // --- FORM STATE ---
  const [selectedTemplateId, setSelectedTemplateId] = useState<"detallado" | "rapido" | "seguimiento">("detallado");
  const [selectedProductId, setSelectedProductId] = useState<string>("custom");
  
  // Dynamic fields
  const [clientName, setClientName] = useState<string>("María");
  const [productName, setProductName] = useState<string>("Cartel Neón LED Personalizado 3D");
  const [measures, setMeasures] = useState<string>("30 cm x 20 cm");
  const [details, setDetails] = useState<string>("Diseño multicapa en PLA Premium con fondo calado");
  const [productionTime, setProductionTime] = useState<string>("3 a 5 días hábiles");
  const [priceAmount, setPriceAmount] = useState<number | "">(28000);
  const [clientPhone, setClientPhone] = useState<string>("");

  // Template custom text editor
  const [templates, setTemplates] = useState<QuoteTemplateOption[]>(DEFAULT_TEMPLATES);
  const activeTemplateObj = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const [activeTemplateText, setActiveTemplateText] = useState<string>(activeTemplateObj.templateText);

  // Sync activeTemplateText when active template changes
  useEffect(() => {
    setActiveTemplateText(activeTemplateObj.templateText);
  }, [selectedTemplateId, activeTemplateObj]);

  // Copy Feedback state
  const [copied, setCopied] = useState<boolean>(false);

  // Saved Quotes History
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>(() => {
    const saved = localStorage.getItem("azurita_recent_quotes");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Calculate 50% deposit automatically
  const numericPrice = typeof priceAmount === "number" ? priceAmount : parseFloat(priceAmount) || 0;
  const depositAmount = Math.round(numericPrice / 2);

  // Format numbers nicely
  const formattedPrice = `$${numericPrice.toLocaleString("es-AR")}`;
  const formattedDeposit = `$${depositAmount.toLocaleString("es-AR")}`;

  // When a product is selected from dropdown
  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    if (pId === "custom") {
      setProductName("Cartel Personalizado 3D");
      setPriceAmount(25000);
      setMeasures("30 cm x 20 cm");
      setDetails("Diseño exclusivo a pedido");
    } else {
      const found = products.find(p => p.id === pId);
      if (found) {
        setProductName(found.name);
        const finalP = Math.round(found.price * priceMultiplier);
        setPriceAmount(finalP);
        setDetails(found.description || "Impresión 3D de alta definición");
      }
    }
  };

  // Generate parsed message in real-time
  const parsedMessage = useMemo(() => {
    let msg = activeTemplateText || "";
    const cleanClient = clientName.trim() || "Cliente";
    const cleanProd = productName.trim() || "Producto Azurita3D";
    const cleanMeasures = measures.trim() || "A medida";
    const cleanDetails = details.trim() || "Edición especial 3D";
    const cleanTime = productionTime.trim() || "3 a 5 días hábiles";

    return msg
      .replace(/{NOMBRE}/g, cleanClient)
      .replace(/{PRODUCTO}/g, cleanProd)
      .replace(/{MEDIDAS}/g, cleanMeasures)
      .replace(/{DETALLES}/g, cleanDetails)
      .replace(/{TIEMPO}/g, cleanTime)
      .replace(/{MONTO}/g, numericPrice.toLocaleString("es-AR"))
      .replace(/{SENA}/g, depositAmount.toLocaleString("es-AR"))
      .replace(/{TIENDA}/g, storeName);
  }, [
    activeTemplateText, clientName, productName, measures, 
    details, productionTime, numericPrice, depositAmount, storeName
  ]);

  // Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(parsedMessage);
    setCopied(true);
    showToast("¡Presupuesto copiado al portapapeles!", "success");
    setTimeout(() => setCopied(false), 2500);

    // Save to history
    saveToHistory();
  };

  // Open WhatsApp Link
  const handleSendWhatsApp = () => {
    const rawPhone = clientPhone.replace(/\D/g, "");
    const targetPhone = rawPhone.length >= 8 ? rawPhone : "";
    
    let url = "";
    if (targetPhone) {
      url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(parsedMessage)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(parsedMessage)}`;
    }

    window.open(url, "_blank");
    showToast("Abriendo WhatsApp con el presupuesto...", "success");

    // Save to history
    saveToHistory();
  };

  // Save quote to recent history
  const saveToHistory = () => {
    const newQuote: RecentQuote = {
      id: `quote-${Date.now()}`,
      clientName: clientName.trim() || "Cliente",
      productName: productName.trim() || "Producto 3D",
      amount: numericPrice,
      date: new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      messageText: parsedMessage
    };

    setRecentQuotes(prev => {
      const updated = [newQuote, ...prev.filter(q => q.messageText !== parsedMessage)].slice(0, 10);
      localStorage.setItem("azurita_recent_quotes", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear history
  const handleClearHistory = () => {
    setRecentQuotes([]);
    localStorage.removeItem("azurita_recent_quotes");
    showToast("Historial de presupuestos limpiado", "success");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Module Header Banner */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Calculator size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-800 tracking-tight">
                Módulo de Presupuestos Rápidos
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                Azurita3D
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Genera cotizaciones profesionales con plantillas oficiales para enviar directamente por WhatsApp.
            </p>
          </div>
        </div>

        {/* Quick Payment Info Pill */}
        <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
          <CreditCard size={18} className="text-emerald-600 shrink-0" />
          <div className="text-[11px] leading-tight">
            <p className="font-extrabold text-slate-800">Alias MP: <span className="text-emerald-700 font-mono">terapias-azurita.mp</span></p>
            <p className="text-slate-500 font-medium text-[10px]">Titular: Sonia Marlene Bareiro</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (7 Cols) & Right Live WhatsApp Preview (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Product Selector, Template Buttons & Dynamic Fields */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: SELECTOR DE PLANTILLA */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  1. Seleccionar Plantilla de Mensaje
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">3 Opciones</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map(tpl => {
                const isActive = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isActive 
                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm" 
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isActive ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {tpl.badge}
                        </span>
                        {isActive && <Check size={14} className="text-emerald-600 font-bold" />}
                      </div>
                      <p className="font-extrabold text-xs text-slate-800 leading-snug">{tpl.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed line-clamp-3">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECTOR DE PRODUCTO Y DATOS DINÁMICOS */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-[var(--primary-color)]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  2. Datos del Pedido y Presupuesto
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Cálculo Automático de Seña (50%)</span>
            </div>

            {/* Product Dropdown Selector */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Seleccionar Producto del Catálogo o Pedido Especial
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30 cursor-pointer transition-all"
              >
                <option value="custom">✨ Pedido Especial / Personalizado a Medida</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${Math.round(p.price * priceMultiplier).toLocaleString("es-AR")} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Cliente */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <User size={12} className="text-slate-400" />
                  <span>Nombre del Cliente *</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Laura / Franco"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Teléfono WhatsApp del Cliente (Opcional) */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <Smartphone size={12} className="text-emerald-600" />
                  <span>WhatsApp Cliente (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej: 5491122334455"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Nombre Producto / Cartel */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Nombre del Producto / Cartel Personalizado *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ej: Cartel Neón LED Azurita 3D"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Medidas y Dimensiones */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <Ruler size={12} className="text-slate-400" />
                  <span>Medidas / Dimensiones</span>
                </label>
                <input
                  type="text"
                  value={measures}
                  onChange={(e) => setMeasures(e.target.value)}
                  placeholder="Ej: 30 cm x 20 cm"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />

                {/* Measure Quick Presets */}
                <div className="flex items-center gap-1 mt-1.5 overflow-x-auto pb-1">
                  {["15x15 cm", "20x10 cm", "30x20 cm", "40x25 cm", "A medida"].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMeasures(preset)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[9px] font-extrabold text-slate-600 rounded-lg cursor-pointer transition-all shrink-0"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Precio Total & Seña 50% */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Precio Total del Presupuesto (ARS) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-black text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="25000"
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                {/* Display 50% Deposit Calculation */}
                <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-emerald-800">Seña 50% Calculada:</span>
                  <span className="font-mono font-black text-emerald-900 text-xs">{formattedDeposit}</span>
                </div>
              </div>

              {/* Tiempo de Elaboración */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  <span>Tiempo de Elaboración</span>
                </label>
                <input
                  type="text"
                  value={productionTime}
                  onChange={(e) => setProductionTime(e.target.value)}
                  placeholder="3 a 5 días hábiles"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white"
                />
              </div>

              {/* Detalles adicionales */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Detalles / Especificaciones
                </label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Detalles de diseño, color o material"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* EDITABLE TEXTAREA DEL TEXTO DE LA PLANTILLA */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-400" />
                <span>Estructura de la Plantilla ({activeTemplateObj.title})</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const orig = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplateId);
                  if (orig) setActiveTemplateText(orig.templateText);
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>Restablecer texto original</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={activeTemplateText}
              onChange={(e) => setActiveTemplateText(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30 leading-relaxed resize-none"
            />
            <p className="text-[10px] text-slate-400">
              Variables disponibles: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">&#123;NOMBRE&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">&#123;PRODUCTO&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">&#123;MEDIDAS&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">&#123;MONTO&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">&#123;SENA&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">&#123;TIEMPO&#125;</code>.
            </p>
          </div>
        </div>

        {/* Right Side: Simulador en vivo de WhatsApp (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-4 sticky top-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Simulador de Presupuesto WhatsApp
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                En vivo
              </span>
            </div>

            {/* Chat Frame Container */}
            <div className="bg-[#E5DDD5] rounded-2xl p-4 min-h-[420px] flex flex-col justify-between border border-slate-300 shadow-inner relative overflow-hidden">
              
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white p-3 rounded-xl flex items-center justify-between shadow-sm mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-black text-xs text-white uppercase border border-emerald-500">
                    {clientName.slice(0, 2) || "CL"}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold leading-tight">{clientName || "Cliente"}</p>
                    <p className="text-[9px] text-emerald-200 font-medium">
                      {clientPhone ? `+${clientPhone}` : "Sin número directo"}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold bg-emerald-800/80 text-emerald-100 px-2 py-0.5 rounded">
                  {storeName}
                </span>
              </div>

              {/* Chat Bubble Message */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="bg-[#DCF8C6] text-slate-900 p-4 rounded-2xl rounded-tr-none max-w-[95%] ml-auto shadow-sm border border-emerald-200/60 space-y-2 relative">
                  
                  {/* Product Summary Header Pill */}
                  <div className="flex items-center justify-between p-2 bg-white/80 rounded-xl border border-emerald-200/60 mb-1">
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-[11px] text-slate-900 truncate">{productName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{measures}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-emerald-800">{formattedPrice}</p>
                      <p className="text-[9px] text-emerald-600 font-extrabold">Seña: {formattedDeposit}</p>
                    </div>
                  </div>

                  {/* Rendered Text Body */}
                  <div className="text-xs whitespace-pre-line leading-relaxed font-sans text-slate-800 pt-1 selection:bg-emerald-200">
                    {parsedMessage}
                  </div>

                  {/* Time and Double Check Marks */}
                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 pt-1 font-mono">
                    <span>14:40</span>
                    <span className="text-sky-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: COPIAR & ENVIAR POR WHATSAPP */}
              <div className="mt-4 pt-3 border-t border-slate-300/60 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-slate-600" />}
                  <span>{copied ? "¡Copiado!" : "Copiar mensaje"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send size={16} />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </div>

            {/* RECENT QUOTES HISTORY */}
            {recentQuotes.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                    <History size={12} />
                    <span>Últimos Presupuestos ({recentQuotes.length})</span>
                  </span>
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-slate-400 hover:text-red-600 font-bold cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {recentQuotes.map(rq => (
                    <div
                      key={rq.id}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs transition-all"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] truncate">{rq.clientName} — {rq.productName}</p>
                        <p className="text-[9px] text-slate-500 font-medium">{rq.date} · ${rq.amount.toLocaleString("es-AR")}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(rq.messageText);
                          showToast(`Presupuesto para ${rq.clientName} copiado!`, "success");
                        }}
                        className="p-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer shrink-0"
                        title="Copiar texto"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
