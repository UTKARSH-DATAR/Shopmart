import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CartService, ProductService } from '../../services';
import { Product, CartItem } from '../../models';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper">
      <button class="back-link" (click)="goBack()">← Back to products</button>

      @if (loading()) {
        <div class="loading">Loading product details...</div>
      } @else if (!product()) {
        <div class="loading">Product not found.</div>
      } @else {
        <div class="product-container">
          <!-- Image Section -->
          <div class="product-image">
            <img
              [src]="product()?.imageUrl || product()?.imgurl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'"
              [alt]="product()?.name"
            />
          </div>

          <!-- Details Section -->
          <div class="product-details">
            <h2>{{ product()?.name }}</h2>

            @if (product()?.category) {
              <span class="category-badge">{{ product()?.category }}</span>
            }

            <div class="price-section">
              <span class="price">₹{{ product()?.price }}</span>
              <span class="old-price">₹{{ ((product()?.price || 0) * 1.25).toFixed(0) }}</span>
              <span class="offer-badge">20% OFF</span>
            </div>

            <p class="description">{{ product()?.description }}</p>

            <!-- Stock status matching Flopkart productdetails.jsp -->
            @if (getStock() === 0) {
              <div class="stock-alert">⚠️ Out of Stock!</div>
            } @else if (getStock() <= 5) {
              <div class="stock-alert">🔥 Hurry! Only {{ getStock() }} items left in stock!</div>
            } @else {
              <div class="stock-ok">✅ In Stock ({{ getStock() }} available)</div>
            }

            <!-- Cart Controls matching Flopkart -->
            <div class="action-box">
              @if (currentCartItem(); as item) {
                <div class="cart-controls">
                  <button class="btn-round" (click)="decreaseQty(item)">−</button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button
                    class="btn-round"
                    (click)="increaseQty(item)"
                    [disabled]="item.quantity >= getStock()"
                  >
                    +
                  </button>
                  <span class="in-cart-note">Item in your cart</span>
                </div>
              } @else {
                <button
                  class="btn-cart"
                  [disabled]="getStock() === 0"
                  (click)="addToCart()"
                >
                  {{ getStock() === 0 ? 'Out of Stock' : 'Add to Cart' }}
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper {
      max-width: 1200px;
      margin: 20px auto;
      padding: 0 20px;
    }

    .back-link {
      background: none;
      border: none;
      color: #333;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 15px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .back-link:hover {
      color: #007bff;
    }

    .product-container {
      display: flex;
      flex-wrap: wrap;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 30px;
      gap: 40px;
    }

    .product-image {
      flex: 1;
      min-width: 300px;
      text-align: center;
    }

    .product-image img {
      max-width: 100%;
      max-height: 450px;
      border-radius: 8px;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    .product-image img:hover {
      transform: scale(1.03);
    }

    .product-details {
      flex: 1.2;
      min-width: 300px;
      display: flex;
      flex-direction: column;
    }

    .product-details h2 {
      margin: 0;
      font-size: 28px;
      color: #222;
      font-weight: 600;
    }

    .category-badge {
      display: inline-block;
      margin-top: 8px;
      font-size: 13px;
      background: #f0f0f0;
      color: #666;
      padding: 3px 10px;
      border-radius: 12px;
      width: fit-content;
    }

    .price-section {
      margin: 20px 0;
      display: flex;
      align-items: center;
    }

    .price {
      font-size: 28px;
      font-weight: bold;
      color: #e53935;
    }

    .old-price {
      font-size: 18px;
      color: #888;
      text-decoration: line-through;
      margin-left: 12px;
    }

    .offer-badge {
      display: inline-block;
      background-color: #ffcc00;
      color: #333;
      font-size: 13px;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 6px;
      margin-left: 12px;
    }

    .description {
      font-size: 15px;
      color: #444;
      line-height: 1.6;
      margin: 15px 0 25px;
    }

    .stock-alert {
      color: #d32f2f;
      font-size: 14px;
      font-weight: bold;
      background-color: #ffebee;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 25px;
      display: inline-block;
    }

    .stock-ok {
      color: #2e7d32;
      font-size: 14px;
      font-weight: bold;
      background-color: #e8f5e9;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 25px;
      display: inline-block;
    }

    .action-box {
      margin-top: auto;
    }

    .btn-cart {
      display: inline-block;
      padding: 14px 32px;
      background-color: #111;
      color: #fff;
      font-weight: bold;
      font-size: 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .btn-cart:hover:not(:disabled) {
      background-color: #333;
      transform: scale(1.02);
    }

    .btn-cart:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .cart-controls {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .btn-round {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: none;
      background-color: #111;
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-round:hover:not(:disabled) {
      background-color: #333;
    }

    .btn-round:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .quantity {
      font-size: 18px;
      font-weight: bold;
      color: #222;
      min-width: 24px;
      text-align: center;
    }

    .in-cart-note {
      font-size: 13px;
      color: #2e7d32;
      font-weight: bold;
      margin-left: 10px;
    }

    .loading {
      text-align: center;
      padding: 80px 20px;
      font-size: 18px;
      color: #666;
    }

    @media (max-width: 768px) {
      .product-container {
        flex-direction: column;
        padding: 20px;
      }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  product = signal<Product | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (p) => {
          this.product.set(p);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  getStock(): number {
    const p = this.product();
    return p ? (p.stockQuantity ?? p.quantity ?? 0) : 0;
  }

  currentCartItem(): CartItem | undefined {
    const p = this.product();
    if (!p) return undefined;
    return this.cartService.cartItems().find((item) => item.product?.id === p.id);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/product/${p.id}` } });
      return;
    }

    this.cartService.addToCart(p, user, 1).subscribe({
      error: (err) => alert(err.error || 'Failed to add item')
    });
  }

  increaseQty(item: CartItem): void {
    if (item.quantity >= this.getStock()) return;
    this.cartService.updateQuantity(item.id!, item.quantity + 1).subscribe();
  }

  decreaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.id!, item.quantity - 1).subscribe();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
