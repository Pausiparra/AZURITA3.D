import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Edit2, Trash2, Save, FileText, DollarSign, 
  Archive, Image, Tag as TagIcon, Layers, Plus, 
  Sparkles, TrendingUp, Github, GitCommit, Database, ShieldAlert, MessageSquare
} from "lucide-react";
import { Product } from "../types";
import { getCategoryStyles, getCategoryIcon } from "./ProductCard";

interface RightDetailPanelProps {
  product: Product | null;
  isAdding: boolean;
  categories: string[];
  onSave: (product: Product) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
  inventoryValue: number;
  totalProductsCount: number;
  totalStockUnits: number;
  syncState: string;
  remoteSha: string | null;
  onEncargarWhatsApp?: (product: Product) => void;
  priceMultiplier?: number;
}

export default function RightDetailPanel({
  product,
  isAdding,
  categories,
  onSave,
  onDelete,
  onClose,
  onStartAdding,
  onCancelAdding,
  inventoryValue,
  totalProductsCount,
  totalStockUnits,
  syncState,
  remoteSha,
  onEncargarWhatsApp,
  priceMultiplier = 1.0
}: RightDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
    imageUrl: "",
    tags: []
  });
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [tagsString, setTagsString] = useState("");

  // Sync form with product when selected
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        tags: product.tags || []
      });
      setTagsString(product.tags ? product.tags.join(", ") : "");
      setIsCustomCategory(!categories.includes(product.category));
      setCustomCategory(!categories.includes(product.category) ? product.category : "");
      setIsEditing(false); // Reset editing mode when selection changes
    } else if (isAdding) {
      // Pick a beautiful random Unsplash placeholder for a new product
      const placeholders = [
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600"
      ];
      const randomImg = placeholders[Math.floor(Math.random() * placeholders.length)];
      setForm({
        name: "",
        category: categories[0] || "Mobiliario",
        price: 0,
        stock: 10,
        description: "",
        imageUrl: randomImg,
        tags: []
      });
      setTagsString("");
      setIsCustomCategory(false);
      setCustomCategory("");
    }
  }, [product, isAdding, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? parseFloat(value) || 0 : value
    }));
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomCategory(true);
      setForm((prev) => ({ ...prev, category: "" }));
    } else {
      setIsCustomCategory(false);
      setForm((prev) => ({ ...prev, category: val }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const finalCategory = isCustomCategory ? customCategory.trim() : form.category;
    if (!finalCategory.trim()) return;

    const parsedTags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    onSave({
      id: product?.id || `prod-${Date.now()}`,
      name: form.name.trim(),
      category: finalCategory,
      price: Math.max(0, form.price),
      stock: Math.max(0, Math.floor(form.stock)),
      description: form.description.trim(),
      imageUrl: form.imageUrl?.trim() || undefined,
      tags: parsedTags
    });

    setIsEditing(false);
  };

  const style = product ? getCategoryStyles(product.category) : null;
  const icon = product ? getCategoryIcon(product.category) : null;

  return (
    <aside className="w-full lg:w-[380px] shrink-0 lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 bg-white rounded-[32px] border border-slate-200/80 shadow-md p-6 flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none">
      
      {/* 1. VIEWING MODE */}
      {product && !isEditing && (
        <div className="flex flex-col h-full justify-between gap-6">
          <div className="space-y-5">
            {/* Header: Title + Close Button */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style?.bg} ${style?.text}`}>
                {product.category}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                title="Cerrar detalles"
              >
                <X size={15} />
              </button>
            </div>

            {/* Product Image Frame */}
            <div className="relative aspect-[4/3] w-full rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <Layers size={40} className="stroke-1 mb-2" />
                  <span className="text-xs">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Title & Brand Icon Badge */}
            <div className="flex gap-3 items-start">
              <div className={`w-10 h-10 rounded-full shrink-0 ${style?.bg} flex items-center justify-center ${style?.iconColor}`}>
                {icon}
              </div>
              <div>
                <h3 className="font-extrabold text-[18px] tracking-tight text-slate-900 leading-tight">
                  {product.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">ID: {product.id.substring(0, 10)}</span>
              </div>
            </div>

            {/* Price and Stock Stats */}
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Precio Unitario</span>
                <span className="text-lg font-black text-slate-900">
                  ${Math.round(product.price * priceMultiplier).toLocaleString("es-AR")}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Inventario</span>
                <span className="text-lg font-black text-slate-900">
                  {product.stock} {product.stock === 1 ? "unidad" : "unidades"}
                </span>
              </div>
            </div>

            {/* Encargar por WhatsApp Action */}
            {onEncargarWhatsApp && (
              <button
                type="button"
                onClick={() => onEncargarWhatsApp(product)}
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <MessageSquare size={16} className="fill-white/20" />
                <span>Encargar por WhatsApp</span>
              </button>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <FileText size={11} /> Descripción
              </span>
              <p className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto pr-1">
                {product.description || "Sin descripción proporcionada para este producto."}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <TagIcon size={11} /> Etiquetas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-[10px] text-slate-500 font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 shrink-0">
            <button
              onClick={() => {
                if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
                  onDelete(product.id);
                }
              }}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              Eliminar
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Edit2 size={13} />
              Editar Detalles
            </button>
          </div>
        </div>
      )}

      {/* 2. FORM EDITING / ADDING MODE */}
      {(isEditing || isAdding) && (
        <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between gap-5">
          <div className="space-y-4">
            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-[15px] text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  {isAdding ? "Añadir Producto" : "Editar Producto"}
                </h3>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Introduce las especificaciones</span>
              </div>
              <button
                type="button"
                onClick={isAdding ? onCancelAdding : () => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {/* Product Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Silla Ergonómica Pro"
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Layers size={10} /> Categoría *
                </label>
                <div className="space-y-2">
                  <select
                    value={isCustomCategory ? "__custom__" : form.category}
                    onChange={handleCategorySelectChange}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 outline-none transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">+ Nueva categoría...</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Especificar categoría personalizada"
                      className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                      required
                    />
                  )}
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <DollarSign size={10} /> Precio ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <Archive size={10} /> Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                    step="1"
                    className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Introduce detalles sobre materiales, dimensiones, etc."
                  rows={3}
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Image size={10} /> URL de Imagen
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <TagIcon size={10} /> Etiquetas
                </label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="Separadas por comas (Oficina, Premium)"
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={isAdding ? onCancelAdding : () => setIsEditing(false)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 bg-[#47726D] hover:bg-[#3D635E] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Save size={13} />
              {isAdding ? "Crear Producto" : "Guardar Cambios"}
            </button>
          </div>
        </form>
      )}

      {/* 3. DEFAULT STATE: WAREHOUSE GENERAL DASHBOARD */}
      {!product && !isAdding && (
        <div className="flex flex-col h-full justify-between gap-6">
          <div className="space-y-6">
            {/* Header / Info bar */}
            <div>
              <h3 className="font-extrabold text-[16px] text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp size={16} className="text-[#47726D]" />
                Panel de Inventario
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Vista global de la biblioteca de recursos</p>
            </div>

            {/* General Metrics List */}
            <div className="space-y-3">
              {/* Value Bento box */}
              <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F1EEEC] border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Valor Financiero Total</span>
                <span className="text-2xl font-black text-[#1C2B29] mt-1.5">
                  ${inventoryValue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Sumatoria acumulada de precios por stock.</span>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Total Artículos</span>
                  <span className="text-xl font-bold text-slate-800 block mt-0.5">{totalProductsCount}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Stock Total</span>
                  <span className="text-xl font-bold text-slate-800 block mt-0.5">{totalStockUnits}</span>
                </div>
              </div>
            </div>

            {/* Sync connection details / GitHub indicator */}
            <div className="bg-slate-50 border border-slate-200/85 rounded-2xl p-4 space-y-2.5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Github size={11} /> Estado de Sincronización
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Estado:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    syncState === "synced" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : syncState === "pending_changes" 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-slate-150 text-slate-600"
                  }`}>
                    {syncState === "synced" ? "Sincronizado" : syncState === "pending_changes" ? "Cambios locales" : "Demo local"}
                  </span>
                </div>
                {remoteSha && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">SHA Remoto:</span>
                    <span className="font-mono text-[10px] text-slate-600 font-bold">{remoteSha.substring(0, 8)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick action: Add new product */}
          <button
            onClick={onStartAdding}
            className="w-full py-3 bg-[#47726D] hover:bg-[#3D635E] text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-auto"
          >
            <Plus size={14} />
            Añadir Nuevo Producto
          </button>
        </div>
      )}

    </aside>
  );
}
