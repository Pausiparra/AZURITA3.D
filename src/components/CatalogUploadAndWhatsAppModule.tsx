import React, { useState, useRef, useMemo } from "react";
import { 
  Upload, Plus, Image as ImageIcon, FileJson, Copy, Check, MessageSquare, 
  ExternalLink, Sparkles, Trash2, Edit2, ShoppingBag, Layers, AlertCircle, 
  Tag, DollarSign, Package, FileText, Download, RefreshCw, Smartphone, Search, Filter
} from "lucide-react";
import { Product } from "../types";

interface CatalogUploadAndWhatsAppModuleProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onBulkAddProducts: (products: Omit<Product, "id">[]) => void;
  waMessageTemplate: string;
  setWaMessageTemplate: (template: string) => void;
  sellerWhatsApp: string;
  setSellerWhatsApp: (phone: string) => void;
  storeName: string;
  priceMultiplier: number;
  showToast: (text: string, type?: "success" | "error") => void;
  onSaveToGitHub?: () => void;
  syncState?: string;
  activeSubTab?: "subir" | "plantilla";
}

const PRESET_IMAGES = [
  { name: "MATE VORONOI 3D", url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80" },
  { name: "SOPORTE AURICULARES", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
  { name: "LÁMPARA DISEÑO GEOMÉTRICO", url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80" },
  { name: "MACETA ARTESANAL 3D", url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80" },
  { name: "FIGURA / ESCULTURA ARTÍSTICA", url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80" },
];

export default function CatalogUploadAndWhatsAppModule({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkAddProducts,
  waMessageTemplate,
  setWaMessageTemplate,
  sellerWhatsApp,
  setSellerWhatsApp,
  storeName,
  priceMultiplier = 1.0,
  showToast,
  onSaveToGitHub,
  syncState = "synced",
  activeSubTab: initialSubTab = "subir"
}: CatalogUploadAndWhatsAppModuleProps) {
  const [subTab, setSubTab] = useState<"subir" | "plantilla">(initialSubTab);

  // --- SUBIR PRODUCTO FORM STATE ---
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Decoración");
  const [customCategory, setCustomCategory] = useState("");
  const [newProdPrice, setNewProdPrice] = useState<number | "">(15000);
  const [newProdStock, setNewProdStock] = useState<number | "">(10);
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImage, setNewProdImage] = useState("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80");
  const [newProdTags, setNewProdTags] = useState("3D, Nuevo, Premium");
  const [imageTab, setImageTab] = useState<"preset" | "url" | "file">("preset");
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);

  // --- BULK JSON UPLOAD STATE ---
  const [jsonInputText, setJsonInputText] = useState("");
  const [showJsonImporter, setShowJsonImporter] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // --- SEARCH & FILTER PRODUCTS IN MANAGEMENT LIST ---
  const [searchCatalog, setSearchCatalog] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("Todas");

  // --- PLANTILLA WHATSAPP STATE ---
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedParsedMessage, setCopiedParsedMessage] = useState(false);
  const [previewProductId, setPreviewProductId] = useState<string>(() => products[0]?.id || "");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  // Unique categories list
  const categoriesList = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ["Todas", ...Array.from(set)];
  }, [products]);

  // Selected sample product for WhatsApp live preview
  const sampleProduct = useMemo(() => {
    return products.find(p => p.id === previewProductId) || products[0] || {
      id: "demo",
      name: "Mate Impreso 3D Voronoi",
      category: "Decoración",
      price: 18500,
      stock: 12,
      description: "Mate con diseño Voronoi exclusivo y polímero térmico interior de grado alimenticio.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80"
    };
  }, [products, previewProductId]);

  // Calculate parsed WhatsApp message for sample product
  const parsedSampleMessage = useMemo(() => {
    const finalPrice = Math.round((sampleProduct.price || 0) * priceMultiplier);
    const priceFormatted = `$${finalPrice.toLocaleString("es-AR")}`;

    let template = waMessageTemplate || "Hola! Me interesa encargar/consultar por el producto: *{PRODUCTO}* (Precio: {PRECIO}).\n\n¿Podrían brindarme más información?";
    
    return template
      .replace(/{PRODUCTO}/g, sampleProduct.name)
      .replace(/{PRECIO}/g, priceFormatted)
      .replace(/{TIENDA}/g, storeName)
      .replace(/{DETALLES}/g, sampleProduct.description || "Diseño de alta calidad")
      .replace(/{WHATSAPP}/g, sellerWhatsApp);
  }, [waMessageTemplate, sampleProduct, priceMultiplier, storeName, sellerWhatsApp]);

  // Handle local image file upload converting to base64
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast("La imagen supera los 3MB. Por favor elige una imagen más liviana.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedBase64(result);
      setNewProdImage(result);
      showToast("Imagen cargada y procesada correctamente", "success");
    };
    reader.readAsDataURL(file);
  };

  // Submit single new product
  const handleSingleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProdName.trim()) {
      showToast("Ingresa el nombre del producto", "error");
      return;
    }

    const finalCategory = newProdCategory === "NUEVA" 
      ? (customCategory.trim() || "General") 
      : newProdCategory;

    const priceNum = typeof newProdPrice === "number" ? newProdPrice : parseFloat(newProdPrice) || 0;
    const stockNum = typeof newProdStock === "number" ? newProdStock : parseInt(newProdStock, 10) || 0;

    const tagsArray = newProdTags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const productData: Omit<Product, "id"> = {
      name: newProdName.trim(),
      category: finalCategory,
      price: priceNum,
      stock: stockNum,
      description: newProdDesc.trim() || "Producto de alta calidad para tu catálogo.",
      image: newProdImage.trim() || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
      tags: tagsArray.length > 0 ? tagsArray : ["Destacado"]
    };

    onAddProduct(productData);

    // Reset form fields
    setNewProdName("");
    setNewProdDesc("");
    setNewProdPrice(15000);
    setNewProdStock(10);
    setNewProdTags("3D, Nuevo");
    showToast(`¡Producto "${productData.name}" añadido al catálogo local!`, "success");
  };

  // Process Bulk JSON Text
  const handleProcessBulkJson = () => {
    setBulkError(null);
    try {
      const parsed = JSON.parse(jsonInputText);
      if (!Array.isArray(parsed)) {
        throw new Error("El JSON debe ser un arreglo de productos: [ { \"name\": \"...\", \"price\": 1000 }, ... ]");
      }

      const validProducts: Omit<Product, "id">[] = parsed.map((item: any, idx: number) => {
        if (!item.name) throw new Error(`El ítem en la posición ${idx + 1} no tiene la propiedad 'name'.`);
        return {
          name: String(item.name),
          category: String(item.category || "General"),
          price: Number(item.price) || 0,
          stock: Number(item.stock) || 1,
          description: String(item.description || "Sin descripción"),
          image: String(item.image || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80"),
          tags: Array.isArray(item.tags) ? item.tags : ["Importado"]
        };
      });

      onBulkAddProducts(validProducts);
      setJsonInputText("");
      setShowJsonImporter(false);
      showToast(`¡${validProducts.length} productos importados con éxito al catálogo!`, "success");
    } catch (err: any) {
      setBulkError(err.message || "Error al procesar el JSON");
    }
  };

  // Handle Bulk JSON file upload
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonInputText(text);
      setShowJsonImporter(true);
    };
    reader.readAsText(file);
  };

  // Insert variable into WhatsApp template editor
  const handleInsertVariable = (variable: string) => {
    setWaMessageTemplate(`${waMessageTemplate} ${variable}`);
    showToast(`Variable ${variable} insertada en la plantilla`, "success");
  };

  // Copy raw template string
  const handleCopyRawTemplate = () => {
    navigator.clipboard.writeText(waMessageTemplate);
    setCopiedTemplate(true);
    showToast("Plantilla de WhatsApp copiada al portapapeles", "success");
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  // Copy parsed sample message
  const handleCopyParsedMessage = () => {
    navigator.clipboard.writeText(parsedSampleMessage);
    setCopiedParsedMessage(true);
    showToast("Mensaje de encargo formateado copiado al portapapeles", "success");
    setTimeout(() => setCopiedParsedMessage(false), 2500);
  };

  // Test WhatsApp Link
  const handleTestWhatsAppLink = () => {
    const cleanPhone = sellerWhatsApp.replace(/\D/g, "") || "5491123456789";
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(parsedSampleMessage)}`;
    window.open(waUrl, "_blank");
  };

  // Filtered Products for management
  const filteredCatalog = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedFilterCategory === "Todas" || p.category === selectedFilterCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchCatalog.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchCatalog.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedFilterCategory, searchCatalog]);

  return (
    <div className="space-y-6">
      {/* Top Header Controls with Tabs Switcher */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-2xl">
            {subTab === "subir" ? <Upload size={22} /> : <MessageSquare size={22} />}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 tracking-tight">
              {subTab === "subir" ? "Módulo de Carga y Gestión de Catálogo" : "Plantilla de Encargo por WhatsApp"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {subTab === "subir" 
                ? "Sube individualmente o importa masivamente productos para publicar en tu tienda."
                : "Personaliza, copia y prueba el mensaje automático que tus clientes enviarán para encargar productos."}
            </p>
          </div>
        </div>

        {/* Navigation Tabs Pill */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setSubTab("subir")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "subir" 
                ? "bg-white text-[var(--primary-color)] shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload size={14} />
            <span>SUBIR PRODUCTOS</span>
            <span className="ml-1 bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab("plantilla")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "plantilla" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare size={14} />
            <span>PLANTILLA WHATSAPP</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SUBIR Y CARGAR PRODUCTOS */}
      {subTab === "subir" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Formulario para Cargar Producto (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-[var(--primary-color)]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Cargar Nuevo Producto
                </h3>
              </div>
              
              <button
                type="button"
                onClick={() => jsonFileInputRef.current?.click()}
                className="text-[10px] font-bold text-[var(--primary-color)] bg-[var(--primary-color)]/10 hover:bg-[var(--primary-color)]/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                title="Cargar archivo .json con múltiples productos"
              >
                <FileJson size={12} />
                <span>Importar JSON</span>
              </button>
              <input
                type="file"
                ref={jsonFileInputRef}
                onChange={handleJsonFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            <form onSubmit={handleSingleProductSubmit} className="space-y-4 text-xs">
              {/* Nombre */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Nombre del Producto / Servicio *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej: Mate Voronoi Impreso 3D"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all"
                />
              </div>

              {/* Categoría y Precio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/30 cursor-pointer transition-all"
                  >
                    <option value="Decoración">Decoración</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Mates">Mates</option>
                    <option value="Soportes">Soportes</option>
                    <option value="Servicios 3D">Servicios 3D</option>
                    <option value="NUEVA">+ Nueva categoría...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Precio Base (ARS) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all"
                    />
                  </div>
                  {priceMultiplier !== 1.0 && (
                    <span className="text-[9px] text-[var(--primary-color)] font-bold mt-0.5 block">
                      Precio final en tienda: ${Math.round((typeof newProdPrice === "number" ? newProdPrice : 0) * priceMultiplier).toLocaleString("es-AR")}
                    </span>
                  )}
                </div>
              </div>

              {/* Nueva Categoría Personalizada */}
              {newProdCategory === "NUEVA" && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Nombre de la Nueva Categoría
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Escribe la categoría (Ej: Lámparas)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/30"
                  />
                </div>
              )}

              {/* Stock y Tags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    Etiquetas / Tags
                  </label>
                  <input
                    type="text"
                    value={newProdTags}
                    onChange={(e) => setNewProdTags(e.target.value)}
                    placeholder="3D, Nuevo, Oferta"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/30"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detalles del producto, materiales, dimensiones, opciones de personalización..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all resize-none"
                />
              </div>

              {/* Selección de Imagen */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 flex items-center justify-between">
                  <span>Imagen del Producto</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageTab("preset")}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${imageTab === "preset" ? "bg-[var(--primary-color)] text-white" : "text-slate-500 hover:bg-slate-100"}`}
                    >
                      Ejemplos
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab("url")}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${imageTab === "url" ? "bg-[var(--primary-color)] text-white" : "text-slate-500 hover:bg-slate-100"}`}
                    >
                      URL Web
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab("file")}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${imageTab === "file" ? "bg-[var(--primary-color)] text-white" : "text-slate-500 hover:bg-slate-100"}`}
                    >
                      Subir Archivo
                    </button>
                  </div>
                </label>

                {imageTab === "preset" && (
                  <div className="grid grid-cols-5 gap-1.5 mt-2">
                    {PRESET_IMAGES.map((preset, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setNewProdImage(preset.url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          newProdImage === preset.url ? "border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/30 scale-105" : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {imageTab === "url" && (
                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] outline-none focus:bg-white"
                  />
                )}

                {imageTab === "file" && (
                  <div className="space-y-2 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-slate-50 border border-dashed border-slate-300 hover:bg-slate-100 rounded-xl text-center text-slate-600 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <ImageIcon size={16} className="text-[var(--primary-color)]" />
                      <span>Seleccionar imagen local</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}

                {/* Live Image Preview */}
                <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-150">
                  <img
                    src={newProdImage}
                    alt="Vista previa"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{newProdName || "Vista previa del producto"}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      ${Math.round((typeof newProdPrice === "number" ? newProdPrice : 0) * priceMultiplier).toLocaleString("es-AR")} · {newProdCategory}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                className="w-full py-3 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide mt-2"
                style={{ backgroundColor: "var(--primary-color)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color)"}
              >
                <Plus size={16} />
                <span>CARGAR AL CATÁLOGO</span>
              </button>
            </form>
          </div>

          {/* Right Column: Gestión y Vista del Catálogo (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Modal Importador de JSON */}
            {showJsonImporter && (
              <div className="bg-slate-900 text-white p-5 rounded-[28px] shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileJson size={18} className="text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Importador Masivo de Productos (JSON)</h3>
                  </div>
                  <button
                    onClick={() => setShowJsonImporter(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-[11px] text-slate-300">
                  Pega el contenido JSON con tus productos o arrastra el archivo. Debe ser un arreglo `[&#123; "name": "...", "price": 1000 &#125;]`.
                </p>

                <textarea
                  rows={6}
                  value={jsonInputText}
                  onChange={(e) => setJsonInputText(e.target.value)}
                  placeholder={`[\n  {\n    "name": "Soporte de Auriculares 3D",\n    "category": "Soportes",\n    "price": 12000,\n    "stock": 15,\n    "description": "Soporte ergonómico impreso en PLA Premium"\n  }\n]`}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 outline-none focus:border-emerald-500 resize-none"
                />

                {bulkError && (
                  <div className="p-2.5 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{bulkError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={handleProcessBulkJson}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Procesar e Importar Productos
                  </button>
                </div>
              </div>
            )}

            {/* Panel de Productos Cargados */}
            <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Layers size={16} className="text-[var(--primary-color)]" />
                    <span>Catálogo Actual ({products.length} productos)</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Gestión rápida de inventario. Modifica o elimina ítems subidos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowJsonImporter(!showJsonImporter)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileJson size={13} />
                    <span>Importar JSON</span>
                  </button>

                  {syncState === "pending_changes" && onSaveToGitHub && (
                    <button
                      onClick={onSaveToGitHub}
                      className="px-3.5 py-1.5 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-bold text-[11px] rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw size={13} />
                      <span>Guardar en GitHub</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Buscador y Filtro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchCatalog}
                    onChange={(e) => setSearchCatalog(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white"
                  />
                </div>

                <div className="relative">
                  <Filter size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <select
                    value={selectedFilterCategory}
                    onChange={(e) => setSelectedFilterCategory(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de Productos */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredCatalog.length > 0 ? (
                  filteredCatalog.map(prod => (
                    <div
                      key={prod.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-150 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-11 h-11 object-cover rounded-xl border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-800 truncate">{prod.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-extrabold text-[var(--primary-color)]">
                              ${Math.round(prod.price * priceMultiplier).toLocaleString("es-AR")}
                            </span>
                            <span>·</span>
                            <span className="bg-slate-200/80 px-1.5 py-0.2 rounded font-semibold text-slate-600">
                              {prod.category}
                            </span>
                            <span>·</span>
                            <span>Stock: {prod.stock}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onDeleteProduct(prod.id);
                            showToast(`Producto "${prod.name}" eliminado del catálogo local.`, "success");
                          }}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Package size={28} className="mx-auto text-slate-300 stroke-1 mb-2" />
                    <p className="text-xs font-bold">No hay productos que coincidan con la búsqueda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PLANTILLA WHATSAPP */}
      {subTab === "plantilla" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Editor de Plantilla y Variables (6 Cols) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-600" />
                  <span>Editor de Plantilla WhatsApp</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Inserta variables dinámicas para personalizar la plantilla de encargo.
                </p>
              </div>

              <button
                onClick={handleCopyRawTemplate}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                {copiedTemplate ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedTemplate ? "¡Copiada!" : "Copiar Plantilla"}</span>
              </button>
            </div>

            {/* Número Receptor */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Número de WhatsApp Vendedor Receptor *
              </label>
              <div className="relative">
                <Smartphone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={sellerWhatsApp}
                  onChange={(e) => setSellerWhatsApp(e.target.value)}
                  placeholder="5491123456789"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">
                Formato internacional con código de país sin espacios (Ej: 5491123456789).
              </span>
            </div>

            {/* Botones de Variables Rápidas */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">
                Variables Dinámicas Disponibles (haz clic para insertar):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: "{PRODUCTO}", desc: "Nombre del Producto" },
                  { tag: "{PRECIO}", desc: "Precio del Producto" },
                  { tag: "{TIENDA}", desc: "Nombre de la Tienda" },
                  { tag: "{DETALLES}", desc: "Descripción" },
                  { tag: "{WHATSAPP}", desc: "Tu Número WhatsApp" },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertVariable(item.tag)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                    title={`Insertar ${item.desc}`}
                  >
                    <span>+</span>
                    <span>{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Textarea */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Texto de la Plantilla de Encargo
              </label>
              <textarea
                rows={8}
                value={waMessageTemplate}
                onChange={(e) => setWaMessageTemplate(e.target.value)}
                placeholder="Hola! Me interesa encargar/consultar por el producto: *{PRODUCTO}* (Precio: {PRECIO})..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Acciones */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyRawTemplate}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {copiedTemplate ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>COPIAR PLANTILLA BASE</span>
              </button>

              <button
                onClick={handleTestWhatsAppLink}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                <span>PROBAR EN WHATSAPP</span>
              </button>
            </div>
          </div>

          {/* Right Column: Simulador en Vivo WhatsApp (6 Cols) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Smartphone size={16} className="text-emerald-600" />
                  <span>Simulador de Chat en Vivo</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Selecciona un producto de muestra para previsualizar el mensaje renderizado.
                </p>
              </div>

              {/* Selector de Producto de Prueba */}
              {products.length > 0 && (
                <select
                  value={previewProductId}
                  onChange={(e) => setPreviewProductId(e.target.value)}
                  className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none cursor-pointer max-w-[180px] truncate"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Pantalla Simulador de WhatsApp Chat */}
            <div className="bg-[#E5DDD5] rounded-2xl p-4 min-h-[380px] flex flex-col justify-between border border-slate-300 shadow-inner relative overflow-hidden">
              {/* WhatsApp Chat Header */}
              <div className="bg-[#075E54] text-white p-2.5 rounded-xl flex items-center gap-3 shadow-sm mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-black text-xs text-white uppercase border border-emerald-500">
                  {storeName.slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-extrabold leading-tight">{storeName}</p>
                  <p className="text-[9px] text-emerald-200 font-medium">En línea · Atención Comercial</p>
                </div>
              </div>

              {/* Chat Bubble (Message) */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="bg-[#DCF8C6] text-slate-900 p-3.5 rounded-2xl rounded-tr-none max-w-[90%] ml-auto shadow-sm border border-emerald-200/60 space-y-2 relative">
                  {/* Thumbnail inside chat if available */}
                  <div className="flex items-center gap-2 p-1.5 bg-white/70 rounded-xl border border-emerald-200/50">
                    <img
                      src={sampleProduct.image}
                      alt={sampleProduct.name}
                      className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[11px] text-slate-800 truncate">{sampleProduct.name}</p>
                      <p className="text-[10px] text-emerald-700 font-extrabold">
                        ${Math.round(sampleProduct.price * priceMultiplier).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>

                  {/* Rendered Message Text */}
                  <div className="text-xs whitespace-pre-line leading-relaxed font-sans text-slate-800 pt-1">
                    {parsedSampleMessage}
                  </div>

                  {/* Time and checks */}
                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 pt-1 font-mono">
                    <span>14:32</span>
                    <span className="text-sky-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Footer acciones en simulador */}
              <div className="mt-4 pt-3 border-t border-slate-300/60 flex items-center justify-between">
                <button
                  onClick={handleCopyParsedMessage}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-[11px] rounded-xl border border-slate-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedParsedMessage ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>Copiar Mensaje Renderizado</span>
                </button>

                <button
                  onClick={handleTestWhatsAppLink}
                  className="px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white font-extrabold text-[11px] rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
