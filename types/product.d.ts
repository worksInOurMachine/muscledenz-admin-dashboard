
export interface Product {
  id: string;
  documentId: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  images: string[];
  thumbnail: string|null;
  stock: number;
  category: CategoryResType;
  tags: ?string[];
  collectionType: string;
  createdAt: string;
  updatedAt: string;
  isVeg: boolean;
}
