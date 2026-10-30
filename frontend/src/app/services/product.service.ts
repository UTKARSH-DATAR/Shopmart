import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch all active products for the catalog / home page
   * Calls GET http://localhost:8080/api/products
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(API_ENDPOINTS.products);
  }

  /**
   * Admin: Fetch all products including soft-deleted items
   * Calls GET http://localhost:8080/api/products/admin/all
   */
  getAllProductsAdmin(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_ENDPOINTS.products}/admin/all`);
  }

  /**
   * Fetch single product details by ID
   * Calls GET http://localhost:8080/api/products/{id}
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_ENDPOINTS.products}/${id}`);
  }

  /**
   * Search active products by keyword
   * Calls GET http://localhost:8080/api/products/search?query=...
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_ENDPOINTS.products}/search`, {
      params: { query }
    });
  }

  /**
   * Filter active products by category name
   * Calls GET http://localhost:8080/api/products/category/{category}
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_ENDPOINTS.products}/category/${encodeURIComponent(category)}`);
  }

  /**
   * Admin: Add a new product to catalog
   * Calls POST http://localhost:8080/api/products
   */
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(API_ENDPOINTS.products, product);
  }

  /**
   * Admin: Update an existing product
   * Calls PUT http://localhost:8080/api/products/{id}
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${API_ENDPOINTS.products}/${id}`, product);
  }

  /**
   * Admin: Soft-delete product (sets status to 'Deleted' & quantity to 0)
   * Calls DELETE http://localhost:8080/api/products/{id}
   */
  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${API_ENDPOINTS.products}/${id}`, { responseType: 'text' });
  }

  /**
   * Admin: Upload product image file to Cloudinary
   * Calls POST http://localhost:8080/api/products/upload-image
   * Returns: { imageUrl: 'https://res.cloudinary.com/...' }
   */
  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${API_ENDPOINTS.products}/upload-image`, formData);
  }
}
