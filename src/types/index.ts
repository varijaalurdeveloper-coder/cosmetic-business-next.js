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

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: "whatsapp";
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}