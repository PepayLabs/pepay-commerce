export interface CartItem {
  id: string;
  productId: string;
  retailer: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
  stars?: number;
  numReviews?: number;
  brand?: string;
  categories?: string[];
  source: string;
  productUrl: string;
  metadata?: {
    originalPrice?: number;
  };
  addedAt: string;
  updatedAt: string;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
}

export interface CartApiResponse {
  success: boolean;
  data: Cart;
  meta?: {
    timestamp: string;
  };
}

export interface AddToCartRequest {
  productId: string;
  retailer: string;
  quantity: number;
  price: number;
  imageUrl: string;
  source: string;
  productUrl: string;
  title?: string;
  stars?: number;
  numReviews?: number;
  brand?: string;
  categories?: string[];
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartItemResponse {
  success: boolean;
  data: {
    id: string;
    productId: string;
    retailer: string;
    title: string;
    imageUrl: string;
    price: number;
    quantity: number;
    subtotal: number;
    stars?: number;
    numReviews?: number;
    brand?: string;
    categories?: string[];
    source: string;
    productUrl: string;
  };
  meta?: any;
}

export interface CartClearResponse {
  success: boolean;
  data: {
    success: boolean;
    message: string;
    itemsRemoved: number;
  };
}

export interface CartErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}