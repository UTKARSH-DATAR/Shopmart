import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, CartService } from '../../services';
import { CartItem } from '../../models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-container">
      <h1>Shopping Cart</h1>

      @if (cartService.cartItems().length === 0) {
        <div class="empty-cart">
          <p class="empty-msg">Your cart is empty!</p>
          <p class="sub-msg">Explore our wide selection of products and add them to your cart.</p>
          <a routerLink="/" class="btn-shop">🛍️ Start Shopping</a>
        </div>
      } @else {
        <div class="cart-layout">
          <!-- Items list matching Flopkart cart.jsp -->
          <div class="cart-items">
            @for (item of cartService.cartItems(); track item.id) {
              <div class="cart-item">
                <img
                  [src]="item.product.imageUrl || item.product.imgurl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'"
                  [alt]="item.product.name"
                  (click)="viewProduct(item.product.id!)"
                />

                <div class="item-details">
                  <h3 (click)="viewProduct(item.product.id!)">{{ item.product.name }}</h3>
                  <p class="unit-price">Price: ₹{{ item.product.price }}</p>

                  <div class="cart-controls">
                    <button class="btn-round" (click)="decreaseQty(item)">−</button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button
                      class="btn-round"
                      (click)="increaseQty(item)"
                      [disabled]="item.quantity >= item.product.stockQuantity"
                    >
                      +
                    </button>
                    <button class="btn-remove" (click)="removeItem(item)">🗑️ Remove</button>
                  </div>
                </div>

                <div class="item-price">
                  ₹{{ item.product.price * item.quantity }}
                </div>
              </div>
            }
          </div>

          <!-- Order Summary Card -->
          <div class="summary-card">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Items Total ({{ cartService.cartCount() }} items):</span>
              <span>₹{{ cartService.cartTotal() }}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Charges:</span>
              <span class="free-text">FREE</span>
            </div>
            <hr />
            <div class="summary-row total-row">
              <span>Total Payable:</span>
              <span>₹{{ cartService.cartTotal() }}</span>
            </div>

            <button class="btn-checkout" (click)="proceedToCheckout()">
              Proceed to Checkout ➔
            </button>

            <button class="btn-clear" (click)="clearCart()">
              Clear Cart
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1100px;
      margin: auto;
      padding: 20px;
      box-sizing: border-box;
    }

    h1 {
      text-align: center;
      margin-bottom: 25px;
      color: #222;
      font-size: 28px;
      font-weight: 600;
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 25px;
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 90px 1fr 110px;
      gap: 16px;
      align-items: center;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 14px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .cart-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .cart-item img {
      width: 90px;
      height: 90px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #eee;
      cursor: pointer;
    }

    .item-details h3 {
      margin: 0;
      font-size: 16px;
      color: #222;
      font-weight: 600;
      cursor: pointer;
    }

    .item-details h3:hover {
      color: #007bff;
    }

    .unit-price {
      margin: 4px 0;
      color: #666;
      font-size: 13px;
    }

    .cart-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }

    .btn-round {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background-color: #111;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
    }

    .btn-round:hover:not(:disabled) {
      background-color: #333;
    }

    .btn-round:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .quantity {
      font-size: 15px;
      font-weight: bold;
      min-width: 20px;
      text-align: center;
    }

    .btn-remove {
      background: none;
      border: none;
      color: #d32f2f;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      margin-left: 8px;
    }

    .btn-remove:hover {
      text-decoration: underline;
    }

    .item-price {
      font-size: 18px;
      font-weight: bold;
      color: #d32f2f;
      text-align: right;
    }

    .summary-card {
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .summary-card h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
      color: #555;
    }

    .free-text {
      color: #2e7d32;
      font-weight: bold;
    }

    .total-row {
      font-size: 18px;
      font-weight: bold;
      color: #222;
      margin-top: 15px;
    }

    .btn-checkout {
      display: block;
      width: 100%;
      margin-top: 20px;
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

    .btn-checkout:hover {
      background: #218838;
    }

    .btn-clear {
      display: block;
      width: 100%;
      margin-top: 10px;
      padding: 8px;
      background: none;
      border: 1px solid #ccc;
      border-radius: 6px;
      color: #666;
      font-size: 13px;
      cursor: pointer;
    }

    .btn-clear:hover {
      background: #f5f5f5;
    }

    .empty-cart {
      text-align: center;
      padding: 80px 20px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .empty-msg {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .sub-msg {
      color: #666;
      margin: 10px 0 25px;
    }

    .btn-shop {
      display: inline-block;
      padding: 12px 24px;
      background: #111;
      color: #fff;
      border-radius: 6px;
      font-weight: bold;
      text-decoration: none;
    }

    .btn-shop:hover {
      background: #333;
    }

    @media (max-width: 768px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.cartService.loadCart(user.id).subscribe();
    }
  }

  viewProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }

  increaseQty(item: CartItem): void {
    const stock = item.product.stockQuantity ?? item.product.quantity ?? 0;
    if (item.quantity >= stock) return;
    this.cartService.updateQuantity(item.id!, item.quantity + 1).subscribe();
  }

  decreaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.id!, item.quantity - 1).subscribe();
  }

  removeItem(item: CartItem): void {
    if (confirm(`Remove ${item.product.name} from your cart?`)) {
      this.cartService.removeFromCart(item.id!).subscribe();
    }
  }

  clearCart(): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    if (confirm('Are you sure you want to empty your cart?')) {
      this.cartService.clearCart(user.id).subscribe();
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
