import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services';
import { Product } from '../../../models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-products-page">
      <div class="top-bar">
        <h1>Manage Products</h1>
        <div class="actions">
          <a routerLink="/admin" class="btn-back">← Back to Dashboard</a>
          <a routerLink="/admin/add-product" class="btn-add">➕ Add Product</a>
        </div>
      </div>

      @if (loading()) {
        <p class="status-msg">Loading products...</p>
      } @else if (products().length === 0) {
        <p class="status-msg">No products available.</p>
      } @else {
        <!-- Grid of products matching Flopkart viewproducts.jsp -->
        <div class="container">
          @for (product of products(); track product.id) {
            <div class="product-card" [class.deleted]="product.status === 'Deleted'">
              @if (product.status === 'Deleted') {
                <span class="deleted-tag">DELETED</span>
              }

              <img
                [src]="product.imageUrl || product.imgurl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'"
                [alt]="product.name"
              />

              <h3>{{ product.name }}</h3>
              <p>Price: <strong>₹{{ product.price }}</strong></p>
              <p>Stock: {{ product.stockQuantity }}</p>
              @if (product.category) {
                <p class="cat">{{ product.category }}</p>
              }

              <div class="btn-group">
                <button class="btn btn-edit" (click)="editProduct(product.id!)" title="Edit">
                  ✏️ Edit
                </button>
                @if (product.status !== 'Deleted') {
                  <button class="btn btn-delete" (click)="deleteProduct(product.id!)" title="Delete">
                    🗑️ Delete
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-products-page {
      width: 90%;
      max-width: 1200px;
      margin: 20px auto;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .top-bar h1 {
      margin: 0;
      font-size: 26px;
      color: #222;
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .btn-back {
      padding: 10px 16px;
      background: #eee;
      color: #333;
      border-radius: 6px;
      font-weight: 500;
      font-size: 14px;
    }

    .btn-add {
      padding: 10px 18px;
      background: #28a745;
      color: #fff;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
    }

    .container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      padding: 15px;
      text-align: center;
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .product-card.deleted {
      opacity: 0.6;
      background: #fdfdfd;
    }

    .deleted-tag {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #dc3545;
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .product-card img {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .product-card h3 {
      margin: 10px 0 5px;
      font-size: 16px;
      color: #333;
    }

    .product-card p {
      margin: 4px 0;
      color: #666;
      font-size: 13px;
    }

    .cat {
      color: #007bff;
      font-weight: 500;
    }

    .btn-group {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 15px;
    }

    .btn {
      padding: 8px 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
      transition: background 0.2s ease;
    }

    .btn-edit {
      background-color: #007bff;
      color: #fff;
    }

    .btn-edit:hover {
      background-color: #0056b3;
    }

    .btn-delete {
      background-color: #dc3545;
      color: #fff;
    }

    .btn-delete:hover {
      background-color: #a71d2a;
    }

    .status-msg {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllProductsAdmin().subscribe({
      next: (list) => {
        this.products.set(list || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  editProduct(id: number): void {
    this.router.navigate(['/admin/edit-product', id]);
  }

  deleteProduct(id: number): void {
    if (confirm('Delete this product? It will be soft-deleted to preserve past customer order records.')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => alert('Failed to delete product: ' + err)
      });
    }
  }
}
