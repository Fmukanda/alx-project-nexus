export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  onSale: boolean;
  category: Category;
  gender: 'M' | 'W' | 'U';
  brand: string;
  material: string;
  careInstructions: string;
  isActive: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

export interface ProductImage {
  id: string;
  image: string;
  altText: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
}