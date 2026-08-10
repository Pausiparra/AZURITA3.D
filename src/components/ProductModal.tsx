import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Save, Layers, DollarSign, Archive, FileText, Image, Tag as TagIcon, Upload, Link } from "lucide-react";
import { Product } from "../types";

interface ProductModalProps {
  product: Product | null; // Null means adding a new product
  onSave: (product: Product) => void;
  onClose: () => void;
  categories: string[];
}

export default function ProductModal({ product, onSave, onClose, categories }: ProductModalProps) {
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    category: "Mobiliario",
    price: 0,
    stock: 0,
    description: "",
    imageUrl: "",
    tags: []
  });
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [tagsString, setTagsString] = useState("");
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");

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
      if (!categories.includes(product.category)) {
        setIsCustomCategory(true);
        setCustomCategory(product.category);
      } else {
        setIsCustomCategory(false);
      }
    } else {
      // Setup some beautiful default random image suggestions for a new item
      const randomImages = [
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=600"
      ];
      const randomImg = randomImages[Math.floor(Math.random() * randomImages.length)];
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
    }
  }, [product, categories]);

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
    
    // Parse tags
    const parsedTags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const finalCategory = isCustomCategory ? customCategory.trim() : form.category;

    if (!form.name.trim()) return;
    if (!finalCategory.trim()) return;

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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-md font-semibold text-slate-900">
              {product ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            <p className="text-xs text-slate-500">
              {product ? "Modifica los detalles del producto seleccionado" : "Agrega un nuevo artículo a tu catálogo"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Teclado Mecánico Inalámbrico"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers size={12} className="text-slate-400" />
              Categoría *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={isCustomCategory ? "__custom__" : form.category}
                onChange={handleCategorySelectChange}
                className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all cursor-pointer"
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
                  placeholder="Especificar categoría"
                  className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                  required
                />
              )}
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign size={12} className="text-slate-400" />
                Precio ($) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price || ""}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Archive size={12} className="text-slate-400" />
                Unidades en Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                min="0"
                step="1"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText size={12} className="text-slate-400" />
              Descripción
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe el producto (características, materiales, dimensiones, etc.)."
              rows={3}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Image Upload / URL Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Image size={12} className="text-slate-400" />
                Imagen del Producto *
              </span>
              <span className="text-[10px] text-[var(--primary-color)] font-bold">Selecciona una opción</span>
            </label>

            {/* Selector Tabs */}
            <div className="flex border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  imageTab === "upload"
                    ? "bg-white text-[var(--primary-color)] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Upload size={12} />
                Subir desde PC
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  imageTab === "url"
                    ? "bg-white text-[var(--primary-color)] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Link size={12} />
                Enlace Web (URL)
              </button>
            </div>

            {/* Inner field depending on selected tab */}
            {imageTab === "upload" ? (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl hover:border-[var(--primary-color)] bg-slate-50 hover:bg-[var(--primary-color)]/5 transition-all text-center p-3.5 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2.5 * 1024 * 1024) {
                            alert("La imagen es muy grande. Por favor selecciona una de menos de 2.5MB para mejor rendimiento.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setForm((prev) => ({
                              ...prev,
                              imageUrl: reader.result as string
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={18} className="text-slate-400 mx-auto mb-1.5" />
                    <span className="block text-[11px] font-semibold text-slate-600">
                      Hacé clic o arrastrá para subir
                    </span>
                    <span className="block text-[9px] text-slate-400 mt-0.5">
                      Soporta JPG, PNG, WEBP (Max: 2.5MB)
                    </span>
                  </div>
                </div>
                {form.imageUrl && (
                  <div className="relative w-16 h-16 rounded-xl border border-slate-100 overflow-hidden bg-slate-100 flex-shrink-0 group">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                      className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                {form.imageUrl && (
                  <div className="relative w-10 h-10 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <TagIcon size={12} className="text-slate-400" />
              Etiquetas (Tags)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="Ej: Oficina, Premium, Inalámbrico (separadas por comas)"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white rounded-xl transition-all shadow-sm shadow-violet-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              {product ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
