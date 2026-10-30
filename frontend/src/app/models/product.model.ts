// Product model matching backend Product entity
export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number; // Available inventory for stock validation
  quantity?: number;      // Flopkart alias
  imageUrl: string;
  imgurl?: string;        // Flopkart alias
  category?: string;
  status?: 'Active' | 'Deleted' | string;
}
