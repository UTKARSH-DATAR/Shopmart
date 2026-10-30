import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, OrderService } from '../../services';
import { Order } from '../../models';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-container">
      <button class="back-btn" (click)="goBack()">
        {{ fromAdmin() ? '← Back to Customer Orders' : '← Back to My Orders' }}
      </button>

      @if (loading()) {
        <p class="status-msg">Loading order details...</p>
      } @else if (!order()) {
        <div class="status-msg">
          <p>Order not found.</p>
        </div>
      } @else {
        <!-- Success banner matching Flopkart vieworder.jsp -->
        @if (!fromAdmin() && isNewOrder()) {
          <div class="success-banner">
            🎉 Order Placed Successfully! Your items are being prepared for shipping.
          </div>
        }

        <div class="order-top">
          <div>
            <h1>{{ order()?.orderNumber || ('Order #' + order()?.id) }}</h1>
            <p class="order-date">
              Placed on {{ order()?.orderDate | date:'medium' }}
            </p>
          </div>
          <span class="status-badge" [ngClass]="order()?.status || 'Placed'">
            {{ order()?.status || 'Placed' }}
          </span>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>📍 Shipping Address</h3>
            <p><strong>{{ order()?.shippingAddress?.street }}</strong></p>
            @if (order()?.shippingAddress?.line2) {
              <p>{{ order()?.shippingAddress?.line2 }}</p>
            }
            <p>
              {{ order()?.shippingAddress?.city }},
              {{ order()?.shippingAddress?.state }} -
              {{ order()?.shippingAddress?.zipCode }}
            </p>
          </div>

          <div class="info-box">
            <h3>💳 Payment Method</h3>
            <p>Credit / Debit Card</p>
            <p>Card: {{ order()?.cardNumber || 'Paid Online' }}</p>
            <p class="paid-status">Status: Paid</p>
          </div>
        </div>

        <!-- Order Items matching Flopkart vieworder.jsp -->
        <div class="cart-container">
          <h2>Items in this Order</h2>
          <div class="items-list">
            @for (item of order()?.items; track item.id) {
              <div class="cart-item">
                <img
                  [src]="item.product.imageUrl || item.product.imgurl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'"
                  [alt]="item.product.name"
                />
                <div class="item-details">
                  <h3>{{ item.product.name }}</h3>
                  <p>Quantity: {{ item.quantity }}</p>
                  <p>Price: ₹{{ item.price }}</p>
                </div>
                <div class="item-price">
                  ₹{{ item.price * item.quantity }}
                </div>
              </div>
            }
          </div>

          <div class="grand-total">
            Total Paid: ₹{{ order()?.totalAmount }}
          </div>
        </div>

        @if (canCancel(order()!)) {
          <div class="cancel-section">
            <button class="btn-cancel" (click)="cancelOrder()">
              ❌ Cancel This Order
            </button>
            <p class="note">Cancelling this order will automatically restock the items.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .order-container {
      max-width: 950px;
      margin: 20px auto;
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .back-btn {
      background: none;
      border: none;
      color: #333;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 20px;
      padding: 0;
    }

    .back-btn:hover {
      color: #007bff;
    }

    .success-banner {
      background: #28a745;
      color: #fff;
      padding: 14px 20px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 25px;
      text-align: center;
    }

    .order-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .order-top h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .order-date {
      margin: 4px 0 0;
      font-size: 13px;
      color: #777;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-badge.Placed, .status-badge.PLACED {
      background: #e7f1ff;
      color: #0056b3;
    }

    .status-badge.Shipped, .status-badge.SHIPPED, .status-badge.PROCESSING {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.Delivered, .status-badge.DELIVERED {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.Cancelled, .status-badge.CANCELLED {
      background: #f8d7da;
      color: #721c24;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .info-box {
      background: #fafafa;
      border: 1px solid #eee;
      padding: 16px;
      border-radius: 6px;
    }

    .info-box h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      color: #333;
    }

    .info-box p {
      margin: 4px 0;
      font-size: 14px;
      color: #555;
    }

    .paid-status {
      color: #28a745;
      font-weight: bold;
    }

    .cart-container h2 {
      font-size: 20px;
      margin-bottom: 15px;
      color: #333;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 15px;
    }

    .cart-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
      margin-right: 20px;
    }

    .item-details {
      flex: 1;
    }

    .item-details h3 {
      margin: 0;
      font-size: 15px;
      color: #333;
    }

    .item-details p {
      margin: 4px 0;
      font-size: 13px;
      color: #666;
    }

    .item-price {
      font-size: 17px;
      font-weight: bold;
      color: #d32f2f;
    }

    .grand-total {
      text-align: right;
      font-size: 20px;
      font-weight: bold;
      margin-top: 20px;
      color: #222;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }

    .cancel-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
    }

    .btn-cancel {
      padding: 10px 24px;
      background: #dc3545;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
    }

    .btn-cancel:hover {
      background: #c82333;
    }

    .note {
      font-size: 12px;
      color: #777;
      margin-top: 6px;
    }

    .status-msg {
      text-align: center;
      padding: 60px;
      color: #666;
    }

    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrderDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);

  order = signal<Order | null>(null);
  loading = signal<boolean>(true);
  fromAdmin = signal<boolean>(false);
  isNewOrder = signal<boolean>(false);

  ngOnInit(): void {
    const from = this.route.snapshot.queryParamMap.get('from');
    if (from === 'admin' || this.authService.isAdmin()) {
      this.fromAdmin.set(true);
    }
    this.isNewOrder.set(this.route.snapshot.queryParamMap.get('new') === 'true');

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.orderService.getOrderById(id).subscribe({
        next: (o) => {
          this.order.set(o);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  canCancel(order: Order): boolean {
    const s = (order.status || '').toLowerCase();
    return s !== 'cancelled' && s !== 'delivered';
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o?.id) return;
    if (confirm('Cancel this order? Items will be restocked immediately.')) {
      this.orderService.cancelOrder(o.id).subscribe({
        next: (updated) => this.order.set(updated),
        error: (err) => alert(err.error || 'Failed to cancel order')
      });
    }
  }

  goBack(): void {
    if (this.fromAdmin()) {
      this.router.navigate(['/admin/orders']);
    } else {
      this.router.navigate(['/orders']);
    }
  }
}
