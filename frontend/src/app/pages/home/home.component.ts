import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CartService, ProductService } from '../../services';
import { Product, CartItem } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Category filter pills -->
    <div class="category-bar">
      <button
        class="cat-pill"
        [class.active]="selectedCategory() === ''"
        (click)="filterCategory('')"
      >
        All Products
      </button>
      @for (cat of categories; track cat) {
        <button
          class="cat-pill"
          [class.active]="selectedCategory() === cat"
          (click)="filterCategory(cat)"
        >
          {{ cat }}
        </button>
      }
    </div>

    <!-- Active search banner if search query is active -->
    @if (currentQuery()) {
      <div class="search-banner">
        Showing results for "<strong>{{ currentQuery() }}</strong>"
        <button class="clear-search" (click)="clearSearch()">Clear search</button>
      </div>
    }

    <!-- Loading state -->
    @if (loading()) {
      <div class="empty-state">
        <p>Loading products...</p>
      </div>
    } @else if (products().length === 0) {
      <div class="empty-state">
        <p>No products found matching your selection.</p>
      </div>
    } @else {
      <!-- Product Grid matching Flopkart home.jsp -->
      <div class="container">
        @for (product of products(); track product.id) {
          <div class="product-card">
            <!-- Stock badge from Flopkart -->
            @if (getStock(product) === 0) {
              <span class="stock-badge">Out of Stock</span>
            } @else if (getStock(product) <= 5) {
              <span class="stock-badge low">Hurry! Only {{ getStock(product) }} left!</span>
            }

            <div class="img-wrapper" (click)="viewDetails(product.id!)">
              <img
                [src]="product.imageUrl || product.imgurl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'"
                [alt]="product.name"
                loading="lazy"
              />
            </div>

            <div class="card-info" (click)="viewDetails(product.id!)">
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              
              <div class="price-section">
                <span class="price">₹{{ product.price }}</span>
                <span class="old-price">₹{{ (product.price * 1.25).toFixed(0) }}</span>
                <span class="offer-badge">20% OFF</span>
              </div>
            </div>

            <!-- Cart Controls matching Flopkart home.jsp -->
            <div class="card-action">
              @if (getCartItem(product.id!); as item) {
                <div class="cart-controls">
                  <button class="btn-round" (click)="decreaseQty(item)">−</button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button
                    class="btn-round"
                    (click)="increaseQty(item, product)"
                    [disabled]="item.quantity >= getStock(product)"
                  >
                    +
                  </button>
                </div>
              } @else {
                <button
                  class="btn-cart"
                  [disabled]="getStock(product) === 0"
                  (click)="addToCart(product)"
                >
                  {{ getStock(product) === 0 ? 'Out of Stock' : 'Add to Cart' }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .category-bar {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 15px 20px 5px;
      max-width: 1200px;
      margin: 0 auto;
      scrollbar-width: none;
    }

    .category-bar::-webkit-scrollbar {
      display: none;
    }

    .cat-pill {
      background: #fff;
      border: 1px solid #ddd;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: #333;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .cat-pill:hover, .cat-pill.active {
      background: #111;
      color: #ffcc00;
      border-color: #111;
    }

    .search-banner {
      max-width: 1200px;
      margin: 10px auto;
      padding: 10px 20px;
      background: #fff;
      border-radius: 6px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .clear-search {
      background: none;
      border: none;
      color: #d32f2f;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
    }

    .container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      padding: 20px;
      max-width: 1200px;
      margin: auto;
    }

    .product-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 15px;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .img-wrapper {
      cursor: pointer;
      overflow: hidden;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .product-card img {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      border-radius: 6px;
      transition: transform 0.3s ease;
    }

    .product-card:hover img {
      transform: scale(1.05);
    }

    .card-info {
      cursor: pointer;
      text-align: left;
    }

    .product-card h3 {
      margin: 10px 0 5px;
      font-size: 16px;
      font-weight: 600;
      color: #222;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 44px;
    }

    .product-card p {
      margin: 5px 0;
      color: #666;
      font-size: 13px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
    }

    .price-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 10px 0;
    }

    .price {
      font-size: 20px;
      font-weight: bold;
      color: #d32f2f;
    }

    .old-price {
      font-size: 14px;
      color: #888;
      text-decoration: line-through;
    }

    .offer-badge {
      display: inline-block;
      background-color: #ffcc00;
      color: #333;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .stock-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #d32f2f;
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
      z-index: 2;
    }

    .stock-badge.low {
      background: #e67e22;
    }

    .btn-cart {
      display: block;
      width: 100%;
      margin-top: 10px;
      padding: 10px 15px;
      background-color: #111;
      color: #fff;
      font-weight: bold;
      border: none;
      border-radius: 4px;
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
      justify-content: center;
      gap: 12px;
      margin-top: 10px;
    }

    .btn-round {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: none;
      background-color: #111;
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .btn-round:hover:not(:disabled) {
      background-color: #333;
      transform: scale(1.08);
    }

    .btn-round:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .quantity {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      min-width: 20px;
      text-align: center;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #777;
      font-size: 16px;
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  currentQuery = signal<string>('');
  selectedCategory = signal<string>('');

  categories = ['Electronics', 'Mobiles', 'Fashion', 'Appliances', 'Books', 'Other'];

  ngOnInit(): void {
    // Listen to query parameters from header search or URL
    this.route.queryParams.subscribe((params) => {
      const q = params['q'] || '';
      this.currentQuery.set(q);
      if (q) {
        this.loadSearch(q);
      } else if (this.selectedCategory()) {
        this.loadByCategory(this.selectedCategory());
      } else {
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.loading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (list) => {
        this.products.set(list || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadSearch(query: string): void {
    this.loading.set(true);
    this.productService.searchProducts(query).subscribe({
      next: (list) => {
        this.products.set(list || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadByCategory(category: string): void {
    this.loading.set(true);
    this.productService.getProductsByCategory(category).subscribe({
      next: (list) => {
        this.products.set(list || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterCategory(category: string): void {
    this.selectedCategory.set(category);
    this.currentQuery.set('');
    if (category) {
      this.loadByCategory(category);
    } else {
      this.loadAll();
    }
  }

  clearSearch(): void {
    this.router.navigate(['/']);
  }

  viewDetails(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  getStock(product: Product): number {
    return product.stockQuantity ?? product.quantity ?? 0;
  }

  getCartItem(productId: number): CartItem | undefined {
    return this.cartService.cartItems().find((item) => item.product?.id === productId);
  }

  addToCart(product: Product): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }
    this.cartService.addToCart(product, user, 1).subscribe({
      error: (err) => alert(err.error || 'Failed to add item to cart')
    });
  }

  increaseQty(item: CartItem, product: Product): void {
    if (item.quantity >= this.getStock(product)) return;
    this.cartService.updateQuantity(item.id!, item.quantity + 1).subscribe({
      error: (err) => alert(err.error || 'Failed to update quantity')
    });
  }

  decreaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.id!, item.quantity - 1).subscribe({
      error: (err) => alert(err.error || 'Failed to update quantity')
    });
  }
}
