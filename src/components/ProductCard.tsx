import React from "react";
import { motion } from "motion/react";
import { 
  Folder, Sofa, Headphones, Keyboard, Lightbulb, 
  Laptop, Activity, Heart, Award, Sparkles, AlertCircle, FileText, Compass, HelpCircle, MessageSquare
} from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onClick: () => void;
  onEncargarWhatsApp: (product: Product) => void;
  key?: string;
  priceMultiplier?: number;
}

// Map categories to beautiful pastel color palettes matching the uploaded image
export const getCategoryStyles = (category: string) => {
  const cat = category.toLowerCase();
  
  if (cat.includes("ansiedad") || cat.includes("estrés") || cat.includes("mobil")) {
    return { 
      bg: "bg-[#E5F1FF]", 
      text: "text-[#1B3B6F]", 
      iconBg: "bg-[#FFFFFF]", 
      iconColor: "text-[#2A73E8]" 
    };
  }
  if (cat.includes("depresión") || cat.includes("tristeza") || cat.includes("audio")) {
    return { 
      bg: "bg-[#EDE9FE]", 
      text: "text-[#4C1D95]", 
      iconBg: "bg-[#FFFFFF]", 
      iconColor: "text-[#7C3AED]" 
    };
  }
  if (cat.includes("autoestima") || cat.includes("tech") || cat.includes("tecnología")) {
    return { 
      bg: "bg-[#ECFDF5]", 
      text: "text-[#064E3B]", 
      iconBg: "bg-[#FFFFFF]", 
      iconColor: "text-[#059669]" 
    };
  }
  if (cat.includes("regulación") || cat.includes("iluminación") || cat.includes("luz")) {
    return { 
      bg: "bg-[#FDF2F8]", 
      text: "text-[#701A75]", 
      iconBg: "bg-[#FFFFFF]", 
      iconColor: "text-[#DB2777]" 
    };
  }
  if (cat.includes("trauma") || cat.includes("infantil")) {
    return { 
      bg: "bg-[#FFF1F2]", 
      text: "text-[#9F1239]", 
      iconBg: "bg-[#FFFFFF]", 
      iconColor: "text-[#E11D48]" 
    };
  }
  if (cat.includes("tda") || cat.includes("tca") || cat.includes("toc")) {
    return { 
      bg: "bg-[#FFF7ED]", 
      text: "text-[#7C2D12]", 
      iconBg: "bg-[#FFFFFF]", 
      iconColor: "text-[#EA580C]" 
    };
  }
  
  // Default stylish pastel palette
  return { 
    bg: "bg-[#FAF5F0]", 
    text: "text-[#5C4033]", 
    iconBg: "bg-[#FFFFFF]", 
    iconColor: "text-[#A0522D]" 
  };
};

export const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("ansiedad")) return <Activity size={18} />;
  if (cat.includes("depresión")) return <Heart size={18} />;
  if (cat.includes("autoestima")) return <Award size={18} />;
  if (cat.includes("estrés")) return <Compass size={18} />;
  if (cat.includes("tda") || cat.includes("tca") || cat.includes("toc")) return <Sparkles size={18} />;
  
  // Products categories helper
  if (cat.includes("mueble") || cat.includes("mobiliario") || cat.includes("silla") || cat.includes("escritorio")) return <Sofa size={18} />;
  if (cat.includes("audio") || cat.includes("audífonos") || cat.includes("auriculares") || cat.includes("micrófono")) return <Headphones size={18} />;
  if (cat.includes("iluminación") || cat.includes("lámpara") || cat.includes("luz")) return <Lightbulb size={18} />;
  if (cat.includes("tecnología") || cat.includes("teclado") || cat.includes("laptop") || cat.includes("tech")) return <Laptop size={18} />;
  
  return <Folder size={18} />;
};

export default function ProductCard({ product, isSelected, onClick, onEncargarWhatsApp, priceMultiplier = 1.0 }: ProductCardProps) {
  const style = getCategoryStyles(product.category);
  const icon = getCategoryIcon(product.category);
  const displayPrice = Math.round(product.price * priceMultiplier);

  // Read image URL from imageUrl or image property
  const rawImageSrc = product.imageUrl || product.image || "";
  const DEFAULT_PLACEHOLDER = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600";
  
  const [imgError, setImgError] = React.useState(false);

  // Reset image error state when product or image URL changes
  React.useEffect(() => {
    setImgError(false);
  }, [rawImageSrc]);

  const displayImageSrc = imgError || !rawImageSrc ? DEFAULT_PLACEHOLDER : rawImageSrc;

  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative p-4 rounded-[24px] cursor-pointer transition-all flex flex-col justify-between select-none bg-white border ${
        isSelected 
          ? "ring-[3px] ring-[var(--primary-color)] shadow-lg border-transparent scale-[1.01]" 
          : "border-slate-200/80 hover:shadow-md hover:border-slate-300"
      }`}
    >
      <div>
        {/* Product Image Frame */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-3.5 group">
          <img
            src={displayImageSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Category Floating Badge */}
          <div className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-md ${style.bg} ${style.text}`}>
            <div className={`w-4 h-4 rounded-full ${style.iconBg} flex items-center justify-center ${style.iconColor}`}>
              {icon}
            </div>
            <span className="text-[10px] font-bold tracking-tight">{product.category}</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-extrabold text-[15px] leading-snug text-slate-900 mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Description Snippet if available */}
        {product.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Precio Unitario</span>
            <span className="text-base font-black text-slate-900 tracking-tight">
              ${displayPrice.toLocaleString("es-AR")}
            </span>
          </div>

          {product.stock <= 5 && product.stock > 0 ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
              <AlertCircle size={10} />
              <span>Consultar cupos</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
              Stock: {product.stock}
            </span>
          )}
        </div>

        {/* Encargar por WhatsApp Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEncargarWhatsApp(product);
          }}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm hover:shadow-md active:scale-95"
        >
          <MessageSquare size={14} className="fill-white/20" />
          <span>Encargar por WhatsApp</span>
        </button>
      </div>
    </motion.div>
  );
}
