import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Github, Key, Folder, GitBranch, FileJson, Save, 
  CheckCircle2, AlertCircle, ExternalLink, Download, Copy, Check,
  SlidersHorizontal, Phone, MessageSquare, ShoppingBag, Shield, Hash, RefreshCw,
  Palette, Image, Smile, Upload, X, Instagram, Facebook, Twitter, Linkedin, Mail, Store, Share2, Youtube
} from "lucide-react";
import { GitHubConfig } from "../types";

interface GitHubConfigPanelProps {
  config: GitHubConfig;
  onSave: (newConfig: GitHubConfig) => void;
  syncStatus: string;
  errorMessage: string | null;
  onTestConnection: () => void;
  isTesting: boolean;
  currentCatalogJson: string;
  adminPin: string;
  setAdminPin: (val: string) => void;
  storeName: string;
  setStoreName: (val: string) => void;
  storeSlogan: string;
  setStoreSlogan: (val: string) => void;
  priceMultiplier: number;
  setPriceMultiplier: (val: number) => void;
  waMessageTemplate: string;
  setWaMessageTemplate: (val: string) => void;
  sellerWhatsApp: string;
  setSellerWhatsApp: (val: string) => void;
  hideClientModeButton: boolean;
  setHideClientModeButton: (val: boolean) => void;
  primaryColor: string;
  setPrimaryColor: (val: string) => void;
  themeBgColor: string;
  setThemeBgColor: (val: string) => void;
  buttonStyle: string;
  setButtonStyle: (val: string) => void;
  fontStyle: string;
  setFontStyle: (val: string) => void;
  // Social Channels & Contact Info with Toggles
  instagramUrl: string;
  setInstagramUrl: (val: string) => void;
  instagramEnabled: boolean;
  setInstagramEnabled: (val: boolean) => void;

  facebookUrl: string;
  setFacebookUrl: (val: string) => void;
  facebookEnabled: boolean;
  setFacebookEnabled: (val: boolean) => void;

  twitterUrl: string;
  setTwitterUrl: (val: string) => void;
  twitterEnabled: boolean;
  setTwitterEnabled: (val: boolean) => void;

  linkedinUrl: string;
  setLinkedinUrl: (val: string) => void;
  linkedinEnabled: boolean;
  setLinkedinEnabled: (val: boolean) => void;

  emailContact: string;
  setEmailContact: (val: string) => void;
  emailEnabled: boolean;
  setEmailEnabled: (val: boolean) => void;

  mercadolibreUrl: string;
  setMercadolibreUrl: (val: string) => void;
  mercadolibreEnabled: boolean;
  setMercadolibreEnabled: (val: boolean) => void;

  youtubeUrl: string;
  setYoutubeUrl: (val: string) => void;
  youtubeEnabled: boolean;
  setYoutubeEnabled: (val: boolean) => void;

  tiktokUrl: string;
  setTiktokUrl: (val: string) => void;
  tiktokEnabled: boolean;
  setTiktokEnabled: (val: boolean) => void;

  storeLogoUrl: string;
  setStoreLogoUrl: (val: string) => void;
  storeEmoji: string;
  setStoreEmoji: (val: string) => void;
  showNameWithLogo: boolean;
  setShowNameWithLogo: (val: boolean) => void;
  customBaseUrl?: string;
  setCustomBaseUrl?: (val: string) => void;
  onInitializeJson?: () => void;
}

export default function GitHubConfigPanel({
  config,
  onSave,
  syncStatus,
  errorMessage,
  onTestConnection,
  isTesting,
  currentCatalogJson,
  adminPin,
  setAdminPin,
  storeName,
  setStoreName,
  storeSlogan,
  setStoreSlogan,
  priceMultiplier,
  setPriceMultiplier,
  waMessageTemplate,
  setWaMessageTemplate,
  sellerWhatsApp,
  setSellerWhatsApp,
  hideClientModeButton,
  setHideClientModeButton,
  primaryColor,
  setPrimaryColor,
  themeBgColor,
  setThemeBgColor,
  buttonStyle,
  setButtonStyle,
  fontStyle,
  setFontStyle,
  instagramUrl,
  setInstagramUrl,
  instagramEnabled,
  setInstagramEnabled,
  facebookUrl,
  setFacebookUrl,
  facebookEnabled,
  setFacebookEnabled,
  twitterUrl,
  setTwitterUrl,
  twitterEnabled,
  setTwitterEnabled,
  linkedinUrl,
  setLinkedinUrl,
  linkedinEnabled,
  setLinkedinEnabled,
  emailContact,
  setEmailContact,
  emailEnabled,
  setEmailEnabled,
  mercadolibreUrl,
  setMercadolibreUrl,
  mercadolibreEnabled,
  setMercadolibreEnabled,
  youtubeUrl,
  setYoutubeUrl,
  youtubeEnabled,
  setYoutubeEnabled,
  tiktokUrl,
  setTiktokUrl,
  tiktokEnabled,
  setTiktokEnabled,
  storeLogoUrl,
  setStoreLogoUrl,
  storeEmoji,
  setStoreEmoji,
  showNameWithLogo,
  setShowNameWithLogo,
  customBaseUrl = "",
  setCustomBaseUrl,
  onInitializeJson
}: GitHubConfigPanelProps) {
  const [form, setForm] = useState<GitHubConfig>({ ...config });
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedClient, setCopiedClient] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [isStoreSaved, setIsStoreSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveBaseUrl = (customBaseUrl && customBaseUrl.trim()) 
    ? customBaseUrl.trim().replace(/\/+$/, "") 
    : `${window.location.origin}${window.location.pathname}`.replace(/\/+$/, "");

  const clientLink = `${effectiveBaseUrl}${effectiveBaseUrl.includes("?") ? "&" : "?"}client=true`;
  const adminLink = `${effectiveBaseUrl}${effectiveBaseUrl.includes("?") ? "&" : "?"}admin=true`;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStoreSaved(true);
    setTimeout(() => setIsStoreSaved(false), 2000);
  };

  const handleCopyClientLink = () => {
    navigator.clipboard.writeText(clientLink);
    setCopiedClient(true);
    setHideClientModeButton(true);
    setTimeout(() => setCopiedClient(false), 2000);
  };

  const handleCopyAdminLink = () => {
    navigator.clipboard.writeText(adminLink);
    setCopiedAdmin(true);
    setTimeout(() => setCopiedAdmin(false), 2000);
  };

  useEffect(() => {
    setForm({ ...config });
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      onSave(updated);
      return updated;
    });
    setIsSaved(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(currentCatalogJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([currentCatalogJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = form.filePath || "catalogo.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Enlaces de Acceso Rápidos Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-purple-50 text-[#8B5CF6] rounded-2xl border border-purple-100">
            <ExternalLink size={20} />
          </div>
          <div>
            <h3 className="text-md font-bold text-slate-800">Enlaces de Acceso de tu Tienda</h3>
            <p className="text-xs text-slate-500">Utiliza estos links para compartir el catálogo público con tus clientes o para ingresar como vendedor</p>
          </div>
        </div>

        {/* Custom Domain / Base URL Config Field */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>🌐</span>
              <span>Personalizar URL Base de la Tienda (GitHub Pages / Dominio Propio):</span>
            </label>
            {customBaseUrl && setCustomBaseUrl && (
              <button
                type="button"
                onClick={() => setCustomBaseUrl("")}
                className="text-[10px] text-[#8B5CF6] hover:underline font-semibold cursor-pointer"
              >
                Restablecer URL por defecto
              </button>
            )}
          </div>
          <input
            type="text"
            value={customBaseUrl}
            onChange={(e) => setCustomBaseUrl?.(e.target.value)}
            placeholder={`Por defecto: ${window.location.origin}${window.location.pathname} (ej. https://tu-usuario.github.io/tu-repo)`}
            className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700 placeholder:text-slate-400"
          />
          <p className="text-[10px] text-slate-500 leading-normal">
            💡 <strong>Para publicar en GitHub Pages:</strong> Coloca aquí el enlace de tu repositorio o sitio web desplegado (ej: <code className="bg-slate-200/70 px-1 py-0.5 rounded text-slate-800 font-mono">https://tu-usuario.github.io/tu-repo</code>). Los enlaces de Cliente y Administrador se actualizarán al instante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Link Box */}
          <div className="p-4.5 bg-[#8B5CF6]/5 border border-[#8B5CF6]/15 rounded-2xl flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-2 py-0.5 rounded-full font-black tracking-wider uppercase">
                Para Clientes (Público)
              </span>
              <h4 className="text-xs font-bold text-slate-800 pt-1">Link del Catálogo para Clientes</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Envía este link a tus clientes. Tendrán acceso de solo lectura al catálogo, datos de transferencia y contacto, con el carrito de compras a tu WhatsApp. <strong>No podrán modificar productos ni configuraciones</strong>.
              </p>
            </div>
            <div className="bg-white border border-slate-150 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-hidden">
              <input
                type="text"
                readOnly
                value={clientLink}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="font-mono text-[10px] text-slate-600 bg-transparent outline-none flex-1 truncate pr-1 cursor-pointer"
                title="Haz clic para seleccionar todo"
              />
              <button
                type="button"
                onClick={handleCopyClientLink}
                className="px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                {copiedClient ? <Check size={11} /> : <Copy size={11} />}
                {copiedClient ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Admin Link Box */}
          <div className="p-4.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] bg-slate-200/60 text-slate-600 border border-slate-300/30 px-2 py-0.5 rounded-full font-black tracking-wider uppercase">
                Para el Vendedor (Administrador)
              </span>
              <h4 className="text-xs font-bold text-slate-800 pt-1">Acceso Directo de Administrador</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Usa este link para acceder tú. Te permite activar directamente el modo de edición de productos, actualizar stock, ajustar precios y sincronizar con GitHub sin necesidad de ingresar PIN manualmente.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-hidden">
              <input
                type="text"
                readOnly
                value={adminLink}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="font-mono text-[10px] text-slate-600 bg-transparent outline-none flex-1 truncate pr-1 cursor-pointer"
                title="Haz clic para seleccionar todo"
              />
              <button
                type="button"
                onClick={handleCopyAdminLink}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                {copiedAdmin ? <Check size={11} /> : <Copy size={11} />}
                {copiedAdmin ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card 1: GitHub Connection */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-slate-50 text-slate-800 rounded-xl border border-slate-100">
            <Github size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Conexión con GitHub</h2>
            <p className="text-xs text-slate-500">Configura las credenciales de tu repositorio de destino</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Key size={13} className="text-slate-400" />
              Token de Acceso Personal (PAT) *
            </label>
            <input
              type="password"
              name="token"
              value={form.token}
              onChange={handleChange}
              placeholder="github_pat_..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Requiere permisos mínimos de escritura en repositorios (<code className="bg-slate-100 px-1 py-0.5 rounded">repo</code> o acceso detallado a contenido).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Github size={13} className="text-slate-400" />
                Usuario / Organización de GitHub *
              </label>
              <input
                type="text"
                name="owner"
                value={form.owner}
                onChange={handleChange}
                placeholder="octocat"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Folder size={13} className="text-slate-400" />
                Nombre del Repositorio *
              </label>
              <input
                type="text"
                name="repo"
                value={form.repo}
                onChange={handleChange}
                placeholder="mi-catalogo-productos"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GitBranch size={13} className="text-slate-400" />
                Rama (Branch)
              </label>
              <input
                type="text"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="main"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileJson size={13} className="text-slate-400" />
                Ruta del Archivo JSON *
              </label>
              <input
                type="text"
                name="filePath"
                value={form.filePath}
                onChange={handleChange}
                placeholder="catalog.json"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onSave(form);
                  onTestConnection();
                }}
                disabled={isTesting || !form.token || !form.owner || !form.repo || !form.filePath}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
              >
                {isTesting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin text-slate-500" />
                    <span>Probando conexión...</span>
                  </>
                ) : (
                  <>
                    <Github size={13} />
                    <span>Probar Conexión</span>
                  </>
                )}
              </button>

              {onInitializeJson && form.token && form.owner && form.repo && (
                <button
                  type="button"
                  onClick={() => {
                    onSave(form);
                    onInitializeJson();
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Genera o restablece el archivo catalog.json en tu repositorio de GitHub"
                >
                  <FileJson size={14} />
                  <span>Crear / Inicializar JSON en GitHub</span>
                </button>
              )}
              
              {syncStatus !== "disconnected" && syncStatus !== "loading" && syncStatus !== "error" && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 size={13} />
                  Conectado con GitHub
                </span>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              {isSaved ? "¡Guardado en Navegador!" : "Guardar Configuración"}
            </button>
          </div>
        </form>

        {syncStatus === "synced" && !errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 shadow-sm"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-900">Conexión Exitosa con GitHub</p>
              <p className="text-emerald-700 leading-relaxed">
                El repositorio <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-900">{form.owner}/{form.repo}</code> y el archivo <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-900">{form.filePath}</code> están vinculados. Tus productos se sincronizarán directamente.
              </p>
            </div>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start justify-between gap-2 shadow-sm"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <div className="space-y-1.5">
                <p className="font-bold text-red-900">Aviso de Conexión / Archivo JSON</p>
                <p className="leading-relaxed text-red-700">{errorMessage}</p>
                {onInitializeJson && (
                  <button
                    type="button"
                    onClick={() => {
                      onSave(form);
                      onInitializeJson();
                    }}
                    className="mt-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileJson size={13} />
                    <span>Crear / Inicializar archivo JSON en GitHub</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
        </div>

        {/* Card 2: Store & Security Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl border border-[#8B5CF6]/20">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 font-sans">Ajustes de Tienda y Seguridad</h2>
              <p className="text-xs text-slate-500">Personaliza el nombre, eslogan, precios, número de WhatsApp y PIN de administrador</p>
            </div>
          </div>

          <form onSubmit={handleSaveStoreSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-slate-400" />
                  Nombre de la Tienda
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-slate-400" />
                  Eslogan o Subtítulo
                </label>
                <input
                  type="text"
                  value={storeSlogan}
                  onChange={(e) => setStoreSlogan(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" />
                  WhatsApp del Vendedor
                </label>
                <input
                  type="text"
                  value={sellerWhatsApp}
                  onChange={(e) => setSellerWhatsApp(e.target.value)}
                  placeholder="5491123456789"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all font-mono text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">Código de país y de área, sin símbolos ni espacios (ej: 5491123456789)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Shield size={13} className="text-slate-400" />
                  PIN de Acceso Administrador (4 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={adminPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setAdminPin(val);
                  }}
                  placeholder="1234"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all font-mono tracking-widest text-center font-bold text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">PIN numérico de 4 dígitos para proteger este panel de administrador.</p>
              </div>
            </div>

            {/* Ocultar botón Modo Cliente */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="hideClientModeButton"
                checked={hideClientModeButton}
                onChange={(e) => setHideClientModeButton(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]/30 accent-[var(--primary-color)] cursor-pointer"
              />
              <div className="space-y-0.5">
                <label htmlFor="hideClientModeButton" className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                  <Shield size={13} className="text-[var(--primary-color)]" />
                  Ocultar acceso "Modo Cliente (Ingresar PIN)" en el menú lateral
                </label>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Al activar esta opción, el botón para ingresar el PIN administrador desaparecerá por completo del menú lateral (ideal para cuando envías el link a tus clientes). Podrás seguir ingresando al panel administrador usando tu enlace directo exclusivo. Se activa automáticamente al copiar el link de clientes arriba.
                </p>
              </div>
            </div>

            {/* PERSONALIZACIÓN VISUAL (Colores y Logo) */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                <Palette size={16} className="text-[var(--primary-color)]" />
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Diseño y Personalización de Tienda</h3>
                  <p className="text-[10px] text-slate-400">Ajusta los colores y la identidad visual de tu tienda</p>
                </div>
              </div>

              {/* Selector de Color de Tema */}
              <div className="space-y-2.5">
                <label className="block text-[11px] uppercase tracking-wide font-black text-slate-600">Color Primario de la Tienda</label>
                
                <div className="flex flex-wrap gap-2.5 items-center">
                  {[
                    { name: "Violeta Místico", hex: "#8B5CF6" },
                    { name: "Azul Eléctrico", hex: "#3B82F6" },
                    { name: "Verde Esmeralda", hex: "#10B981" },
                    { name: "Rojo Carmesí", hex: "#EF4444" },
                    { name: "Rosa Neón", hex: "#EC4899" },
                    { name: "Naranja Atardecer", hex: "#F59E0B" },
                    { name: "Gris Carbón", hex: "#4B5563" }
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      title={preset.name}
                      style={{ backgroundColor: preset.hex }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer shadow-sm hover:scale-110 ${
                        primaryColor === preset.hex ? "border-white ring-2 ring-slate-800 scale-105" : "border-transparent"
                      }`}
                    >
                      {primaryColor === preset.hex && (
                        <Check size={14} className="text-white drop-shadow" />
                      )}
                    </button>
                  ))}

                  {/* Picker de Color Personalizado */}
                  <div className="h-7 w-px bg-slate-200 mx-1" />
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white shadow-sm"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={7}
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg outline-none font-mono font-bold text-slate-700 text-center uppercase focus:border-[var(--primary-color)]"
                    />
                  </div>
                </div>
              </div>

              {/* Selector de Logotipo / Imagen */}
              <div className="space-y-3.5 border-t border-slate-200/60 pt-4.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wide font-black text-slate-600">Identidad de la Tienda (Logotipo)</label>
                  {storeLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setStoreLogoUrl("")}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-all cursor-pointer font-sans"
                    >
                      <X size={11} />
                      Eliminar Logotipo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Carga del Logo */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-500">Cargar Archivo de Logotipo (Local)</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                      >
                        <Upload size={13} className="text-slate-500" />
                        Subir Imagen (.png, .jpg)
                      </button>
                      {storeLogoUrl && (
                        <div className="flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <img src={storeLogoUrl} alt="Vista previa" className="w-8 h-8 rounded-full object-cover" />
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400">La imagen se convertirá y guardará directamente en tu navegador de forma segura.</p>
                  </div>

                  {/* URL de Logotipo o Emoji */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-500">O ingresa URL externa de Logotipo</span>
                    <input
                      type="text"
                      placeholder="https://ejemplo.com/logo.png"
                      value={storeLogoUrl}
                      onChange={(e) => setStoreLogoUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-[var(--primary-color)] outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Emoji como alternativa */}
                <div className="space-y-2 border-t border-slate-200/40 pt-3">
                  <span className="block text-[10px] font-bold text-slate-500">O elige un Emoji Distintivo (Si no usas imagen)</span>
                  <div className="flex flex-wrap gap-2 items-center">
                    {["🔮", "🎨", "🚀", "🤖", "🧩", "⚡", "🌟", "⚙️", "🛍️", "💎", "🦖", "🍟"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setStoreEmoji(emoji);
                        }}
                        className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg border transition-all cursor-pointer hover:bg-white hover:scale-105 shadow-sm ${
                          storeEmoji === emoji && !storeLogoUrl ? "bg-white border-[var(--primary-color)] ring-1 ring-[var(--primary-color)]/25" : "bg-slate-100 border-slate-200"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                    
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="Otro"
                      value={storeEmoji}
                      onChange={(e) => setStoreEmoji(e.target.value)}
                      className="w-12 h-8 px-2 py-1 text-center text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-[var(--primary-color)]"
                    />
                  </div>
                </div>

                {/* Checkbox para mostrar nombre de la tienda junto al logo */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="showNameWithLogo"
                    checked={showNameWithLogo}
                    onChange={(e) => setShowNameWithLogo(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]/20 accent-[var(--primary-color)] cursor-pointer"
                  />
                  <label htmlFor="showNameWithLogo" className="text-[10px] font-bold text-slate-600 cursor-pointer select-none">
                    Mostrar el nombre de la tienda junto con el Logotipo de imagen
                  </label>
                </div>

                {/* Selector de Color de Fondo */}
                <div className="space-y-2.5 border-t border-slate-200/60 pt-4">
                  <label className="block text-[11px] uppercase tracking-wide font-black text-slate-600">Color de Fondo de la Tienda</label>
                  <p className="text-[9px] text-slate-400">Define el tono del fondo de la aplicación (afecta al fondo principal)</p>
                  
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {[
                      { name: "Lavanda Suave (Defecto)", hex: "#F6F4F9" },
                      { name: "Azul Brisa", hex: "#F0F4F8" },
                      { name: "Crema Cálida", hex: "#FAF6F0" },
                      { name: "Blanco Puro", hex: "#FFFFFF" },
                      { name: "Verde Menta", hex: "#F0FAF7" },
                      { name: "Gris Nube", hex: "#F3F4F6" },
                      { name: "Modo Oscuro (Obsidiana)", hex: "#0F172A" }
                    ].map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => {
                          setThemeBgColor(preset.hex);
                          localStorage.setItem("azurita_theme_bg_color", preset.hex);
                        }}
                        title={preset.name}
                        style={{ backgroundColor: preset.hex }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 transition-all cursor-pointer shadow-sm hover:scale-110 ${
                          themeBgColor === preset.hex ? "ring-2 ring-slate-800 scale-105" : ""
                        }`}
                      >
                        {themeBgColor === preset.hex && (
                          <Check size={14} className={preset.hex === "#0F172A" ? "text-white" : "text-slate-800"} />
                        )}
                      </button>
                    ))}

                    {/* Picker de Color Personalizado */}
                    <div className="h-7 w-px bg-slate-200 mx-1" />
                    
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="color"
                          value={themeBgColor}
                          onChange={(e) => {
                            setThemeBgColor(e.target.value);
                            localStorage.setItem("azurita_theme_bg_color", e.target.value);
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white shadow-sm"
                        />
                      </div>
                      <input
                        type="text"
                        maxLength={7}
                        value={themeBgColor}
                        onChange={(e) => {
                          setThemeBgColor(e.target.value);
                          localStorage.setItem("azurita_theme_bg_color", e.target.value);
                        }}
                        className="w-20 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg outline-none font-mono font-bold text-slate-700 text-center uppercase focus:border-[var(--primary-color)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Formato y Estilo de Botones */}
                <div className="space-y-3 border-t border-slate-200/60 pt-4">
                  <label className="block text-[11px] uppercase tracking-wide font-black text-slate-600">Estilo y Formato de Botones</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "Muy Redondeado", value: "rounded-xl", preview: "Rounded XL" },
                      { name: "Píldora / Óvalo", value: "rounded-full", preview: "Rounded Full" },
                      { name: "Redondeado Suave", value: "rounded-lg", preview: "Rounded LG" },
                      { name: "Recto / Brutalista", value: "rounded-none", preview: "Square" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setButtonStyle(opt.value);
                          localStorage.setItem("azurita_button_style", opt.value);
                        }}
                        className={`p-2.5 border rounded-xl text-left cursor-pointer transition-all ${
                          buttonStyle === opt.value
                            ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5 text-[var(--primary-color)] font-bold"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider">{opt.name}</div>
                        <div className={`mt-1 text-center py-1 text-[9px] bg-slate-100 rounded text-slate-500 font-mono ${opt.value}`}>
                          Abc
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuentes de Letra */}
                <div className="space-y-3 border-t border-slate-200/60 pt-4">
                  <label className="block text-[11px] uppercase tracking-wide font-black text-slate-600">Tipografía de la Tienda</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "Inter (Por Defecto)", value: "font-sans", preview: "Sans-serif" },
                      { name: "Space Grotesk", value: "font-space-grotesk", preview: "Tech Modern" },
                      { name: "Playfair Display", value: "font-playfair", preview: "Serif Elegante" },
                      { name: "JetBrains Mono", value: "font-mono", preview: "Código Técnico" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setFontStyle(opt.value);
                          localStorage.setItem("azurita_font_style", opt.value);
                        }}
                        className={`p-2.5 border rounded-xl text-left cursor-pointer transition-all ${
                          fontStyle === opt.value
                            ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5 text-[var(--primary-color)] font-bold"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider">{opt.name}</div>
                        <div className="text-[11px] mt-1 text-slate-400 font-medium">
                          {opt.preview}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ENLACES DE REDES SOCIALES Y CANALES DE CONTACTO CON TOGGLES */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      Redes Sociales y Canales de Contacto
                    </h3>
                    <p className="text-xs text-slate-500">
                      Gestiona la presencia digital de tu marca. Habilita o deshabilita cada canal con el interruptor para controlar su visibilidad en el sitio público sin borrar el enlace.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Instagram */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-pink-200 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-pink-50 text-pink-600 border border-pink-200 rounded-xl">
                        <Instagram size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Instagram</h4>
                        <p className="text-[10px] text-slate-400">Perfil de la marca</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={instagramEnabled}
                        onChange={(e) => {
                          setInstagramEnabled(e.target.checked);
                          localStorage.setItem("azurita_instagram_enabled", e.target.checked ? "true" : "false");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className={`ml-2 text-[10px] font-bold ${instagramEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                        {instagramEnabled ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="https://instagram.com/tu_usuario"
                    value={instagramUrl}
                    onChange={(e) => {
                      setInstagramUrl(e.target.value);
                      localStorage.setItem("azurita_instagram_url", e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700"
                  />
                  <div className="text-[10px] font-semibold">
                    {instagramEnabled && instagramUrl.trim() ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Visible en la web</span>
                    ) : instagramEnabled ? (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} /> Ingrese una URL</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><X size={11} /> Oculto en la web</span>
                    )}
                  </div>
                </div>

                {/* 2. Facebook */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl">
                        <Facebook size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Facebook</h4>
                        <p className="text-[10px] text-slate-400">Página de Facebook</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={facebookEnabled}
                        onChange={(e) => {
                          setFacebookEnabled(e.target.checked);
                          localStorage.setItem("azurita_facebook_enabled", e.target.checked ? "true" : "false");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className={`ml-2 text-[10px] font-bold ${facebookEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                        {facebookEnabled ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="https://facebook.com/tu_pagina"
                    value={facebookUrl}
                    onChange={(e) => {
                      setFacebookUrl(e.target.value);
                      localStorage.setItem("azurita_facebook_url", e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700"
                  />
                  <div className="text-[10px] font-semibold">
                    {facebookEnabled && facebookUrl.trim() ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Visible en la web</span>
                    ) : facebookEnabled ? (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} /> Ingrese una URL</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><X size={11} /> Oculto en la web</span>
                    )}
                  </div>
                </div>

                {/* 3. Twitter / X */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl">
                        <Twitter size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Twitter / X</h4>
                        <p className="text-[10px] text-slate-400">Perfil en X</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={twitterEnabled}
                        onChange={(e) => {
                          setTwitterEnabled(e.target.checked);
                          localStorage.setItem("azurita_twitter_enabled", e.target.checked ? "true" : "false");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className={`ml-2 text-[10px] font-bold ${twitterEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                        {twitterEnabled ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="https://x.com/tu_usuario"
                    value={twitterUrl}
                    onChange={(e) => {
                      setTwitterUrl(e.target.value);
                      localStorage.setItem("azurita_twitter_url", e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700"
                  />
                  <div className="text-[10px] font-semibold">
                    {twitterEnabled && twitterUrl.trim() ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Visible en la web</span>
                    ) : twitterEnabled ? (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} /> Ingrese una URL</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><X size={11} /> Oculto en la web</span>
                    )}
                  </div>
                </div>

                {/* 4. LinkedIn */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl">
                        <Linkedin size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">LinkedIn</h4>
                        <p className="text-[10px] text-slate-400">Perfil corporativo</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={linkedinEnabled}
                        onChange={(e) => {
                          setLinkedinEnabled(e.target.checked);
                          localStorage.setItem("azurita_linkedin_enabled", e.target.checked ? "true" : "false");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className={`ml-2 text-[10px] font-bold ${linkedinEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                        {linkedinEnabled ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/company/tu_empresa"
                    value={linkedinUrl}
                    onChange={(e) => {
                      setLinkedinUrl(e.target.value);
                      localStorage.setItem("azurita_linkedin_url", e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700"
                  />
                  <div className="text-[10px] font-semibold">
                    {linkedinEnabled && linkedinUrl.trim() ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Visible en la web</span>
                    ) : linkedinEnabled ? (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} /> Ingrese una URL</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><X size={11} /> Oculto en la web</span>
                    )}
                  </div>
                </div>

                {/* 5. Correo Electrónico (Mail) */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-red-200 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-xl">
                        <Mail size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Correo Electrónico (Mail)</h4>
                        <p className="text-[10px] text-slate-400">Atención al cliente</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={emailEnabled}
                        onChange={(e) => {
                          setEmailEnabled(e.target.checked);
                          localStorage.setItem("azurita_email_enabled", e.target.checked ? "true" : "false");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className={`ml-2 text-[10px] font-bold ${emailEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                        {emailEnabled ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                  <input
                    type="email"
                    placeholder="contacto@azurita3d.com"
                    value={emailContact}
                    onChange={(e) => {
                      setEmailContact(e.target.value);
                      localStorage.setItem("azurita_email_contact", e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700"
                  />
                  <div className="text-[10px] font-semibold">
                    {emailEnabled && emailContact.trim() ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Visible en la web (mailto:)</span>
                    ) : emailEnabled ? (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} /> Ingrese un correo</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><X size={11} /> Oculto en la web</span>
                    )}
                  </div>
                </div>

                {/* 6. MercadoLibre */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-amber-300 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-50 text-amber-700 border border-amber-300 rounded-xl">
                        <ShoppingBag size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">MercadoLibre</h4>
                        <p className="text-[10px] text-slate-400">Perfil de vendedor directo</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={mercadolibreEnabled}
                        onChange={(e) => {
                          setMercadolibreEnabled(e.target.checked);
                          localStorage.setItem("azurita_mercadolibre_enabled", e.target.checked ? "true" : "false");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className={`ml-2 text-[10px] font-bold ${mercadolibreEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                        {mercadolibreEnabled ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="https://www.mercadolibre.com.ar/perfil/TU_USUARIO"
                    value={mercadolibreUrl}
                    onChange={(e) => {
                      setMercadolibreUrl(e.target.value);
                      localStorage.setItem("azurita_mercadolibre_url", e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700"
                  />
                  <div className="text-[10px] font-semibold">
                    {mercadolibreEnabled && mercadolibreUrl.trim() ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Visible en la web</span>
                    ) : mercadolibreEnabled ? (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} /> Ingrese una URL</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><X size={11} /> Oculto en la web</span>
                    )}
                  </div>
                </div>

                {/* 7. YouTube */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-red-200 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-xl">
                        <Youtube size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">YouTube</h4>
                        <p className="text-[10px] text-slate-400">Canal de videos</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={youtubeEnabled}
                        onChange={(e) => {
                          setYoutubeEnabled(e.target.checked);
                          localStorage.setItem("azurita_youtube_enabled", e.target.checked ? "true" : "false");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className={`ml-2 text-[10px] font-bold ${youtubeEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                        {youtubeEnabled ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="https://youtube.com/@tu_canal"
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      localStorage.setItem("azurita_youtube_url", e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700"
                  />
                  <div className="text-[10px] font-semibold">
                    {youtubeEnabled && youtubeUrl.trim() ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Visible en la web</span>
                    ) : youtubeEnabled ? (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} /> Ingrese una URL</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><X size={11} /> Oculto en la web</span>
                    )}
                  </div>
                </div>

                {/* 8. TikTok */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 text-slate-900 border border-slate-200 rounded-xl font-bold text-xs">
                        🎵
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">TikTok</h4>
                        <p className="text-[10px] text-slate-400">Videos cortos</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tiktokEnabled}
                        onChange={(e) => {
                          setTiktokEnabled(e.target.checked);
                          localStorage.setItem("azurita_tiktok_enabled", e.target.checked ? "true" : "false");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className={`ml-2 text-[10px] font-bold ${tiktokEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                        {tiktokEnabled ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="https://tiktok.com/@tu_usuario"
                    value={tiktokUrl}
                    onChange={(e) => {
                      setTiktokUrl(e.target.value);
                      localStorage.setItem("azurita_tiktok_url", e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] outline-none font-mono text-slate-700"
                  />
                  <div className="text-[10px] font-semibold">
                    {tiktokEnabled && tiktokUrl.trim() ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11} /> Visible en la web</span>
                    ) : tiktokEnabled ? (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} /> Ingrese una URL</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1"><X size={11} /> Oculto en la web</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                💡 <strong>Sincronización Automática:</strong> Los cambios que realices aquí se aplican en tiempo real en la navegación lateral y en el pie de página (Footer) de tu tienda pública. Los canales desactivados se ocultan sin eliminar la información ingresada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Hash size={13} className="text-slate-400" />
                  Multiplicador de Precios
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="5.0"
                  step="0.01"
                  value={priceMultiplier}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPriceMultiplier(isNaN(val) ? 1.0 : val);
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all font-mono font-black text-slate-800"
                />
              </div>
              <div className="md:col-span-2 text-xs text-slate-500 bg-slate-50 border border-slate-150 p-3.5 rounded-xl self-end">
                {priceMultiplier === 1.0 ? (
                  <span>Precios originales del catálogo (factor de conversión 1.0)</span>
                ) : priceMultiplier > 1.0 ? (
                  <span className="text-emerald-600 font-bold">
                    Aumentando un +{Math.round((priceMultiplier - 1.0) * 100)}% todos los precios del catálogo automáticamente.
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold">
                    Rebajando un -{Math.round((1.0 - priceMultiplier) * 100)}% todos los precios del catálogo automáticamente.
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                Saludo o Cierre de Mensaje (WhatsApp)
              </label>
              <textarea
                rows={3}
                value={waMessageTemplate}
                onChange={(e) => setWaMessageTemplate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all leading-relaxed text-slate-800 font-medium"
                placeholder="Por favor, facilítenme los datos para concretar el pago y coordinar el despacho. ¡Muchas gracias!"
              />
              <p className="text-[10px] text-slate-400 mt-1">Este texto concluye la plantilla que se enviará automáticamente en la confirmación de la compra por WhatsApp.</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl transition-all shadow-sm shadow-purple-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                {isStoreSaved ? "¡Guardado!" : "Guardar Cambios de Tienda"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Setup Guide & Initial Data Export */}
      <div className="space-y-6">
        {/* Step-by-Step Instructions */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
            <Github size={15} />
            Guía de Configuración Rápida
          </h3>
          <ol className="space-y-3 text-xs text-slate-600 list-decimal pl-4">
            <li>
              Crea un repositorio en GitHub (público o privado), por ejemplo: <code className="bg-slate-200/60 px-1 rounded font-mono text-[10px]">mi-catalogo</code>.
            </li>
            <li>
              Genera un <strong>Personal Access Token (PAT)</strong> en GitHub en <code className="bg-slate-200/60 px-1 rounded font-mono text-[10px]">Settings &gt; Developer settings &gt; Personal access tokens &gt; Tokens (classic)</code>. Activa el permiso <code className="bg-slate-200/60 px-1 rounded font-mono text-[10px]">repo</code>.
            </li>
            <li>
              Descarga el archivo JSON inicial de este panel y súbelo a tu repositorio como <code className="bg-slate-200/60 px-1 rounded font-mono text-[10px]">catalog.json</code>.
            </li>
            <li>
              Completa los campos a la izquierda y guarda la configuración. El sistema sincronizará cambios de forma bidireccional y en tiempo real.
            </li>
          </ol>
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
            <a 
              href="https://github.com/settings/tokens/new" 
              target="_blank" 
              referrerPolicy="no-referrer" 
              className="text-xs text-slate-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              Crear Token en GitHub
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Initial JSON Exporter */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <FileJson size={15} className="text-slate-500" />
            Catálogo Inicial JSON
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Utiliza este JSON inicial para crear el archivo en tu repositorio de GitHub por primera vez.
          </p>

          <div className="flex flex-col gap-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 max-h-32 overflow-y-auto font-mono text-[10px] text-slate-600 scrollbar-thin">
              <pre>{currentCatalogJson}</pre>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="py-2 px-3 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copied ? "Copiado" : "Copiar JSON"}
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="py-2 px-3 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Download size={13} />
                Descargar .json
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
