import { Product } from "../types";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Servicio de Modelado 3D & Diseño Paramétrico",
    category: "Servicios Digitales",
    price: 12500.00,
    stock: 99,
    description: "Diseño cad tridimensional personalizado a partir de bocetos, planos o ideas. Entrega de archivos editables STEP, IGES y STL listos para producción o fabricación digital.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
    tags: ["Digital", "Modelado 3D", "CAD", "Diseño", "Personalizado"]
  },
  {
    id: "prod-2",
    name: "Optimización, Reparación & Malla de Archivos STL",
    category: "Servicios Digitales",
    price: 4500.00,
    stock: 99,
    description: "Servicio técnico digital para reparar mallas no-manifold, rebanar geometrías complejas, ahuecar modelos y generar soportes optimizados para impresión FDM y Resina.",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=600",
    tags: ["Digital", "STL", "Slicing", "Reparación", "Optimización"]
  },
  {
    id: "prod-3",
    name: "Soporte de Auriculares Azurita Pro 3D",
    category: "Accesorios 3D",
    price: 3490.00,
    stock: 15,
    description: "Soporte premium para auriculares con estructura helicoidal futurista. Impreso en PLA biodegradable de alta densidad con acabado satinado suave.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    tags: ["Impresión 3D", "Soporte", "Escritorio", "Prototipo"]
  },
  {
    id: "prod-4",
    name: "Lámpara Hexagonal 'Voronoi' Impresa en 3D",
    category: "Iluminación 3D",
    price: 8900.00,
    stock: 8,
    description: "Lámpara de diseño paramétrico con patrón Voronoi celular. Difunde patrones de luz orgánicos en paredes y techos. Incluye electrificación LED E27.",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600",
    tags: ["Lámpara", "Voronoi", "Diseño 3D", "Iluminación"]
  },
  {
    id: "prod-5",
    name: "Maceta Geométrica Twist Autorregante 3D",
    category: "Decoración 3D",
    price: 1850.00,
    stock: 25,
    description: "Maceta modular con diseño geométrico trenzado en doble hélice. Incluye depósito interno para autorriego pasivo de plantas.",
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600",
    tags: ["Maceta", "Eco", "PLA", "Decoración"]
  },
  {
    id: "prod-6",
    name: "Organizador de Escritorio Bento Modular 3D",
    category: "Accesorios 3D",
    price: 2450.00,
    stock: 18,
    description: "Set de 4 módulos encastramientos para útiles, teléfono y accesorios. Fabricado en polímeros sostenibles con encaje magnético.",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600",
    tags: ["Organizador", "Modular", "Oficina", "3D"]
  }
];

