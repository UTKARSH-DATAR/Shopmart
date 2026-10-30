import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services';
import { Product } from '../../../models';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="top-nav">
        <a routerLink="/admin/products" class="back-link">← Back to Products</a>
      </div>

      <h1>{{ isEditMode() ? 'Edit Product' : 'Add New Product' }}</h1>

      @if (errorMessage()) {
        <div class="error-box">{{ errorMessage() }}</div>
      }
      @if (successMessage()) {
        <div class="success-box">{{ successMessage() }}</div>
      }

      <form (ngSubmit)="saveProduct()">
        <label>Product Name *</label>
        <input
          type="text"
          name="name"
          [(ngModel)]="product.name"
          placeholder="e.g. Sony Wireless Headphones"
          required
        />

        <label>Description *</label>
        <textarea
          name="description"
          rows="4"
          [(ngModel)]="product.description"
          placeholder="Detailed product features and specifications"
          required
        ></textarea>

        <div class="form-row">
          <div class="col">
            <label>Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              name="price"
              [(ngModel)]="product.price"
              placeholder="0.00"
              required
            />
          </div>
          <div class="col">
            <label>Stock Quantity *</label>
            <input
              type="number"
              name="stockQuantity"
              [(ngModel)]="product.stockQuantity"
              placeholder="e.g. 25"
              required
            />
          </div>
        </div>

        <label>Category</label>
        <select name="category" [(ngModel)]="product.category">
          <option value="">Select a Category...</option>
          <option value="Electronics">Electronics</option>
          <option value="Mobiles">Mobiles</option>
          <option value="Fashion">Fashion</option>
          <option value="Appliances">Appliances</option>
          <option value="Books">Books</option>
          <option value="Other">Other</option>
        </select>

        <!-- Product Image Upload via Cloudinary matching Flopkart UploadAndForward -->
        <div class="image-upload-section">
          <label>Product Image (Uploaded to Cloudinary)</label>
          <input
            type="file"
            accept="image/*"
            (change)="onFileSelected($event)"
          />

          @if (uploading()) {
            <div class="upload-status">⏳ Uploading image to Cloudinary...</div>
          }

          @if (product.imageUrl) {
            <div class="preview-box">
              <p>Image Preview:</p>
              <img [src]="product.imageUrl" alt="Product preview" />
            </div>
          }
        </div>

        <button type="submit" class="submit-btn" [disabled]="submitting() || uploading()">
          {{ submitting() ? 'Saving Product...' : (isEditMode() ? '💾 Update Product' : '➕ Add Product') }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 30px auto;
      background: #fff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.1);
    }

    .top-nav {
      margin-bottom: 15px;
    }

    .back-link {
      color: #007bff;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    h1 {
      text-align: center;
      margin-top: 0;
      margin-bottom: 25px;
      color: #333;
      font-size: 24px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: bold;
      color: #444;
      font-size: 14px;
    }

    input[type="text"],
    input[type="number"],
    textarea,
    select {
      width: 100%;
      padding: 10px;
      margin-bottom: 18px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }

    input:focus, textarea:focus, select:focus {
      border-color: #007bff;
      outline: none;
    }

    .form-row {
      display: flex;
      gap: 15px;
    }

    .col {
      flex: 1;
    }

    .image-upload-section {
      background: #fafafa;
      padding: 15px;
      border-radius: 6px;
      border: 1px dashed #ccc;
      margin-bottom: 20px;
    }

    .upload-status {
      margin-top: 8px;
      color: #007bff;
      font-weight: 500;
      font-size: 13px;
    }

    .preview-box {
      margin-top: 12px;
    }

    .preview-box p {
      margin: 0 0 6px 0;
      font-size: 12px;
      color: #666;
    }

    .preview-box img {
      max-width: 150px;
      max-height: 150px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #ddd;
    }

    .submit-btn {
      width: 100%;
      padding: 14px;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .submit-btn:hover:not(:disabled) {
      background: #218838;
    }

    .submit-btn:disabled {
      background: #888;
      cursor: not-allowed;
    }

    .error-box {
      background: #ffebee;
      color: #d32f2f;
      padding: 10px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
      text-align: center;
    }

    .success-box {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 10px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
      text-align: center;
    }
  `]
})
export class AdminProductFormComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEditMode = signal<boolean>(false);
  productId = signal<number | null>(null);

  uploading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  product: Product = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 1,
    imageUrl: '',
    category: ''
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(Number(id));
      this.productService.getProductById(Number(id)).subscribe({
        next: (p) => (this.product = { ...p }),
        error: () => this.errorMessage.set('Could not load product for editing.')
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.errorMessage.set('');

    this.productService.uploadImage(file).subscribe({
      next: (res) => {
        this.product.imageUrl = res.imageUrl;
        this.uploading.set(false);
      },
      error: (err) => {
        this.uploading.set(false);
        this.errorMessage.set('Failed to upload image to Cloudinary: ' + (err.error?.error || err.message));
      }
    });
  }

  saveProduct(): void {
    if (!this.product.name || !this.product.description || this.product.price <= 0) {
      this.errorMessage.set('Please provide a valid name, description, and price.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    if (this.isEditMode() && this.productId()) {
      this.productService.updateProduct(this.productId()!, this.product).subscribe({
        next: () => {
          this.submitting.set(false);
          this.successMessage.set('Product updated successfully!');
          setTimeout(() => this.router.navigate(['/admin/products']), 1000);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.error || 'Failed to update product.');
        }
      });
    } else {
      this.productService.addProduct(this.product).subscribe({
        next: () => {
          this.submitting.set(false);
          this.successMessage.set('Product added successfully!');
          setTimeout(() => this.router.navigate(['/admin/products']), 1000);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err.error || 'Failed to add product.');
        }
      });
    }
  }
}
