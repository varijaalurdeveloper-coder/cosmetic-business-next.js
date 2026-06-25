/**
 * =========================
 * ✅ PRODUCT CATEGORY (AI-ALIGNED)
 * =========================
 */
export type ProductCategory =
  | "hair"
  | "skin"
  | "lips"
  | "body"
  | "soap"
  | "baby-care"
  | "general"; // optional fallback for uncategorized products

/**
 * =========================
 * ✅ PRODUCT (AI READY)
 * =========================
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory | string;
  description: string;
  image: string;
  inStock: boolean;
  volume?: string;
  subcategory?: string;

  /**
   * 🔥 AI FIELDS (OPTIONAL)
   */
  concerns?: string[];
  concernKeywords?: string[];
  skin_type?: string[];
  hair_type?: string[];
  tags?: string[];
  benefits?: string[];
  ingredients?: string[];
  usage?: string;

  priority?: number;
}

/**
 * =========================
 * 🛒 CART
 * =========================
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * =========================
 * 📦 ORDER STATUS
 * =========================
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered";

/**
 * =========================
 * 🚚 SHIPPING ADDRESS
 * =========================
 */
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
 * 📦 ORDER ITEM
 * =========================
 */
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;

  // analytics
  itemTotal: number;
}

/**
 * =========================
 * 📊 ORDER (ANALYTICS READY)
 * =========================
 */
export interface Order {
  id: string;

  // user
  userId: string;
  customerName: string;
  email: string;
  phone: string;

  // address
  address: string;

  // order data
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;

  // optional
  notes?: string;

  // timestamps
  createdAt: string;
  updatedAt?: string;

  // delivery
  estimatedDelivery?: string;

  /**
   * 🔥 ANALYTICS HELPERS
   */
  itemCount: number;
  totalQuantity: number;

  // chart helpers
  day: number;
  month: number;
  year: number;
}

/**
 * =========================
 * 👤 USER
 * =========================
 */
export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}