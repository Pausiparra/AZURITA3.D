import { useState, useEffect, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Search, SlidersHorizontal, RotateCw, GitCommit, Settings, 
  Layers, AlertCircle, CheckCircle2, Github, Wifi, WifiOff, 
  Database, ArrowUpDown, RefreshCw, X, ShoppingBag, CreditCard,
  Truck, Trash2, User, Mail, Phone, Save, Check, FileText, Minus, ChevronRight,
  Lock, Unlock, Copy, Instagram, Facebook, Youtube, Twitter, Linkedin, Share2, Store, MessageSquare, FileJson, Upload, Calculator
} from "lucide-react";

import { Product, GitHubConfig, SyncState, Order } from "./types";
import { DEFAULT_PRODUCTS } from "./data/defaultCatalog";
import { fetchGitHubFile, commitGitHubFile, checkGitHubFileSHA } from "./utils/github";

import ProductCard from "./components/ProductCard";
import RightDetailPanel from "./components/RightDetailPanel";
import GitHubConfigPanel from "./components/GitHubConfigPanel";
import ProductModal from "./components/ProductModal";
import CommitModal from "./components/CommitModal";
import SalesHistoryModule from "./components/SalesHistoryModule";
import MercadoPagoModal from "./components/MercadoPagoModal";
import CatalogUploadAndWhatsAppModule from "./components/CatalogUploadAndWhatsAppModule";
import QuotesModule from "./components/QuotesModule";
import CartDrawerModal from "./components/CartDrawerModal";

interface CartItem {
  product: Product;
  quantity: number;
}

// Simple helper to adjust color brightness (hex, percent)
const adjustColorBrightness = (hex: string, percent: number): string => {
  let num = parseInt(hex.replace("#", ""), 16);
  if (isNaN(num)) num = 0x8b5cf6; // fallback to original purple
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  R = R < 255 ? (R < 0 ? 0 : R) : 255;
  G = G < 255 ? (G < 0 ? 0 : G) : 255;
  B = B < 255 ? (B < 0 ? 0 : B) : 255;
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  let r = 0, g = 0, b = 0;
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
  } else {
    // fallback
    r = 139; g = 92; b = 246;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"productos" | "presupuestos" | "subir_productos" | "plantilla_whatsapp" | "medios_de_pago" | "forma_de_entrega" | "historial_ventas" | "config" | "productos_adm">("productos");

  // Orders / Sales History State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("azurita_sales_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Fetch orders from server API on mount
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        localStorage.setItem("azurita_sales_history", JSON.stringify(data.orders));
      }
    } catch (err) {
      console.warn("API orders fetch error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    localStorage.setItem("azurita_sales_history", JSON.stringify(orders));
  }, [orders]);

  const handleUpdateOrderStatus = async (id: string, newStatus: "Pagado" | "Pendiente" | "Cancelado") => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: newStatus } : o));
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      showToast(`Estado de orden #${id} actualizado a ${newStatus}`, "success");
    } catch (err) {
      console.warn("Backend update order status error:", err);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      showToast(`Orden #${id} eliminada.`, "success");
    } catch (err) {
      console.warn("Backend delete order error:", err);
    }
  };

  // Customizable Store, Pricing & Security states
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem("azurita_admin_pin") || "1234");
  const [storeName, setStoreName] = useState(() => localStorage.getItem("azurita_store_name") || "Azurita 3D");
  const [storeSlogan, setStoreSlogan] = useState(() => localStorage.getItem("azurita_store_slogan") || "Estilo & Solución");
  const [priceMultiplier, setPriceMultiplier] = useState<number>(() => {
    const saved = localStorage.getItem("azurita_price_multiplier");
    return saved ? parseFloat(saved) : 1.0;
  });
  const [waMessageTemplate, setWaMessageTemplate] = useState(() => {
    return localStorage.getItem("azurita_wa_message_template") || "Por favor, facilitenme los datos para concretar el pago y coordinar el despacho. ¡Muchas gracias!";
  });
  const [isClientView, setIsClientView] = useState(() => localStorage.getItem("azurita_is_client_view") === "true");
  const [hideClientModeButton, setHideClientModeButton] = useState<boolean>(() => {
    return localStorage.getItem("azurita_hide_client_mode_button") === "true";
  });
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(() => {
    return localStorage.getItem("azurita_custom_base_url") || "";
  });

  // Dynamic Theme & Logo states
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem("azurita_primary_color") || "#8B5CF6");
  const [themeBgColor, setThemeBgColor] = useState(() => localStorage.getItem("azurita_theme_bg_color") || "#F6F4F9");
  const [buttonStyle, setButtonStyle] = useState(() => localStorage.getItem("azurita_button_style") || "rounded-xl");
  const [fontStyle, setFontStyle] = useState(() => localStorage.getItem("azurita_font_style") || "Inter");

  // Social Media & Contact Channel states with Toggles
  const [instagramUrl, setInstagramUrl] = useState(() => localStorage.getItem("azurita_instagram_url") || "https://instagram.com/");
  const [instagramEnabled, setInstagramEnabled] = useState(() => localStorage.getItem("azurita_instagram_enabled") !== "false");

  const [facebookUrl, setFacebookUrl] = useState(() => localStorage.getItem("azurita_facebook_url") || "https://facebook.com/");
  const [facebookEnabled, setFacebookEnabled] = useState(() => localStorage.getItem("azurita_facebook_enabled") !== "false");

  const [twitterUrl, setTwitterUrl] = useState(() => localStorage.getItem("azurita_twitter_url") || "");
  const [twitterEnabled, setTwitterEnabled] = useState(() => localStorage.getItem("azurita_twitter_enabled") === "true");

  const [linkedinUrl, setLinkedinUrl] = useState(() => localStorage.getItem("azurita_linkedin_url") || "");
  const [linkedinEnabled, setLinkedinEnabled] = useState(() => localStorage.getItem("azurita_linkedin_enabled") === "true");

  const [emailContact, setEmailContact] = useState(() => localStorage.getItem("azurita_email_contact") || "");
  const [emailEnabled, setEmailEnabled] = useState(() => localStorage.getItem("azurita_email_enabled") === "true");

  const [mercadolibreUrl, setMercadolibreUrl] = useState(() => localStorage.getItem("azurita_mercadolibre_url") || "");
  const [mercadolibreEnabled, setMercadolibreEnabled] = useState(() => localStorage.getItem("azurita_mercadolibre_enabled") === "true");

  const [youtubeUrl, setYoutubeUrl] = useState(() => localStorage.getItem("azurita_youtube_url") || "https://youtube.com/");
  const [youtubeEnabled, setYoutubeEnabled] = useState(() => localStorage.getItem("azurita_youtube_enabled") === "true");

  const [tiktokUrl, setTiktokUrl] = useState(() => localStorage.getItem("azurita_tiktok_url") || "https://tiktok.com/");
  const [tiktokEnabled, setTiktokEnabled] = useState(() => localStorage.getItem("azurita_tiktok_enabled") === "true");

  const [storeLogoUrl, setStoreLogoUrl] = useState(() => localStorage.getItem("azurita_store_logo_url") || "");
  const [storeEmoji, setStoreEmoji] = useState(() => localStorage.getItem("azurita_store_emoji") || "🔮");
  const [showNameWithLogo, setShowNameWithLogo] = useState(() => {
    const saved = localStorage.getItem("azurita_show_name_with_logo");
    return saved ? saved === "true" : true;
  });

  // Admin Mode & Security states
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem("azurita_is_admin") === "true";
  });
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Price Multiplier Helper
  const getAdjustedPrice = (price: number) => {
    return Math.round(price * priceMultiplier);
  };

  // Dynamic Theme Computed Values
  const primaryColorHover = useMemo(() => adjustColorBrightness(primaryColor, -12), [primaryColor]);
  const primaryColorLogoBg = useMemo(() => adjustColorBrightness(primaryColor, 5), [primaryColor]);
  const primaryColorLight = useMemo(() => hexToRgba(primaryColor, 0.08), [primaryColor]);
  const primaryColorBorder = useMemo(() => hexToRgba(primaryColor, 0.15), [primaryColor]);
  const primaryColorRing = useMemo(() => hexToRgba(primaryColor, 0.25), [primaryColor]);
  const textShadow1 = useMemo(() => adjustColorBrightness(primaryColor, -25), [primaryColor]);
  const textShadow2 = useMemo(() => adjustColorBrightness(primaryColor, -35), [primaryColor]);

  const isDarkBg = useMemo(() => {
    const hex = themeBgColor.replace("#", "");
    if (hex.length !== 6 && hex.length !== 3) return false;
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }, [themeBgColor]);

  // --- SAVE CUSTOM MERCHANT STATES IN LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("azurita_admin_pin", adminPin);
  }, [adminPin]);

  useEffect(() => {
    localStorage.setItem("azurita_store_name", storeName);
  }, [storeName]);

  useEffect(() => {
    localStorage.setItem("azurita_store_slogan", storeSlogan);
  }, [storeSlogan]);

  useEffect(() => {
    localStorage.setItem("azurita_price_multiplier", priceMultiplier.toString());
  }, [priceMultiplier]);

  useEffect(() => {
    localStorage.setItem("azurita_wa_message_template", waMessageTemplate);
  }, [waMessageTemplate]);

  useEffect(() => {
    localStorage.setItem("azurita_is_client_view", isClientView ? "true" : "false");
  }, [isClientView]);

  useEffect(() => {
    localStorage.setItem("azurita_hide_client_mode_button", hideClientModeButton ? "true" : "false");
  }, [hideClientModeButton]);

  useEffect(() => {
    localStorage.setItem("azurita_primary_color", primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem("azurita_store_logo_url", storeLogoUrl);
  }, [storeLogoUrl]);

  useEffect(() => {
    localStorage.setItem("azurita_store_emoji", storeEmoji);
  }, [storeEmoji]);

  useEffect(() => {
    localStorage.setItem("azurita_show_name_with_logo", showNameWithLogo ? "true" : "false");
  }, [showNameWithLogo]);

  useEffect(() => {
    localStorage.setItem("azurita_theme_bg_color", themeBgColor);
  }, [themeBgColor]);

  useEffect(() => {
    localStorage.setItem("azurita_button_style", buttonStyle);
  }, [buttonStyle]);

  useEffect(() => {
    localStorage.setItem("azurita_font_style", fontStyle);
  }, [fontStyle]);

  useEffect(() => {
    localStorage.setItem("azurita_custom_base_url", customBaseUrl);
  }, [customBaseUrl]);

  // --- MERCADO PAGO RETURN URL CHECK (/pago-exitoso or ?status=approved) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderId = params.get("order_id");

    if (status === "approved" || window.location.pathname === "/pago-exitoso") {
      setCart([]);
      showToast(`¡Pago de Mercado Pago confirmado! Orden #${orderId || "AZ-COMPRA"}.`, "success");
      
      // Clean query parameters from address bar cleanly
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname.replace("/pago-exitoso", "/"));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("azurita_instagram_url", instagramUrl);
  }, [instagramUrl]);

  useEffect(() => {
    localStorage.setItem("azurita_facebook_url", facebookUrl);
  }, [facebookUrl]);

  useEffect(() => {
    localStorage.setItem("azurita_youtube_url", youtubeUrl);
  }, [youtubeUrl]);

  useEffect(() => {
    localStorage.setItem("azurita_tiktok_url", tiktokUrl);
  }, [tiktokUrl]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
    showToast(`¡${label} copiado con éxito!`, "success");
  };

  const handleVerifyPassword = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (adminPasswordInput === adminPin) {
      setIsAdminMode(true);
      setIsClientView(false);
      localStorage.setItem("azurita_is_admin", "true");
      localStorage.setItem("azurita_is_client_view", "false");
      setShowAdminPasswordModal(false);
      setAdminPasswordInput("");
      setAdminPasswordError("");
      showToast("Modo Administrador activado.", "success");
    } else {
      setAdminPasswordError(`Código PIN incorrecto (PIN por defecto: ${adminPin === "1234" ? "1234" : "****"}).`);
    }
  };

  const handleDeactivateAdmin = () => {
    setIsAdminMode(false);
    setIsClientView(false);
    localStorage.setItem("azurita_is_admin", "false");
    localStorage.setItem("azurita_is_client_view", "false");
    const adminOnlyTabs = ["config", "presupuestos", "subir_productos", "plantilla_whatsapp", "historial_ventas"];
    if (adminOnlyTabs.includes(activeTab)) {
      setActiveTab("productos");
    }
    showToast("Sesión de administrador cerrada.", "success");
  };

  useEffect(() => {
    if (!isAdminMode) {
      const adminOnlyTabs = ["config", "presupuestos", "subir_productos", "plantilla_whatsapp", "historial_ventas"];
      if (adminOnlyTabs.includes(activeTab)) {
        setActiveTab("productos");
      }
    }
  }, [isAdminMode, activeTab]);
  
  // GitHub Credentials
  const [config, setConfig] = useState<GitHubConfig>(() => {
    const saved = localStorage.getItem("github_catalog_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            token: parsed.token || localStorage.getItem("azurita_github_token") || "",
            owner: parsed.owner || localStorage.getItem("azurita_github_owner") || "",
            repo: parsed.repo || localStorage.getItem("azurita_github_repo") || "",
            branch: parsed.branch || localStorage.getItem("azurita_github_branch") || "main",
            filePath: parsed.filePath || localStorage.getItem("azurita_github_filepath") || "catalog.json"
          };
        }
      } catch (e) { console.warn("Failed to parse github_catalog_config", e); }
    }
    return {
      token: localStorage.getItem("azurita_github_token") || "",
      owner: localStorage.getItem("azurita_github_owner") || "",
      repo: localStorage.getItem("azurita_github_repo") || "",
      branch: localStorage.getItem("azurita_github_branch") || "main",
      filePath: localStorage.getItem("azurita_github_filepath") || "catalog.json"
    };
  });

  // Catalog State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("local_catalog_products");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn("Failed to parse local_catalog_products", e); }
    }
    return DEFAULT_PRODUCTS;
  });

  // Source of Truth States
  const [originalProducts, setOriginalProducts] = useState<Product[] | null>(() => {
    const saved = localStorage.getItem("original_catalog_products");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn("Failed to parse original_catalog_products", e); }
    }
    return DEFAULT_PRODUCTS;
  });
  
  const [remoteSha, setRemoteSha] = useState<string | null>(() => {
    return localStorage.getItem("github_catalog_sha");
  });

  const [syncState, setSyncState] = useState<SyncState>(() => {
    const hasConfig = config.token && config.owner && config.repo;
    return hasConfig ? "synced" : "disconnected";
  });

  // Shopping Cart & Customer Details States
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("azurita_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => item && item.product && typeof item.product.id === "string" && typeof item.product.price === "number");
        }
      } catch (e) { console.warn("Failed to parse azurita_cart", e); }
    }
    return [];
  });

  const [customerName, setCustomerName] = useState(() => localStorage.getItem("azurita_cust_name") || "");
  const [customerMail, setCustomerMail] = useState(() => localStorage.getItem("azurita_cust_mail") || "");
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem("azurita_cust_phone") || "");

  // Checkout Selections
  const [deliveryMethod, setDeliveryMethod] = useState<"retiro" | "moto" | "gba" | "correo">("retiro");
  const [paymentMethod, setPaymentMethod] = useState<"transferencia" | "mercado_pago" | "efectivo">("transferencia");

  // Merchant settings
  const [sellerWhatsApp, setSellerWhatsApp] = useState(() => localStorage.getItem("azurita_seller_wa") || "5491123456789");

  // Custom Delivery Details (Declared before cost calculation helpers)
  const [deliveryInfo, setDeliveryInfo] = useState(() => {
    const saved = localStorage.getItem("azurita_delivery_info");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn("Failed to parse azurita_delivery_info", e); }
    }
    return {
      tallerDireccion: "Av. Cabildo 2300, Belgrano, CABA",
      tallerHorarios: "Lunes a Sábados de 11:00 a 19:00 hs.",
      envioCaba: "$2.500",
      envioGba: "$4.500",
      envioInterior: "Envíos a todo el país vía Correo Argentino (Tarifa a cotizar)"
    };
  });

  // Helper to safely parse numeric value from cost string (e.g., "$2.500" -> 2500)
  const parseCost = (costStr: string, defaultVal: number): number => {
    if (!costStr) return defaultVal;
    const clean = costStr.replace(/[^\d]/g, "");
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? defaultVal : parsed;
  };

  // Helper to get shipping cost considering if shipping costs are deactivated
  const getShippingCostValue = (method: string): number => {
    if (deliveryInfo?.disableShippingCosts) return 0;
    if (method === "moto") return parseCost(deliveryInfo?.envioCaba, 2500);
    if (method === "gba") return parseCost(deliveryInfo?.envioGba, 4500);
    return 0;
  };

  // Custom Payment Details
  const [paymentInfo, setPaymentInfo] = useState(() => {
    const saved = localStorage.getItem("azurita_payment_info");
    let parsed: any = {};
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) { console.warn("Failed to parse azurita_payment_info", e); }
    }
    return {
      banco: parsed.banco ?? "Banco Galicia",
      titular: parsed.titular ?? "Azurita 3D",
      cbu: parsed.cbu ?? "0070012345678901234567",
      alias: parsed.alias ?? "azurita.3d.mp",
      cuit: parsed.cuit ?? "30-71234567-9",
      mercadoPago: parsed.mercadoPago ?? "azurita3d.mp",
      descuentoEfectivo: parsed.descuentoEfectivo ?? "10% de descuento abonando en efectivo al retirar.",
      // New fields for toggling payment options & setting promos
      disableTransferencia: parsed.disableTransferencia ?? false,
      promoTransferencia: parsed.promoTransferencia ?? "",
      disableMercadoPago: parsed.disableMercadoPago !== undefined ? parsed.disableMercadoPago : false, // ACTIVATED BY DEFAULT
      promoMercadoPago: parsed.promoMercadoPago ?? "",
      disableEfectivo: parsed.disableEfectivo ?? false,
      promoEfectivo: parsed.promoEfectivo ?? "10% de descuento abonando en efectivo al retirar.",
      descuentoEfectivoPct: typeof parsed.descuentoEfectivoPct === "number" ? parsed.descuentoEfectivoPct : 10,
      descuentoTransferenciaPct: typeof parsed.descuentoTransferenciaPct === "number" ? parsed.descuentoTransferenciaPct : 0,
      descuentoMercadoPagoPct: typeof parsed.descuentoMercadoPagoPct === "number" ? parsed.descuentoMercadoPagoPct : 0
    };
  });

  const getPaymentDiscountPct = (method: string): number => {
    if (method === "efectivo") return typeof paymentInfo?.descuentoEfectivoPct === "number" ? paymentInfo.descuentoEfectivoPct : 10;
    if (method === "transferencia") return typeof paymentInfo?.descuentoTransferenciaPct === "number" ? paymentInfo.descuentoTransferenciaPct : 0;
    if (method === "mercado_pago") return typeof paymentInfo?.descuentoMercadoPagoPct === "number" ? paymentInfo.descuentoMercadoPagoPct : 0;
    return 0;
  };

  const getPaymentDiscountValue = (method: string): number => {
    const pct = getPaymentDiscountPct(method);
    return Math.round(cartTotal * (pct / 100));
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "stock-asc" | "name-asc">("default");

  // UI Control
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [showConfigSaved, setShowConfigSaved] = useState(false);
  
  // Feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- LOCAL PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("github_catalog_config", JSON.stringify(config));
    if (config.token) localStorage.setItem("azurita_github_token", config.token);
    if (config.owner) localStorage.setItem("azurita_github_owner", config.owner);
    if (config.repo) localStorage.setItem("azurita_github_repo", config.repo);
    if (config.branch) localStorage.setItem("azurita_github_branch", config.branch);
    if (config.filePath) localStorage.setItem("azurita_github_filepath", config.filePath);
  }, [config]);

  useEffect(() => {
    localStorage.setItem("local_catalog_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (originalProducts) {
      localStorage.setItem("original_catalog_products", JSON.stringify(originalProducts));
    } else {
      localStorage.removeItem("original_catalog_products");
    }
  }, [originalProducts]);

  useEffect(() => {
    if (remoteSha) {
      localStorage.setItem("github_catalog_sha", remoteSha);
    } else {
      localStorage.removeItem("github_catalog_sha");
    }
  }, [remoteSha]);

  useEffect(() => {
    localStorage.setItem("azurita_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("azurita_cust_name", customerName);
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem("azurita_cust_mail", customerMail);
  }, [customerMail]);

  useEffect(() => {
    localStorage.setItem("azurita_cust_phone", customerPhone);
  }, [customerPhone]);

  useEffect(() => {
    localStorage.setItem("azurita_seller_wa", sellerWhatsApp);
  }, [sellerWhatsApp]);

  useEffect(() => {
    localStorage.setItem("azurita_payment_info", JSON.stringify(paymentInfo));
  }, [paymentInfo]);

  useEffect(() => {
    localStorage.setItem("azurita_delivery_info", JSON.stringify(deliveryInfo));
  }, [deliveryInfo]);

  // If shipping is disabled, force the selected method to be workshop pickup
  useEffect(() => {
    if (deliveryInfo?.disableShippingCosts) {
      setDeliveryMethod("retiro");
    }
  }, [deliveryInfo?.disableShippingCosts]);

  // If selected payment method is disabled, select the first available active one
  useEffect(() => {
    const available: ("transferencia" | "mercado_pago" | "efectivo")[] = [];
    if (!paymentInfo?.disableTransferencia) available.push("transferencia");
    if (!paymentInfo?.disableMercadoPago) available.push("mercado_pago");
    if (!paymentInfo?.disableEfectivo) available.push("efectivo");

    if (available.length > 0 && !available.includes(paymentMethod)) {
      setPaymentMethod(available[0]);
    }
  }, [paymentInfo?.disableTransferencia, paymentInfo?.disableMercadoPago, paymentInfo?.disableEfectivo, paymentMethod]);

  // Is GitHub Connection configured?
  const isConfigured = useMemo(() => {
    return !!(config.token && config.owner && config.repo && config.filePath);
  }, [config]);

  // --- SHOW TOAST HELPER ---
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- DETECT QUERY PARAMETERS ON MOUNT ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      setIsAdminMode(true);
      setIsClientView(false);
      localStorage.setItem("azurita_is_admin", "true");
      localStorage.setItem("azurita_is_client_view", "false");
      showToast("¡Modo Administrador activado mediante enlace!", "success");
      // Clean query parameters quietly to keep the address bar professional
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    } else if (params.get("client") === "true") {
      setIsAdminMode(false);
      setIsClientView(true);
      localStorage.setItem("azurita_is_admin", "false");
      localStorage.setItem("azurita_is_client_view", "true");
      showToast("Modo Cliente activado (Catálogo de solo lectura)", "success");
      // Clean query parameters quietly to keep the address bar professional
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // --- CART OPERATIONS ---
  const handleAddToCart = (product: Product) => {
    if (!product || product.stock <= 0) {
      showToast("Este producto se encuentra sin stock temporalmente.", "error");
      return;
    }

    let addedOk = false;
    let limitReached = false;

    setCart((prevCart) => {
      const validCart = prevCart.filter((item) => item && item.product && item.product.id);
      const existing = validCart.find((item) => item.product.id === product.id);

      if (existing) {
        if (existing.quantity >= product.stock) {
          limitReached = true;
          return validCart;
        }
        addedOk = true;
        return validCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      addedOk = true;
      return [...validCart, { product, quantity: 1 }];
    });

    if (limitReached) {
      showToast(`Límite de stock alcanzado (${product.stock} unidades disponibles)`, "error");
    } else if (addedOk) {
      showToast(`"${product.name}" agregado al carrito.`);
      setIsCartOpen(true);
    }
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    let limitReached = false;
    let stockLimit = 0;

    setCart((prevCart) => {
      const validCart = prevCart.filter((item) => item && item.product && item.product.id);
      return validCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) {
              limitReached = true;
              stockLimit = item.product.stock;
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });

    if (limitReached) {
      showToast(`Límite de stock alcanzado (${stockLimit} disp.)`, "error");
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item && item.product && item.product.id !== productId));
    showToast("Eliminado del carrito.");
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      if (!item || !item.product || typeof item.product.price !== "number") return acc;
      return acc + getAdjustedPrice(item.product.price) * item.quantity;
    }, 0);
  }, [cart, priceMultiplier]);

  // --- ORDER CHECKOUT (ONLINE GATEWAY OR DIRECT WHATSAPP) ---
  const handleConfirmPurchase = () => {
    if (cart.length === 0) {
      showToast("Tu carrito de compras está vacío. Agrega productos primero.", "error");
      return;
    }

    if (!customerName.trim() || !customerMail.trim() || !customerPhone.trim()) {
      showToast("Por favor, completa tus datos de contacto (Nombre, Mail y Teléfono) en el carrito.", "error");
      return;
    }

    // Check if online payment gateway (Mercado Pago) is active and selected
    if (paymentMethod === "mercado_pago" && !paymentInfo?.disableMercadoPago) {
      setIsMercadoPagoModalOpen(true);
      return;
    }

    // Direct WhatsApp Checkout Flow (Used when Gateway is deactivated or Transferencia/Efectivo chosen)
    const totalAmount = cartTotal - getPaymentDiscountValue(paymentMethod) + getShippingCostValue(deliveryMethod);
    const newOrder: Order = {
      id: `AZ-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerEmail: customerMail.trim(),
      customerPhone: customerPhone.trim(),
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: getAdjustedPrice(i.product.price)
      })),
      paymentMethod: paymentMethod === "mercado_pago" ? "mercado_pago" : paymentMethod === "transferencia" ? "transferencia" : "efectivo",
      deliveryMethod,
      subtotal: cartTotal,
      discountAmount: getPaymentDiscountValue(paymentMethod),
      shippingCost: getShippingCostValue(deliveryMethod),
      total: totalAmount,
      paymentStatus: "Pendiente"
    };

    // Save order in history
    setOrders((prev) => [newOrder, ...prev]);

    // Post order to server
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder)
    }).catch((err) => console.warn("Error saving order to backend:", err));

    // Build formatted WhatsApp message
    const itemsText = cart.map(i => `• ${i.product.name} x${i.quantity} ($${(getAdjustedPrice(i.product.price) * i.quantity).toLocaleString("es-AR")})`).join("\n");
    const methodLabel = paymentMethod === "transferencia" ? "Transferencia Bancaria" : paymentMethod === "efectivo" ? "Efectivo al Retirar" : "Mercado Pago (Directo)";
    const deliveryLabel = deliveryMethod === "retiro" ? "Retiro por Taller (Gratis)" : deliveryMethod === "moto" ? "Envío Moto CABA" : deliveryMethod === "gba" ? "Envío Moto GBA" : "Envío Correo Argentino";

    const waMsg = `*¡NUEVO PEDIDO #${newOrder.id} - ${storeName}!*\n\n` +
      `👤 *Cliente:* ${customerName}\n` +
      `📧 *Mail:* ${customerMail}\n` +
      `📱 *Teléfono:* ${customerPhone}\n\n` +
      `🛍️ *Detalle del Pedido:*\n${itemsText}\n\n` +
      `💳 *Método de Pago:* ${methodLabel}\n` +
      `🚚 *Método de Entrega:* ${deliveryLabel}\n` +
      `💰 *TOTAL A ABONAR:* $${totalAmount.toLocaleString("es-AR")}\n\n` +
      `Hola! Quisiera confirmar este pedido y coordinar los detalles.`;

    const cleanPhone = sellerWhatsApp.replace(/\D/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;

    setCart([]);
    showToast("¡Pedido registrado con éxito! Abriendo WhatsApp...", "success");
    window.open(waUrl, "_blank");
  };


  // --- SYNC WORKFLOWS ---
  const handlePullFromGitHub = async (silent = false) => {
    if (!isConfigured) {
      if (!silent) showToast("Configura tus credenciales de GitHub primero.", "error");
      return;
    }

    if (!silent) setIsSyncing(true);
    setErrorBanner(null);

    try {
      const { products: fetchedProducts, sha } = await fetchGitHubFile(config);
      setProducts(fetchedProducts);
      setOriginalProducts(fetchedProducts);
      setRemoteSha(sha);
      setSyncState("synced");
      if (!silent) showToast("¡Catálogo sincronizado desde GitHub correctamente!");
    } catch (err: any) {
      console.error(err);
      if (!silent) {
        setErrorBanner(err.message || "Error al sincronizar con GitHub.");
        setSyncState("error");
        showToast("Error de sincronización", "error");
      }
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConfig(true);
    setErrorBanner(null);
    try {
      const sha = await checkGitHubFileSHA(config);
      if (sha === "not_found") {
        showToast("Conectado con éxito. El archivo aún no existe en GitHub. Puedes crearlo con el botón 'Crear / Inicializar JSON'.", "success");
        setRemoteSha(null);
        setOriginalProducts([]);
        setSyncState("pending_changes");
      } else if (sha) {
        const { products: fetched, sha: newSha } = await fetchGitHubFile(config);
        if (fetched.length === 0) {
          showToast("Conectado. El archivo en GitHub está vacío. Haz clic en 'Crear / Inicializar JSON' para guardar el catálogo.", "success");
          setRemoteSha(newSha);
          setOriginalProducts([]);
          setSyncState("pending_changes");
        } else {
          showToast("¡Conexión exitosa! Catálogo cargado desde GitHub.", "success");
          setProducts(fetched);
          setOriginalProducts(fetched);
          setRemoteSha(newSha);
          setSyncState("synced");
        }
      } else {
        throw new Error("No se pudo leer los metadatos del repositorio.");
      }
    } catch (err: any) {
      setErrorBanner(err.message || "No se pudo conectar a GitHub.");
      showToast("Error al conectar", "error");
      setSyncState("error");
    } finally {
      setIsTestingConfig(false);
    }
  };

  const handleInitializeGitHubFile = async () => {
    if (!isConfigured) {
      showToast("Configura tus credenciales de GitHub primero.", "error");
      return;
    }

    setIsSyncing(true);
    setErrorBanner(null);

    try {
      const currentSha = await checkGitHubFileSHA(config);
      const targetSha = (currentSha && currentSha !== "not_found") ? currentSha : remoteSha;
      const catalogToSave = products.length > 0 ? products : DEFAULT_PRODUCTS;

      const result = await commitGitHubFile(
        config,
        catalogToSave,
        targetSha,
        "Inicializar archivo JSON de catálogo"
      );

      setProducts(catalogToSave);
      setOriginalProducts(catalogToSave);
      setRemoteSha(result.sha);
      setSyncState("synced");
      showToast("¡Archivo JSON creado e inicializado con éxito en GitHub!", "success");
    } catch (err: any) {
      console.error(err);
      setErrorBanner(err.message || "No se pudo inicializar el archivo JSON en GitHub.");
      showToast("Error al inicializar archivo en GitHub", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = (newConfig: GitHubConfig) => {
    setConfig(newConfig);
    localStorage.setItem("github_catalog_config", JSON.stringify(newConfig));
    if (newConfig.token) localStorage.setItem("azurita_github_token", newConfig.token);
    if (newConfig.owner) localStorage.setItem("azurita_github_owner", newConfig.owner);
    if (newConfig.repo) localStorage.setItem("azurita_github_repo", newConfig.repo);
    if (newConfig.branch) localStorage.setItem("azurita_github_branch", newConfig.branch);
    if (newConfig.filePath) localStorage.setItem("azurita_github_filepath", newConfig.filePath);
    setErrorBanner(null);
  };

  const handleCommitToGitHub = async (commitMessage: string) => {
    if (!isConfigured) {
      showToast("Configura tus credenciales de GitHub.", "error");
      return;
    }

    try {
      const result = await commitGitHubFile(config, products, remoteSha, commitMessage);
      setRemoteSha(result.sha);
      setOriginalProducts(products);
      setSyncState("synced");
      setIsCommitModalOpen(false);
      showToast("¡Cambios guardados en tu repositorio de GitHub!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Error al realizar el commit.", "error");
    }
  };

  const handleResetCatalog = () => {
    if (confirm("¿Estás seguro de que deseas descartar todos los cambios locales pendientes?")) {
      if (originalProducts) {
        setProducts(originalProducts);
        showToast("Cambios locales descartados.");
      } else {
        setProducts(DEFAULT_PRODUCTS);
        showToast("Catálogo restablecido al demo inicial.");
      }
    }
  };

  // --- REAL-TIME POLLING ENGINE ---
  useEffect(() => {
    if (!isConfigured || !autoSync || syncState === "loading") return;

    const interval = setInterval(async () => {
      try {
        const latestSha = await checkGitHubFileSHA(config);
        if (latestSha && latestSha !== remoteSha && latestSha !== "not_found") {
          setSyncState("out_of_sync");
        }
      } catch (error) {
        console.error("Error en polling de SHA:", error);
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [config, remoteSha, autoSync, isConfigured, syncState]);

  // --- CALCULATE CHANGES FOR COMMIT ---
  const changeStats = useMemo(() => {
    const stats = { added: 0, modified: 0, deleted: 0, total: products.length };
    if (!originalProducts) return stats;

    const originalMap = new Map<string, Product>(originalProducts.map(p => [p.id, p]));
    const currentMap = new Map<string, Product>(products.map(p => [p.id, p]));

    for (const [id, prod] of currentMap.entries()) {
      if (!originalMap.has(id)) {
        stats.added++;
      } else {
        const orig = originalMap.get(id)!;
        const isModified = 
          orig.name !== prod.name ||
          orig.category !== prod.category ||
          orig.price !== prod.price ||
          orig.stock !== prod.stock ||
          orig.description !== prod.description ||
          orig.imageUrl !== prod.imageUrl ||
          JSON.stringify(orig.tags) !== JSON.stringify(prod.tags);
        
        if (isModified) {
          stats.modified++;
        }
      }
    }

    for (const id of originalMap.keys()) {
      if (!currentMap.has(id)) {
        stats.deleted++;
      }
    }

    return stats;
  }, [products, originalProducts]);

  useEffect(() => {
    if (!isConfigured) {
      setSyncState("disconnected");
      return;
    }

    if (syncState === "loading" || syncState === "error" || syncState === "out_of_sync") return;

    const hasChanges = changeStats.added > 0 || changeStats.modified > 0 || changeStats.deleted > 0;
    
    if (hasChanges) {
      setSyncState("pending_changes");
    } else {
      setSyncState("synced");
    }
  }, [changeStats, isConfigured, originalProducts]);

  // --- CATALOG CRUD OPERATIONS ---
  const handleSaveProduct = (updatedProduct: Product) => {
    if (isAddingNew) {
      setProducts((prev) => [updatedProduct, ...prev]);
      setIsAddingNew(false);
      showToast(`Producto "${updatedProduct.name}" creado con éxito.`);
    } else {
      setProducts((prev) => prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
      setSelectedProduct(updatedProduct);
      setIsEditingProduct(false);
      showToast(`Producto "${updatedProduct.name}" actualizado.`);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setSelectedProduct(null);
    setIsDetailModalOpen(false);
    showToast("Producto eliminado del catálogo local.");
  };

  const handleAddProductFromModule = (newProd: Omit<Product, "id">) => {
    const fullProd: Product = {
      ...newProd,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setProducts((prev) => [fullProd, ...prev]);
  };

  const handleBulkAddProductsFromModule = (newProducts: Omit<Product, "id">[]) => {
    const formatted: Product[] = newProducts.map((p, idx) => ({
      ...p,
      id: `prod-bulk-${Date.now()}-${idx}`
    }));
    setProducts((prev) => [...formatted, ...prev]);
  };

  const handleEncargarWhatsApp = (product: Product) => {
    const adjustedPrice = Math.round(product.price * priceMultiplier);
    const formattedPrice = `$${adjustedPrice.toLocaleString("es-AR")}`;

    let template = waMessageTemplate || "Hola! Me interesa encargar/consultar por el producto o servicio: *{PRODUCTO}* (Precio: {PRECIO}).\n\n¿Podrían brindarme más información?";
    let message = template.replace("{PRODUCTO}", product.name).replace("{PRECIO}", formattedPrice);

    const cleanPhone = sellerWhatsApp.replace(/\D/g, "");
    const targetPhone = cleanPhone || "5491123456789";
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  // --- FILTER & SORT LOGIC ---
  const uniqueCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["Todas", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        
        const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "stock-asc") return a.stock - b.stock;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, sortBy]);

  const getSyncStateBadge = () => {
    switch (syncState) {
      case "synced":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sincronizado con GitHub
          </div>
        );
      case "pending_changes":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Cambios Locales Pendientes
          </div>
        );
      case "out_of_sync":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Nueva versión en GitHub
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
            <AlertCircle size={10} />
            Error de Sincronización
          </div>
        );
      case "loading":
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <RotateCw size={9} className="animate-spin" />
            Conectando...
          </div>
        );
      case "disconnected":
      default:
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <WifiOff size={10} />
            Modo Demo Local
          </div>
        );
    }
  };

  return (
    <div 
      style={{ backgroundColor: "var(--bg-color)" }}
      className="flex flex-col lg:flex-row min-h-screen text-slate-900 store-font-applied selection:bg-[var(--primary-color)]/15"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700;900&display=swap');

        :root {
          --primary-color: ${primaryColor};
          --primary-hover: ${primaryColorHover};
          --primary-logo-bg: ${primaryColorLogoBg};
          --primary-light: ${primaryColorLight};
          --primary-border: ${primaryColorBorder};
          --primary-ring: ${primaryColorRing};
          --text-shadow-1: ${textShadow1};
          --text-shadow-2: ${textShadow2};
          --button-radius: ${buttonStyle === "rounded-full" ? "9999px" :
                             buttonStyle === "rounded-none" ? "0px" :
                             buttonStyle === "rounded-lg" ? "8px" :
                             "12px"};
          --store-font: ${fontStyle === "Space Grotesk" ? "'Space Grotesk', sans-serif" :
                          fontStyle === "Playfair Display" ? "'Playfair Display', serif" :
                          fontStyle === "JetBrains Mono" ? "'JetBrains Mono', monospace" :
                          "'Inter', sans-serif"};
          --bg-color: ${themeBgColor};
          --text-color: ${isDarkBg ? "#F8FAFC" : "#0F172A"};
          --text-muted: ${isDarkBg ? "#94A3B8" : "#64748B"};
          --card-bg: ${isDarkBg ? "#111827" : "#FFFFFF"};
          --card-border: ${isDarkBg ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0"};
          --input-bg: ${isDarkBg ? "rgba(255, 255, 255, 0.08)" : "#F8FAFC"};
        }

        html, body, #root {
          background-color: var(--bg-color) !important;
          color: var(--text-color) !important;
          min-height: 100vh;
          width: 100%;
        }

        aside, header, main {
          background-color: transparent !important;
        }

        ${isDarkBg ? `
          .bg-white, .bg-slate-50, .bg-slate-50\/50, .bg-slate-100 {
            background-color: var(--card-bg) !important;
            border-color: var(--card-border) !important;
            color: var(--text-color) !important;
          }
          .text-slate-800, .text-slate-900, .text-slate-700 {
            color: var(--text-color) !important;
          }
          .text-slate-500, .text-slate-400, .text-slate-600 {
            color: var(--text-muted) !important;
          }
          .border-slate-200, .border-slate-100, .border-slate-150 {
            border-color: var(--card-border) !important;
          }
        ` : ''}

        .store-font-applied {
          font-family: var(--store-font) !important;
        }

        /* Override roundness across components automatically */
        .rounded-xl {
          border-radius: var(--button-radius) !important;
        }
        .rounded-2xl {
          border-radius: calc(var(--button-radius) * 1.3) !important;
        }
        .rounded-3xl {
          border-radius: calc(var(--button-radius) * 1.6) !important;
        }
        .rounded-lg {
          border-radius: calc(var(--button-radius) * 0.8) !important;
        }

        /* Dynamic Primary Color overrides for Tailwind classes and utility selectors */
        .bg-\[\#8B5CF6\], .bg-\[\#8b5cf6\], .bg-purple-600, .bg-violet-600 {
          background-color: var(--primary-color) !important;
        }
        .hover\:bg-\[\#7C3AED\]:hover, .hover\:bg-\[\#7c3aed\]:hover, .hover\:bg-purple-700:hover, .hover\:bg-violet-700:hover {
          background-color: var(--primary-hover) !important;
        }
        .text-\[\#8B5CF6\], .text-\[\#8b5cf6\], .text-purple-600, .text-violet-600 {
          color: var(--primary-color) !important;
        }
        .border-\[\#8B5CF6\], .border-\[\#8b5cf6\], .border-purple-600, .border-violet-600 {
          border-color: var(--primary-color) !important;
        }
        .bg-\[\#8B5CF6\]\/10, .bg-\[\#8b5cf6\]\/10, .bg-purple-50, .bg-violet-50, .bg-purple-100/60 {
          background-color: var(--primary-light) !important;
        }
        .bg-\[\#8B5CF6\]\/20, .bg-\[\#8b5cf6\]\/20, .bg-purple-100, .bg-violet-100 {
          background-color: ${hexToRgba(primaryColor, 0.2)} !important;
        }
        .bg-\[\#8B5CF6\]\/5, .bg-\[\#8b5cf6\]\/5 {
          background-color: ${hexToRgba(primaryColor, 0.05)} !important;
        }
        .border-\[\#8B5CF6\]\/15, .border-\[\#8b5cf6\]\/15, .border-purple-200, .border-violet-200 {
          border-color: var(--primary-border) !important;
        }
        .border-\[\#8B5CF6\]\/30, .border-\[\#8b5cf6\]\/30, .border-purple-100, .border-violet-100 {
          border-color: ${hexToRgba(primaryColor, 0.3)} !important;
        }
        .focus\:ring-\[\#8B5CF6\]\/25:focus, .focus\:ring-\[\#8b5cf6\]\/25:focus, .focus\:ring-purple-500\/25:focus, .focus\:ring-violet-500\/25:focus {
          --tw-ring-color: var(--primary-ring) !important;
          box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-ring-color) !important;
        }
        .focus\:border-\[\#8B5CF6\]:focus, .focus\:border-\[\#8b5cf6\]:focus, .focus\:border-purple-500:focus, .focus\:border-violet-500:focus {
          border-color: var(--primary-color) !important;
        }
        .shadow-violet-500\/15, .shadow-purple-500\/15, .shadow-violet-600\/15 {
          box-shadow: 0 4px 6px -1px ${hexToRgba(primaryColor, 0.15)}, 0 2px 4px -2px ${hexToRgba(primaryColor, 0.15)} !important;
        }
        .shadow-violet-500\/10, .shadow-purple-500\/10, .shadow-violet-600\/10 {
          box-shadow: 0 4px 6px -1px ${hexToRgba(primaryColor, 0.10)}, 0 2px 4px -2px ${hexToRgba(primaryColor, 0.10)} !important;
        }
        .shadow-violet-500\/20, .shadow-purple-500\/20, .shadow-violet-600\/20 {
          box-shadow: 0 4px 6px -1px ${hexToRgba(primaryColor, 0.20)}, 0 2px 4px -2px ${hexToRgba(primaryColor, 0.20)} !important;
        }
        .shadow-violet-500\/30, .shadow-purple-500\/30, .shadow-violet-600\/30 {
          box-shadow: 0 4px 6px -1px ${hexToRgba(primaryColor, 0.30)}, 0 2px 4px -2px ${hexToRgba(primaryColor, 0.30)} !important;
        }
        .text-violet-600, .text-purple-600 {
          color: var(--primary-color) !important;
        }
        .bg-violet-600, .bg-purple-600 {
          background-color: var(--primary-color) !important;
        }
        .hover\:bg-violet-700:hover, .hover\:bg-purple-700:hover {
          background-color: var(--primary-hover) !important;
        }
        .border-violet-200, .border-purple-200 {
          border-color: ${hexToRgba(primaryColor, 0.2)} !important;
        }
        .border-violet-300, .border-purple-300 {
          border-color: ${hexToRgba(primaryColor, 0.3)} !important;
        }
        .bg-violet-50, .bg-purple-50 {
          background-color: var(--primary-light) !important;
        }
        .text-violet-800, .text-purple-800 {
          color: ${adjustColorBrightness(primaryColor, -25)} !important;
        }
        .text-violet-700, .text-purple-700 {
          color: ${adjustColorBrightness(primaryColor, -15)} !important;
        }
        .bg-violet-100, .bg-purple-100 {
          background-color: ${hexToRgba(primaryColor, 0.15)} !important;
        }
      `}</style>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4.5 py-3 bg-slate-950 text-white rounded-2xl shadow-xl text-xs font-medium border border-white/10"
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 size={15} className="text-emerald-400" />
            ) : (
              <AlertCircle size={15} className="text-red-400" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Sidebar matching wireframe */}
      <aside className="w-full lg:w-72 bg-white p-6 flex flex-col shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 lg:h-screen lg:sticky lg:top-0 justify-between">
        <div className="space-y-6">
          {/* Logo Card perfectly emulating Image 2 with Dynamic custom logo & color support */}
          <div 
            style={{ backgroundColor: "var(--primary-logo-bg)" }}
            className="p-5 rounded-2xl flex flex-col items-center justify-center border-2 border-white shadow-md text-center transition-all duration-300"
          >
            {storeLogoUrl ? (
              <div className="relative mb-2.5">
                <img 
                  src={storeLogoUrl} 
                  alt="Store Logo" 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover bg-white"
                />
              </div>
            ) : storeEmoji ? (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl mb-2.5 shadow-inner select-none">
                {storeEmoji}
              </div>
            ) : null}

            {(!storeLogoUrl || showNameWithLogo) && (
              <>
                <div 
                  className="font-sans font-black text-white text-[26px] leading-none tracking-tight select-none mb-0.5 max-w-full break-words"
                  style={{
                    textShadow: '1.5px 1.5px 0px var(--text-shadow-1), 3px 3px 0px var(--text-shadow-2), 4px 4px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  {storeName.split(" ")[0]}
                </div>
                {storeName.split(" ").slice(1).join(" ") && (
                  <div 
                    className="font-sans font-black text-white text-[28px] leading-none tracking-tight select-none mb-3 max-w-full break-words"
                    style={{
                      textShadow: '1.5px 1.5px 0px var(--text-shadow-1), 3px 3px 0px var(--text-shadow-2), 4px 4px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    {storeName.split(" ").slice(1).join(" ")}
                  </div>
                )}
              </>
            )}
            <div className="w-full flex flex-col items-center">
              <span className="text-[9px] text-white/95 font-bold tracking-widest uppercase select-none">
                {storeSlogan}
              </span>
              <div className="w-16 h-[1.5px] bg-white mt-1 rounded-full" />
            </div>
          </div>

          {/* Wireframe Navigation Items */}
          <nav className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold block mb-2 px-1">
              Navegación
            </label>
            
            {/* PRODUCTO Tab */}
            <button
              onClick={() => setActiveTab("productos")}
              className={`w-full flex items-center gap-3 text-left text-xs px-4 py-3 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === "productos"
                  ? "bg-[var(--primary-color)] text-white shadow-sm"
                  : "hover:bg-[var(--primary-color)]/5 text-slate-700"
              }`}
            >
              <Layers size={15} />
              <span>PRODUCTO</span>
            </button>

            {/* PRESUPUESTOS Tab (ADMIN) */}
            {isAdminMode && (
              <button
                onClick={() => setActiveTab("presupuestos")}
                className={`w-full flex items-center gap-3 text-left text-xs px-4 py-3 rounded-xl transition-all cursor-pointer font-bold ${
                  activeTab === "presupuestos"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "hover:bg-emerald-50 text-slate-700"
                }`}
              >
                <Calculator size={15} className={activeTab === "presupuestos" ? "text-white" : "text-emerald-600"} />
                <span>PRESUPUESTOS</span>
              </button>
            )}

            {/* SUBIR PRODUCTOS Tab (ADMIN) */}
            {isAdminMode && (
              <button
                onClick={() => setActiveTab("subir_productos")}
                className={`w-full flex items-center gap-3 text-left text-xs px-4 py-3 rounded-xl transition-all cursor-pointer font-bold ${
                  activeTab === "subir_productos"
                    ? "bg-[var(--primary-color)] text-white shadow-sm"
                    : "hover:bg-[var(--primary-color)]/5 text-slate-700"
                }`}
              >
                <Upload size={15} />
                <span>SUBIR PRODUCTOS</span>
              </button>
            )}

            {/* PLANTILLA WHATSAPP Tab (ADMIN) */}
            {isAdminMode && (
              <button
                onClick={() => setActiveTab("plantilla_whatsapp")}
                className={`w-full flex items-center gap-3 text-left text-xs px-4 py-3 rounded-xl transition-all cursor-pointer font-bold ${
                  activeTab === "plantilla_whatsapp"
                    ? "bg-[var(--primary-color)] text-white shadow-sm"
                    : "hover:bg-[var(--primary-color)]/5 text-slate-700"
                }`}
              >
                <MessageSquare size={15} />
                <span>PLANTILLA WHATSAPP</span>
              </button>
            )}

            {/* MEDIOS DE PAGO Tab */}
            <button
              onClick={() => setActiveTab("medios_de_pago")}
              className={`w-full flex items-center gap-3 text-left text-xs px-4 py-3 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === "medios_de_pago"
                  ? "bg-[var(--primary-color)] text-white shadow-sm"
                  : "hover:bg-[var(--primary-color)]/5 text-slate-700"
              }`}
            >
              <CreditCard size={15} />
              <span>MEDIOS DE PAGO</span>
            </button>

            {/* FORMA DE ENTREGA Tab */}
            <button
              onClick={() => setActiveTab("forma_de_entrega")}
              className={`w-full flex items-center gap-3 text-left text-xs px-4 py-3 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === "forma_de_entrega"
                  ? "bg-[var(--primary-color)] text-white shadow-sm"
                  : "hover:bg-[var(--primary-color)]/5 text-slate-700"
              }`}
            >
              <Truck size={15} />
              <span>FORMA DE ENTREGA</span>
            </button>

            {/* HISTORIAL DE VENTAS Tab (ADMIN) */}
            {isAdminMode && (
              <button
                onClick={() => setActiveTab("historial_ventas")}
                className={`w-full flex items-center justify-between text-left text-xs px-4 py-3 rounded-xl transition-all cursor-pointer font-bold ${
                  activeTab === "historial_ventas"
                    ? "bg-[var(--primary-color)] text-white shadow-sm"
                    : "hover:bg-[var(--primary-color)]/5 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={15} />
                  <span>HISTORIAL DE VENTAS</span>
                </div>
                {orders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                    activeTab === "historial_ventas" ? "bg-white/20 text-white" : "bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
                  }`}>
                    {orders.length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Security & Admin toggle */}
        <div className="pt-5 border-t border-slate-100 space-y-3.5">
          <label className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold block px-1">
            Seguridad
          </label>
          
          {isAdminMode ? (
            <div className="space-y-2">
              <div 
                style={{ 
                  backgroundColor: "var(--primary-light)", 
                  borderColor: "var(--primary-border)" 
                }}
                className="border rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Unlock size={14} className="text-[var(--primary-color)] shrink-0" />
                  <span className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-wider">Modo Admin</span>
                </div>
                <button
                  onClick={handleDeactivateAdmin}
                  className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] rounded-lg transition-all cursor-pointer"
                >
                  Bloquear
                </button>
              </div>
              
              <button
                onClick={() => setActiveTab("config")}
                className={`w-full flex items-center gap-2.5 text-left text-[11px] px-3 py-2 rounded-xl transition-all cursor-pointer font-bold ${
                  activeTab === "config"
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-50 text-slate-600 border border-transparent"
                }`}
              >
                <Settings size={13} />
                <span>Configuración GitHub</span>
              </button>
            </div>
          ) : (!hideClientModeButton) ? (
            <button
              onClick={() => {
                setAdminPasswordError("");
                setAdminPasswordInput("");
                setShowAdminPasswordModal(true);
              }}
              className="w-full flex items-center justify-between gap-2 text-left text-[11px] px-3.5 py-3 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 text-slate-600 rounded-xl transition-all cursor-pointer font-bold"
            >
              <span className="flex items-center gap-2.5">
                <Lock size={13} className="text-slate-400" />
                <span>Modo Cliente</span>
              </span>
              <span className="text-[9px] font-black text-[var(--primary-color)] uppercase bg-[var(--primary-light)] border border-[var(--primary-border)] px-2 py-0.5 rounded-lg">
                Ingresar PIN
              </span>
            </button>
          ) : null}

          {/* Social Media & Contact Links in Navigation */}
          {((instagramEnabled && instagramUrl.trim()) ||
            (facebookEnabled && facebookUrl.trim()) ||
            (twitterEnabled && twitterUrl.trim()) ||
            (linkedinEnabled && linkedinUrl.trim()) ||
            (emailEnabled && emailContact.trim()) ||
            (mercadolibreEnabled && mercadolibreUrl.trim()) ||
            (youtubeEnabled && youtubeUrl.trim()) ||
            (tiktokEnabled && tiktokUrl.trim()) ||
            sellerWhatsApp) && (
            <div className="pt-3.5 border-t border-slate-100/60 space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold block px-1">
                Redes y Contacto
              </label>
              <div className="flex flex-wrap gap-1.5 px-1">
                {instagramEnabled && instagramUrl && instagramUrl.trim() !== "" && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Instagram size={13} />
                  </a>
                )}
                {facebookEnabled && facebookUrl && facebookUrl.trim() !== "" && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Facebook size={13} />
                  </a>
                )}
                {twitterEnabled && twitterUrl && twitterUrl.trim() !== "" && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter / X"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Twitter size={13} />
                  </a>
                )}
                {linkedinEnabled && linkedinUrl && linkedinUrl.trim() !== "" && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Linkedin size={13} />
                  </a>
                )}
                {emailEnabled && emailContact && emailContact.trim() !== "" && (
                  <a
                    href={`mailto:${emailContact.trim()}`}
                    title={`Correo: ${emailContact}`}
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Mail size={13} />
                  </a>
                )}
                {mercadolibreEnabled && mercadolibreUrl && mercadolibreUrl.trim() !== "" && (
                  <a
                    href={mercadolibreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="MercadoLibre - Perfil de Vendedor"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-amber-700 hover:text-amber-800 hover:border-amber-300 hover:bg-amber-50 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <ShoppingBag size={13} />
                  </a>
                )}
                {youtubeEnabled && youtubeUrl && youtubeUrl.trim() !== "" && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="YouTube"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Youtube size={13} />
                  </a>
                )}
                {tiktokEnabled && tiktokUrl && tiktokUrl.trim() !== "" && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="TikTok"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-sm text-xs font-bold"
                  >
                    🎵
                  </a>
                )}
                {sellerWhatsApp && (
                  <a
                    href={`https://wa.me/${sellerWhatsApp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp Directo"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all flex items-center justify-center cursor-pointer shadow-sm text-xs"
                  >
                    💬
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="text-slate-400 text-[10px] px-1 space-y-0.5 pt-1.5 border-t border-slate-100/60 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-500">Azurita 3D Shop v2.0</p>
              <p className="font-mono">{products.length} diseños activos</p>
            </div>
            {!isAdminMode && (
              <button
                onClick={() => {
                  setAdminPasswordError("");
                  setAdminPasswordInput("");
                  setShowAdminPasswordModal(true);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[var(--primary-color)] transition-all cursor-pointer flex items-center justify-center"
                title="Acceso Administrador"
              >
                <Lock size={11} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sync Controls / Database header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{storeName}</span>
              <ChevronRight size={12} className="text-slate-300" />
              <h1 className="text-sm font-black text-slate-800 tracking-tight">
                {activeTab === "productos" && "CATÁLOGO DE MODELOS"}
                {activeTab === "presupuestos" && "MÓDULO DE PRESUPUESTOS Y COTIZACIONES"}
                {activeTab === "subir_productos" && "CARGA Y GESTIÓN DE PRODUCTOS"}
                {activeTab === "plantilla_whatsapp" && "PLANTILLA Y PEDIDOS WHATSAPP"}
                {activeTab === "medios_de_pago" && "CONFIGURACIÓN DE PAGOS"}
                {activeTab === "forma_de_entrega" && "INFORMACIÓN DE ENVÍOS"}
                {activeTab === "historial_ventas" && "HISTORIAL DE VENTAS Y COMPRAS"}
                {activeTab === "config" && "VÍNCULO CON GITHUB"}
              </h1>
              {getSyncStateBadge()}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-2 shadow-sm text-xs relative"
              >
                <ShoppingBag size={14} className="text-amber-400" />
                <span>Carrito ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                {cart.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              {isConfigured && activeTab === "productos" && (
                <button
                  onClick={() => handlePullFromGitHub()}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1"
                >
                  <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                  Actualizar Catálogo
                </button>
              )}
              {syncState === "pending_changes" && (
                <button
                  onClick={() => setIsCommitModalOpen(true)}
                  className="px-3.5 py-1.5 text-white rounded-lg font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  style={{ backgroundColor: "var(--primary-color)" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color)"}
                >
                  <GitCommit size={13} />
                  Guardar en GitHub
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Panel Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1500px] w-full mx-auto space-y-6">
          {/* Error Banner */}
          <AnimatePresence>
            {errorBanner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-700 flex items-start justify-between gap-3 shadow-sm">
                  <div className="flex gap-2">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <div className="space-y-1.5">
                      <p className="font-semibold">Error detectado</p>
                      <p>{errorBanner}</p>
                      {isConfigured && (
                        <button
                          onClick={handleInitializeGitHubFile}
                          className="mt-1 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileJson size={13} />
                          <span>Crear / Inicializar archivo JSON en GitHub</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setErrorBanner(null)} 
                    className="p-1 hover:bg-red-100/60 rounded-lg cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sync status alert for pending local modifications */}
          {syncState === "pending_changes" && (
            <div 
              style={{ backgroundImage: "linear-gradient(to right, var(--primary-color), var(--primary-hover))" }}
              className="text-white rounded-2xl p-4.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <Database size={13} />
                  Cambios locales listos para publicar
                </h3>
                <p className="text-[11px] text-white/90 mt-1">
                  Tienes {changeStats.added} añadidos, {changeStats.modified} modificados y {changeStats.deleted} eliminados localmente. Sincronízalos con GitHub para guardarlos.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResetCatalog}
                  className="px-3 py-1.5 text-xs text-white/80 hover:text-white rounded-lg font-semibold transition-all cursor-pointer"
                >
                  Descartar
                </button>
                <button
                  onClick={() => setIsCommitModalOpen(true)}
                  style={{ color: "var(--primary-color)" }}
                  className="px-4 py-2 bg-white font-bold hover:bg-slate-50 rounded-lg text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <GitCommit size={13} />
                  Guardar en GitHub
                </button>
              </div>
            </div>
          )}

          {/* PAGE CONTENT ROUTING */}
          {activeTab === "config" ? (
            <GitHubConfigPanel
              config={config}
              onSave={handleSaveConfig}
              syncStatus={syncState}
              errorMessage={errorBanner}
              onTestConnection={handleTestConnection}
              isTesting={isTestingConfig}
              currentCatalogJson={JSON.stringify(products, null, 2)}
              adminPin={adminPin}
              setAdminPin={setAdminPin}
              storeName={storeName}
              setStoreName={setStoreName}
              storeSlogan={storeSlogan}
              setStoreSlogan={setStoreSlogan}
              priceMultiplier={priceMultiplier}
              setPriceMultiplier={setPriceMultiplier}
              waMessageTemplate={waMessageTemplate}
              setWaMessageTemplate={setWaMessageTemplate}
              sellerWhatsApp={sellerWhatsApp}
              setSellerWhatsApp={setSellerWhatsApp}
              hideClientModeButton={hideClientModeButton}
              setHideClientModeButton={setHideClientModeButton}
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              themeBgColor={themeBgColor}
              setThemeBgColor={setThemeBgColor}
              buttonStyle={buttonStyle}
              setButtonStyle={setButtonStyle}
              fontStyle={fontStyle}
              setFontStyle={setFontStyle}
              instagramUrl={instagramUrl}
              setInstagramUrl={setInstagramUrl}
              instagramEnabled={instagramEnabled}
              setInstagramEnabled={setInstagramEnabled}

              facebookUrl={facebookUrl}
              setFacebookUrl={setFacebookUrl}
              facebookEnabled={facebookEnabled}
              setFacebookEnabled={setFacebookEnabled}

              twitterUrl={twitterUrl}
              setTwitterUrl={setTwitterUrl}
              twitterEnabled={twitterEnabled}
              setTwitterEnabled={setTwitterEnabled}

              linkedinUrl={linkedinUrl}
              setLinkedinUrl={setLinkedinUrl}
              linkedinEnabled={linkedinEnabled}
              setLinkedinEnabled={setLinkedinEnabled}

              emailContact={emailContact}
              setEmailContact={setEmailContact}
              emailEnabled={emailEnabled}
              setEmailEnabled={setEmailEnabled}

              mercadolibreUrl={mercadolibreUrl}
              setMercadolibreUrl={setMercadolibreUrl}
              mercadolibreEnabled={mercadolibreEnabled}
              setMercadolibreEnabled={setMercadolibreEnabled}

              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              youtubeEnabled={youtubeEnabled}
              setYoutubeEnabled={setYoutubeEnabled}

              tiktokUrl={tiktokUrl}
              setTiktokUrl={setTiktokUrl}
              tiktokEnabled={tiktokEnabled}
              setTiktokEnabled={setTiktokEnabled}
              storeLogoUrl={storeLogoUrl}
              setStoreLogoUrl={setStoreLogoUrl}
              storeEmoji={storeEmoji}
              setStoreEmoji={setStoreEmoji}
              showNameWithLogo={showNameWithLogo}
              setShowNameWithLogo={setShowNameWithLogo}
              customBaseUrl={customBaseUrl}
              setCustomBaseUrl={setCustomBaseUrl}
              onInitializeJson={handleInitializeGitHubFile}
            />
          ) : activeTab === "presupuestos" ? (
            <QuotesModule
              products={products}
              priceMultiplier={priceMultiplier}
              sellerWhatsApp={sellerWhatsApp}
              storeName={storeName}
              showToast={showToast}
            />
          ) : activeTab === "subir_productos" ? (
            <CatalogUploadAndWhatsAppModule
              products={products}
              onAddProduct={handleAddProductFromModule}
              onUpdateProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onBulkAddProducts={handleBulkAddProductsFromModule}
              waMessageTemplate={waMessageTemplate}
              setWaMessageTemplate={setWaMessageTemplate}
              sellerWhatsApp={sellerWhatsApp}
              setSellerWhatsApp={setSellerWhatsApp}
              storeName={storeName}
              priceMultiplier={priceMultiplier}
              showToast={showToast}
              onSaveToGitHub={() => setIsCommitModalOpen(true)}
              syncState={syncState}
              activeSubTab="subir"
            />
          ) : activeTab === "plantilla_whatsapp" ? (
            <CatalogUploadAndWhatsAppModule
              products={products}
              onAddProduct={handleAddProductFromModule}
              onUpdateProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onBulkAddProducts={handleBulkAddProductsFromModule}
              waMessageTemplate={waMessageTemplate}
              setWaMessageTemplate={setWaMessageTemplate}
              sellerWhatsApp={sellerWhatsApp}
              setSellerWhatsApp={setSellerWhatsApp}
              storeName={storeName}
              priceMultiplier={priceMultiplier}
              showToast={showToast}
              onSaveToGitHub={() => setIsCommitModalOpen(true)}
              syncState={syncState}
              activeSubTab="plantilla"
            />
          ) : activeTab === "medios_de_pago" ? (
            /* MEDIOS DE PAGO CONFIG/VIEW VIEW */
            <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-slate-800">Cuentas y Datos de Pago</h2>
                    <p className="text-xs text-slate-500">
                      {isAdminMode 
                        ? "Configura los datos que recibirán tus clientes al finalizar su carrito de compras" 
                        : "Información oficial de cuentas para realizar transferencias o depósitos"}
                    </p>
                  </div>
                </div>
                {isAdminMode && (
                  <span className="text-[9px] font-black tracking-wider uppercase bg-[#8B5CF6] text-white px-2 py-1 rounded-lg">
                    Editor Activo
                  </span>
                )}
              </div>

              {isAdminMode ? (
                <div className="space-y-6">
                  {/* MASTER CONTROL DE PASARELA DE PAGOS ONLINE */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${paymentInfo.disableMercadoPago ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black uppercase tracking-wider">Pasarela de Pagos Online (Mercado Pago)</h3>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${paymentInfo.disableMercadoPago ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                              {paymentInfo.disableMercadoPago ? "DESACTIVADA" : "ACTIVADA"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {paymentInfo.disableMercadoPago 
                              ? "🔴 Pasarela desactivada. Los pedidos se envían directamente por WhatsApp para coordinar el pago." 
                              : "🟢 Pasarela activada. Los clientes pueden abonar online automáticamente con Mercado Pago."}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                        <input
                          type="checkbox"
                          checked={!paymentInfo.disableMercadoPago}
                          onChange={(e) => setPaymentInfo({...paymentInfo, disableMercadoPago: !e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                      <span>Flujo del Carrito: {paymentInfo.disableMercadoPago ? "Confirmación e información directa por WhatsApp" : "Checkout automático por Mercado Pago"}</span>
                      <span className="font-mono text-[9px] text-slate-500">Estado: {paymentInfo.disableMercadoPago ? "Desactivada" : "En línea"}</span>
                    </div>
                  </div>

                  {/* TRANSFERENCIA BANCARIA CONFIG */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Transferencia Bancaria</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!paymentInfo.disableTransferencia}
                          onChange={(e) => setPaymentInfo({...paymentInfo, disableTransferencia: !e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                        <span className="ml-2 text-xs font-bold text-slate-600">
                          {paymentInfo.disableTransferencia ? "Desactivado" : "Activo"}
                        </span>
                      </label>
                    </div>

                    {!paymentInfo.disableTransferencia ? (
                      <div className="space-y-4">
                        {/* Column/Fields for Promotions */}
                        <div className="bg-white border border-dashed border-[#8B5CF6]/30 p-3 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wide font-black text-slate-500 mb-1">Promoción (% Descuento)</label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={paymentInfo.descuentoTransferenciaPct ?? 0}
                                onChange={(e) => setPaymentInfo({...paymentInfo, descuentoTransferenciaPct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})}
                                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all font-mono"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wide font-black text-slate-500 mb-1">Mensaje de Promoción</label>
                            <input
                              type="text"
                              placeholder="Ej: ¡Ahorrá un % con transferencia!"
                              value={paymentInfo.promoTransferencia ?? ""}
                              onChange={(e) => setPaymentInfo({...paymentInfo, promoTransferencia: e.target.value})}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Account details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Nombre del Banco</label>
                            <input
                              type="text"
                              value={paymentInfo.banco}
                              onChange={(e) => setPaymentInfo({...paymentInfo, banco: e.target.value})}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Titular de la Cuenta</label>
                            <input
                              type="text"
                              value={paymentInfo.titular}
                              onChange={(e) => setPaymentInfo({...paymentInfo, titular: e.target.value})}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">CBU / CVU</label>
                            <input
                              type="text"
                              value={paymentInfo.cbu}
                              onChange={(e) => setPaymentInfo({...paymentInfo, cbu: e.target.value})}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Alias CBU</label>
                            <input
                              type="text"
                              value={paymentInfo.alias}
                              onChange={(e) => setPaymentInfo({...paymentInfo, alias: e.target.value})}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">CUIT / CUIL</label>
                            <input
                              type="text"
                              value={paymentInfo.cuit}
                              onChange={(e) => setPaymentInfo({...paymentInfo, cuit: e.target.value})}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">La opción de pago por Transferencia Bancaria se encuentra desactivada.</p>
                    )}
                  </div>

                  {/* MERCADO PAGO CONFIG */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#009EE3]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Mercado Pago</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!paymentInfo.disableMercadoPago}
                          onChange={(e) => setPaymentInfo({...paymentInfo, disableMercadoPago: !e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                        <span className="ml-2 text-xs font-bold text-slate-600">
                          {paymentInfo.disableMercadoPago ? "Desactivado" : "Activo"}
                        </span>
                      </label>
                    </div>

                    {!paymentInfo.disableMercadoPago ? (
                      <div className="space-y-4">
                        {/* Column/Fields for Promotions */}
                        <div className="bg-white border border-dashed border-[#8B5CF6]/30 p-3 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wide font-black text-slate-500 mb-1">Promoción (% Descuento)</label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={paymentInfo.descuentoMercadoPagoPct ?? 0}
                                onChange={(e) => setPaymentInfo({...paymentInfo, descuentoMercadoPagoPct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})}
                                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all font-mono"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wide font-black text-slate-500 mb-1">Mensaje de Promoción</label>
                            <input
                              type="text"
                              placeholder="Ej: ¡Descuento pagando con Mercado Pago!"
                              value={paymentInfo.promoMercadoPago ?? ""}
                              onChange={(e) => setPaymentInfo({...paymentInfo, promoMercadoPago: e.target.value})}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* MP details */}
                        <div>
                          <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Mercado Pago (Alias / Email)</label>
                          <input
                            type="text"
                            value={paymentInfo.mercadoPago}
                            onChange={(e) => setPaymentInfo({...paymentInfo, mercadoPago: e.target.value})}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">La opción de pago por Mercado Pago se encuentra desactivada.</p>
                    )}
                  </div>

                  {/* EFECTIVO AL RETIRAR CONFIG */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Pago en Efectivo (Showroom / Retiro)</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!paymentInfo.disableEfectivo}
                          onChange={(e) => setPaymentInfo({...paymentInfo, disableEfectivo: !e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                        <span className="ml-2 text-xs font-bold text-slate-600">
                          {paymentInfo.disableEfectivo ? "Desactivado" : "Activo"}
                        </span>
                      </label>
                    </div>

                    {!paymentInfo.disableEfectivo ? (
                      <div className="space-y-4">
                        {/* Column/Fields for Promotions */}
                        <div className="bg-white border border-dashed border-[#8B5CF6]/30 p-3 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wide font-black text-slate-500 mb-1">Promoción (% Descuento)</label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={paymentInfo.descuentoEfectivoPct ?? 0}
                                onChange={(e) => setPaymentInfo({...paymentInfo, descuentoEfectivoPct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})}
                                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all font-mono"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wide font-black text-slate-500 mb-1">Mensaje de Promoción</label>
                            <input
                              type="text"
                              placeholder="Ej: ¡Ahorrá un % en efectivo al retirar!"
                              value={paymentInfo.promoEfectivo ?? ""}
                              onChange={(e) => setPaymentInfo({...paymentInfo, promoEfectivo: e.target.value})}
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div>
                          <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Mensaje de Descuento Completo</label>
                          <input
                            type="text"
                            value={paymentInfo.descuentoEfectivo}
                            onChange={(e) => setPaymentInfo({...paymentInfo, descuentoEfectivo: e.target.value})}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">La opción de pago en Efectivo se encuentra desactivada.</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => showToast("Datos de pago actualizados correctamente.", "success")}
                      className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-violet-500/15"
                    >
                      <Save size={14} />
                      Guardar Datos de Pago
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Card Transferencia */}
                  {!paymentInfo.disableTransferencia && (
                    <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 space-y-4 relative overflow-hidden">
                      {getPaymentDiscountPct("transferencia") > 0 && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl shadow-sm">
                          {getPaymentDiscountPct("transferencia")}% OFF
                        </div>
                      )}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 pr-12">
                        <div>
                          <h3 className="text-xs font-black tracking-wider uppercase text-[#8B5CF6]">Transferencia Bancaria</h3>
                          {paymentInfo.promoTransferencia && (
                            <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">{paymentInfo.promoTransferencia}</p>
                          )}
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full shrink-0">Recomendado</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Banco</span>
                          <span className="font-bold text-slate-800">{paymentInfo.banco}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Titular</span>
                          <span className="font-bold text-slate-800">{paymentInfo.titular}</span>
                        </div>
                        <div className="sm:col-span-2 bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">CBU / CVU</span>
                            <span className="font-mono text-xs font-bold text-slate-700 tracking-wide select-all">{paymentInfo.cbu}</span>
                          </div>
                          <button
                            onClick={() => handleCopyText(paymentInfo.cbu, "CBU")}
                            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-[#8B5CF6] rounded-lg transition-all cursor-pointer border border-slate-100"
                            title="Copiar CBU"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Alias</span>
                            <span className="font-bold text-slate-700 select-all">{paymentInfo.alias}</span>
                          </div>
                          <button
                            onClick={() => handleCopyText(paymentInfo.alias, "Alias")}
                            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-[#8B5CF6] rounded-lg transition-all cursor-pointer border border-slate-100"
                            title="Copiar Alias"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">CUIT</span>
                            <span className="font-mono text-xs font-bold text-slate-700 tracking-wide select-all">{paymentInfo.cuit}</span>
                          </div>
                          <button
                            onClick={() => handleCopyText(paymentInfo.cuit, "CUIT")}
                            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-[#8B5CF6] rounded-lg transition-all cursor-pointer border border-slate-100"
                            title="Copiar CUIT"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Mercado Pago */}
                  {!paymentInfo.disableMercadoPago && paymentInfo.mercadoPago && (
                    <div className="border border-slate-150 rounded-2xl p-5 bg-[#009EE3]/5 space-y-3 relative overflow-hidden">
                      {getPaymentDiscountPct("mercado_pago") > 0 && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl shadow-sm">
                          {getPaymentDiscountPct("mercado_pago")}% OFF
                        </div>
                      )}
                      <div className="flex items-center justify-between border-b border-[#009EE3]/10 pb-2 pr-12">
                        <div>
                          <h3 className="text-xs font-black tracking-wider uppercase text-[#009EE3]">Mercado Pago</h3>
                          {paymentInfo.promoMercadoPago && (
                            <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">{paymentInfo.promoMercadoPago}</p>
                          )}
                        </div>
                        <span className="text-[9px] bg-[#009EE3]/10 text-[#009EE3] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Envío de dinero</span>
                      </div>
                      <div className="bg-white border border-[#009EE3]/10 rounded-xl p-3.5 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Cuenta / Email Mercado Pago</span>
                          <span className="font-bold text-slate-800 select-all">{paymentInfo.mercadoPago}</span>
                        </div>
                        <button
                          onClick={() => handleCopyText(paymentInfo.mercadoPago, "Mercado Pago")}
                          className="p-2 hover:bg-[#009EE3]/5 text-slate-400 hover:text-[#009EE3] rounded-lg transition-all cursor-pointer border border-slate-100"
                          title="Copiar cuenta"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Cash */}
                  {!paymentInfo.disableEfectivo && (
                    <div className="border border-emerald-100 rounded-2xl p-4.5 bg-emerald-50/40 text-emerald-800 flex items-start gap-3 text-xs leading-relaxed relative overflow-hidden">
                      {getPaymentDiscountPct("efectivo") > 0 && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-xl shadow-sm">
                          {getPaymentDiscountPct("efectivo")}% OFF
                        </div>
                      )}
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <div className="pr-12">
                        <span className="font-extrabold uppercase tracking-wider block text-[10px] text-emerald-600 mb-0.5">
                          Pago en Efectivo (Showroom / Retiro)
                        </span>
                        {paymentInfo.promoEfectivo && (
                          <p className="text-[10px] text-emerald-600 font-extrabold mb-1">{paymentInfo.promoEfectivo}</p>
                        )}
                        <p className="font-semibold text-slate-700">{paymentInfo.descuentoEfectivo}</p>
                      </div>
                    </div>
                  )}

                  {/* Empty state warning if all payment options are disabled */}
                  {paymentInfo.disableTransferencia && paymentInfo.disableMercadoPago && paymentInfo.disableEfectivo && (
                    <div className="border border-amber-200 rounded-2xl p-6 bg-amber-50 text-amber-800 text-center space-y-2">
                      <AlertCircle size={24} className="text-amber-500 mx-auto" />
                      <p className="font-bold text-xs">No hay medios de pago activos configurados.</p>
                      <p className="text-[11px] text-slate-500">Por favor, póngase en contacto con el administrador para coordinar su pedido.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === "forma_de_entrega" ? (
            /* FORMA DE ENTREGA CONFIG/VIEW VIEW */
            <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-slate-800">Puntos de Entrega y Envíos</h2>
                    <p className="text-xs text-slate-500">
                      {isAdminMode 
                        ? "Configura la información de retiro y tarifas estimadas de distribución" 
                        : "Opciones disponibles para retirar tu pedido o recibirlo en tu domicilio"}
                    </p>
                  </div>
                </div>
                {isAdminMode && (
                  <span className="text-[9px] font-black tracking-wider uppercase bg-[#8B5CF6] text-white px-2 py-1 rounded-lg">
                    Editor Activo
                  </span>
                )}
              </div>

              {isAdminMode ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Dirección del Showroom / Taller</label>
                      <input
                        type="text"
                        value={deliveryInfo.tallerDireccion}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, tallerDireccion: e.target.value})}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Días y Horarios de Retiro</label>
                      <input
                        type="text"
                        value={deliveryInfo.tallerHorarios}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, tallerHorarios: e.target.value})}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Costo Envío Moto CABA</label>
                        <input
                          type="text"
                          value={deliveryInfo.envioCaba}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, envioCaba: e.target.value})}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Costo Envío GBA</label>
                        <input
                          type="text"
                          value={deliveryInfo.envioGba}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, envioGba: e.target.value})}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-1">Envíos al Interior del País</label>
                      <textarea
                        value={deliveryInfo.envioInterior}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, envioInterior: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all resize-none"
                      />
                    </div>
                    
                    <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 space-y-2 mt-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="disableShippingCostsCheckbox"
                          checked={!!deliveryInfo.disableShippingCosts}
                          onChange={(e) => {
                            const updated = {...deliveryInfo, disableShippingCosts: e.target.checked};
                            setDeliveryInfo(updated);
                            localStorage.setItem("azurita_delivery_info", JSON.stringify(updated));
                          }}
                          className="mt-1 w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6]/25 border-slate-300 rounded cursor-pointer"
                        />
                        <div>
                          <label htmlFor="disableShippingCostsCheckbox" className="block text-xs font-black text-amber-900 cursor-pointer uppercase tracking-wider">
                            Desactivar opciones de envío a domicilio (Solo permitir Retiro por Taller)
                          </label>
                          <p className="text-[10px] text-amber-700 font-medium leading-relaxed mt-0.5">
                            Si se activa, el calculador del checkout ocultará los métodos "Moto" y "Correo". El cliente solo podrá seleccionar "Retiro por Taller" como método de entrega.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        localStorage.setItem("azurita_delivery_info", JSON.stringify(deliveryInfo));
                        showToast("Datos de entrega actualizados correctamente.", "success");
                      }}
                      className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-violet-500/15"
                    >
                      <Save size={14} />
                      Guardar Datos de Entrega
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {deliveryInfo.disableShippingCosts && (
                    <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-2.5">
                      <span className="text-lg">📍</span>
                      <div>
                        <p className="text-xs font-black text-amber-800 uppercase tracking-wide">Opciones de Envío Desactivadas</p>
                        <p className="text-[10px] text-amber-600 font-medium">Actualmente solo se encuentra disponible la opción de Retiro por Taller de forma gratuita.</p>
                      </div>
                    </div>
                  )}

                  {/* Option 1: Retiro en taller */}
                  <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-black tracking-wider uppercase text-[#8B5CF6] flex items-center gap-1.5">
                        <span>📍</span> Retirar en Taller / Showroom
                      </h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">¡Gratis!</span>
                    </div>
 
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Dirección</span>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{deliveryInfo.tallerDireccion || "Taller central en CABA"}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Días y Horarios de Atención</span>
                        <p className="font-semibold text-slate-600 mt-0.5">{deliveryInfo.tallerHorarios || "Lunes a Viernes de 10:00 a 18:00 hs"}</p>
                      </div>
                    </div>
                  </div>
 
                  {!deliveryInfo.disableShippingCosts && (
                    <>
                      {/* Option 2: Envío por Moto */}
                      <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h3 className="text-xs font-black tracking-wider uppercase text-[#8B5CF6] flex items-center gap-1.5">
                            <span>🏍️</span> Envíos en Moto Express
                          </h3>
                          <span className="text-[9px] bg-purple-50 text-[#8B5CF6] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">24/48hs</span>
                        </div>
     
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white border border-slate-100 rounded-xl p-3">
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">CABA</span>
                            <p className="font-black text-slate-800 text-sm mt-0.5">
                              {deliveryInfo.envioCaba || "Consultar"}
                            </p>
                          </div>
                          <div className="bg-white border border-slate-100 rounded-xl p-3">
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Gran Buenos Aires</span>
                            <p className="font-black text-slate-800 text-sm mt-0.5">
                              {deliveryInfo.envioGba || "Consultar"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Option 3: Envíos al Interior */}
                      {deliveryInfo.envioInterior && (
                        <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="text-xs font-black tracking-wider uppercase text-[#8B5CF6] flex items-center gap-1.5">
                              <span>📦</span> Envíos al Interior del País
                            </h3>
                            <span className="text-[9px] bg-blue-50 text-blue-600 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Todo el País</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl whitespace-pre-line">
                            {deliveryInfo.envioInterior}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === "historial_ventas" ? (
            /* HISTORIAL DE VENTAS Y COMPRAS MODULE (ADMIN) */
            <SalesHistoryModule
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onRefreshOrders={fetchOrders}
              sellerWhatsApp={sellerWhatsApp}
              storeName={storeName}
            />
          ) : (
            /* PRODUCTOS VIEW - EXACT REPRODUCTION OF DESIRED GRID + CART WIREFRAME */
            <div className="space-y-6">
              
              {/* Top search & sorting banner, labeled "BUSQUEDA" precisely as in wireframe */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  {/* BÚSQUEDA INPUT */}
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="BUSQUEDA (Buscar diseño, nombre, temática o etiquetas...)"
                      className="w-full pl-11 pr-5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 focus:border-[#8B5CF6] outline-none transition-all font-bold tracking-wide placeholder:text-slate-400"
                    />
                  </div>

                  {/* CREATE ACTION & SORTING OPTIONS */}
                  <div className="flex items-center gap-2.5 self-end md:self-auto">
                    <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <ArrowUpDown size={12} className="text-[#8B5CF6]" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent border-0 py-0 pr-4 font-bold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="default">Relevancia</option>
                        <option value="name-asc">Nombre (A-Z)</option>
                        <option value="price-asc">Precio: Menor a Mayor</option>
                        <option value="price-desc">Precio: Mayor a Menor</option>
                        <option value="stock-asc">Stock: Menor a Mayor</option>
                      </select>
                    </div>

                    {isAdminMode && (
                      <button
                        onClick={() => setIsAddingNew(true)}
                        className="px-3.5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        Crear Diseño
                      </button>
                    )}
                  </div>
                </div>

                {/* Category selectors carousell */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none border-t border-slate-100 pt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                    <SlidersHorizontal size={10} />
                    Filtro:
                  </span>
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap font-bold ${
                        selectedCategory === cat
                          ? "bg-[#8B5CF6] text-white shadow-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid + Cart Container matching the wireframe sketch's inner container */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Product Grid */}
                <div className="xl:col-span-8">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <AnimatePresence mode="popLayout">
                        {filteredProducts.map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            isSelected={selectedProduct?.id === prod.id}
                            priceMultiplier={priceMultiplier}
                            onClick={() => {
                              setSelectedProduct(prod);
                              setIsDetailModalOpen(true);
                            }}
                            onEncargarWhatsApp={handleEncargarWhatsApp}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Empty state card */
                    <div className="bg-white border border-slate-200 rounded-[28px] py-16 px-4 text-center shadow-sm">
                      <div className="p-4 bg-slate-50 text-slate-400 rounded-full w-fit mx-auto border border-slate-100 mb-4">
                        <Layers size={36} className="stroke-1" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">No se encontraron diseños</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                        No hay elementos que coincidan con la búsqueda o el filtro actual. Prueba limpiando los filtros.
                      </p>
                      {(searchQuery || selectedCategory !== "Todas") && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("Todas");
                          }}
                          className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                        >
                          Limpiar Filtros
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side: Product Detail or Inventory Stats Panel */}
                <div className="xl:col-span-4">
                  <RightDetailPanel
                    product={selectedProduct}
                    isAdding={isAddingNew}
                    categories={uniqueCategories.filter((c) => c !== "Todas")}
                    onSave={handleSaveProduct}
                    onDelete={handleDeleteProduct}
                    onClose={() => setSelectedProduct(null)}
                    onStartAdding={() => setIsAddingNew(true)}
                    onCancelAdding={() => setIsAddingNew(false)}
                    inventoryValue={products.reduce((sum, p) => sum + p.price * p.stock, 0)}
                    totalProductsCount={products.length}
                    totalStockUnits={products.reduce((sum, p) => sum + p.stock, 0)}
                    syncState={syncState}
                    remoteSha={remoteSha}
                    onEncargarWhatsApp={handleEncargarWhatsApp}
                    priceMultiplier={priceMultiplier}
                  />
                </div>

              </div>

            </div>
          )}

          {/* Public Store Footer */}
          <footer className="mt-16 pt-8 border-t border-slate-200/80 text-slate-500 text-xs pb-12 font-sans">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start font-black text-slate-900 text-sm">
                  {storeLogoUrl ? (
                    <img src={storeLogoUrl} alt={storeName} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <span className="text-lg">{storeEmoji}</span>
                  )}
                  <span className="tracking-tight">{storeName}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium max-w-sm">
                  {storeSlogan || "Especialistas en Impresión y Modelado 3D de alta definición."}
                </p>
              </div>

              {/* Social Networks & Contact Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {instagramEnabled && instagramUrl && instagramUrl.trim() !== "" && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200/80 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Instagram size={13} />
                    <span>Instagram</span>
                  </a>
                )}
                {facebookEnabled && facebookUrl && facebookUrl.trim() !== "" && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Facebook size={13} />
                    <span>Facebook</span>
                  </a>
                )}
                {twitterEnabled && twitterUrl && twitterUrl.trim() !== "" && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Twitter size={13} />
                    <span>Twitter / X</span>
                  </a>
                )}
                {linkedinEnabled && linkedinUrl && linkedinUrl.trim() !== "" && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Linkedin size={13} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {emailEnabled && emailContact && emailContact.trim() !== "" && (
                  <a
                    href={`mailto:${emailContact.trim()}`}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Mail size={13} />
                    <span>{emailContact}</span>
                  </a>
                )}
                {mercadolibreEnabled && mercadolibreUrl && mercadolibreUrl.trim() !== "" && (
                  <a
                    href={mercadolibreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag size={13} className="text-amber-600" />
                    <span>Perfil MercadoLibre</span>
                  </a>
                )}
                {youtubeEnabled && youtubeUrl && youtubeUrl.trim() !== "" && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Youtube size={13} />
                    <span>YouTube</span>
                  </a>
                )}
                {tiktokEnabled && tiktokUrl && tiktokUrl.trim() !== "" && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🎵 TikTok</span>
                  </a>
                )}
                {sellerWhatsApp && (
                  <a
                    href={`https://wa.me/${sellerWhatsApp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>💬 WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 mt-4 px-2">
              <p>© {new Date().getFullYear()} {storeName}. Todos los derechos reservados.</p>
              <p className="font-mono text-[9px] text-slate-400">Catálogo Digital Azurita 3D</p>
            </div>
          </footer>
        </main>
      </div>

      {/* MERCADO PAGO ONLINE CHECKOUT MODAL */}
      <MercadoPagoModal
        isOpen={isMercadoPagoModalOpen}
        onClose={() => setIsMercadoPagoModalOpen(false)}
        orderData={{
          customerName: customerName || "Cliente",
          customerEmail: customerMail || "cliente@example.com",
          customerPhone: customerPhone || "Sin teléfono",
          items: cart.filter(i => i && i.product && i.product.id).map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.quantity,
            unitPrice: getAdjustedPrice(i.product.price)
          })),
          paymentMethod: "mercado_pago",
          deliveryMethod,
          subtotal: cartTotal,
          discountAmount: getPaymentDiscountValue("mercado_pago"),
          shippingCost: getShippingCostValue(deliveryMethod),
          total: cartTotal - getPaymentDiscountValue("mercado_pago") + getShippingCostValue(deliveryMethod)
        }}
        onPaymentSuccess={(newOrder) => {
          setOrders((prev) => [newOrder, ...prev]);
          setCompletedOrder(newOrder);
          setCart([]);
          showToast("¡Pago de Mercado Pago acreditado exitosamente!", "success");
        }}
        storeName={storeName}
        sellerWhatsApp={sellerWhatsApp}
      />


      {/* DETAILED VIEW MODAL (Frees screen space and handles actions beautifully) */}
      <AnimatePresence>
        {isDetailModalOpen && selectedProduct && (
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
                  <span className="px-2.5 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded text-[10px] font-bold uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-md font-bold text-slate-900 mt-1">{selectedProduct.name}</h3>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Photo Frame */}
                <div className="relative aspect-[16/10] w-full rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                  {selectedProduct.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <Layers size={40} className="stroke-1 mb-2" />
                      <span className="text-xs">Sin foto disponible</span>
                    </div>
                  )}
                </div>

                {/* Specs Table */}
                <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Precio Unitario</span>
                    <span className="text-md font-black text-slate-900">
                      ${getAdjustedPrice(selectedProduct.price).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Stock Disponible</span>
                    <span className="text-md font-black text-slate-900">
                      {selectedProduct.stock} {selectedProduct.stock === 1 ? "unidad" : "unidades"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <FileText size={11} /> DESCRIPCIÓN:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto">
                    {selectedProduct.description || "Este diseño 3D no cuenta con descripción de materiales o acabados."}
                  </p>
                </div>

                {/* Tags */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Etiquetas:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] text-slate-500 font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                {isAdminMode ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (confirm("¿Seguro que deseas eliminar este diseño de tu catálogo?")) {
                          handleDeleteProduct(selectedProduct.id);
                        }
                      }}
                      className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProduct(true);
                        setIsDetailModalOpen(false);
                      }}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Settings size={12} />
                      Editar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold tracking-wide uppercase select-none">
                    <Lock size={11} className="text-slate-300" />
                    Catálogo
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setIsDetailModalOpen(false);
                    }}
                    disabled={selectedProduct.stock <= 0}
                    className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag size={13} />
                    Agregar al Carrito
                  </button>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CRUD ProductModal form editor (Adding new product) */}
      <AnimatePresence>
        {isAddingNew && (
          <ProductModal
            product={null}
            onSave={handleSaveProduct}
            onClose={() => setIsAddingNew(false)}
            categories={uniqueCategories.filter(c => c !== "Todas")}
          />
        )}
      </AnimatePresence>

      {/* CRUD ProductModal form editor (Editing existing product) */}
      <AnimatePresence>
        {isEditingProduct && selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onSave={handleSaveProduct}
            onClose={() => setIsEditingProduct(false)}
            categories={uniqueCategories.filter(c => c !== "Todas")}
          />
        )}
      </AnimatePresence>

      {/* Commit & Push Confirmation Modal */}
      <AnimatePresence>
        {isCommitModalOpen && (
          <CommitModal
            onCommit={handleCommitToGitHub}
            onClose={() => setIsCommitModalOpen(false)}
            config={config}
            stats={changeStats}
          />
        )}
      </AnimatePresence>

      {/* Admin Mode PIN Verification Modal */}
      <AnimatePresence>
        {showAdminPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-5 text-center relative overflow-hidden"
            >
              {/* Abstract decorative background glow */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#8B5CF6]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#8B5CF6]/10 rounded-full blur-2xl" />

              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-purple-50 text-[#8B5CF6] rounded-2xl border border-purple-100 shadow-sm relative">
                  <Lock size={22} className="relative z-10 animate-pulse" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mt-2">
                  Ingresar PIN de Seguridad
                </h3>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Este PIN restringe el acceso al editor de productos y configuraciones de sincronización. (PIN por defecto: <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded">1234</span>)
                </p>
              </div>

              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    autoFocus
                    placeholder="••••"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setAdminPasswordInput(val);
                      if (adminPasswordError) setAdminPasswordError("");
                    }}
                    className="w-full text-center text-xl font-black tracking-[1em] pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/25 outline-none transition-all placeholder:text-slate-300 font-mono"
                  />
                </div>

                {adminPasswordError && (
                  <p className="text-[11px] font-semibold text-red-500 bg-red-50/60 py-1.5 px-3 rounded-lg border border-red-100">
                    {adminPasswordError}
                  </p>
                )}

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminPasswordModal(false);
                      setAdminPasswordInput("");
                      setAdminPasswordError("");
                    }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-violet-500/10"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Cart Quick Access Button */}
      {cart.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-5 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-200/50 cursor-pointer transition-all active:scale-95"
        >
          <div className="relative">
            <ShoppingBag size={18} />
            <span className="absolute -top-2 -right-2 bg-slate-950 text-amber-300 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono border border-amber-400">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] uppercase tracking-widest text-slate-900/80 font-extrabold">Ver Carrito</span>
            <span className="text-xs font-mono font-black">${cartTotal.toLocaleString("es-AR")}</span>
          </div>
        </motion.button>
      )}

      {/* CART DRAWER MODAL */}
      <CartDrawerModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        cartTotal={cartTotal}
        getAdjustedPrice={getAdjustedPrice}
        deliveryMethod={deliveryMethod}
        setDeliveryMethod={setDeliveryMethod}
        deliveryInfo={deliveryInfo}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentInfo={paymentInfo}
        getPaymentDiscountPct={getPaymentDiscountPct}
        getPaymentDiscountValue={getPaymentDiscountValue}
        getShippingCostValue={getShippingCostValue}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerMail={customerMail}
        setCustomerMail={setCustomerMail}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        onConfirmPurchase={handleConfirmPurchase}
        storeName={storeName}
        primaryColor={primaryColor}
        handleCopyText={handleCopyText}
      />
    </div>
  );
}
