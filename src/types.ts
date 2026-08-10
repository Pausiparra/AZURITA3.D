export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl?: string;
  image?: string;
  tags?: string[];
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
}

export type SyncState = "disconnected" | "synced" | "pending_changes" | "out_of_sync" | "error" | "loading";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string; // e.g., "AZ-84920"
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  paymentMethod: "mercado_pago" | "transferencia" | "efectivo";
  paymentStatus: "Pagado" | "Pendiente" | "Cancelado";
  deliveryMethod: "retiro" | "moto" | "gba" | "correo";
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  notes?: string;
}
