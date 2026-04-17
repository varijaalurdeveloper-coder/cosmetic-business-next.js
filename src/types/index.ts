export type ProductCategory =
  | "hair-care"
  | "soap"
  | "skin-care"
  | "lip-care";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
  image: string;
  inStock: boolean;
  volume?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

/**
 * =========================
 * ✅ ORDER ITEM (DB aligned)
 * =========================
 */
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;

  // 🔥 analytics
  itemTotal: number;
}

/**
 * =========================
 * ✅ ORDER (ANALYTICS READY)
 * =========================
 */
export interface Order {
  id: string;

  // 👤 user
  userId: string;
  customerName: string;
  email: string;
  phone: string;

  // 📦 address
  address: string;

  // 🧾 order data
  items: OrderItem[];
  totalAmount: number; // 🔥 renamed from total
  status: OrderStatus;

  // 📝 optional
  notes?: string;

  // 📅 timestamps (Supabase returns string)
  createdAt: string;
  updatedAt?: string;

  // 🚚 optional
  estimatedDelivery?: string;

  /**
   * =========================
   * 🔥 ANALYTICS HELPERS
   * =========================
   */
  itemCount: number;
  totalQuantity: number;

  // 📊 chart helpers
  day: number;
  month: number;
  year: number;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}