import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, OrderService } from '../../services';
import { Order } from '../../models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="orders-container">
      <h1>My Orders</h1>

      @if (loading()) {
        <p class="status-msg">Loading your order history...</p>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <p>You haven't placed any orders yet.</p>
          <a routerLink="/" class="btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <div class="order-card">
              <div class="order-header">
                <div class="order-number">
                  {{ order.orderNumber || ('Order #' + order.id) }}
                </div>
                <div class="order-status" [ngClass]="order.status || 'Placed'">
                  {{ order.status || 'Placed' }}
                </div>
              </div>

              <div class="order-details">
                <div>
                  <strong>Order Date:</strong> {{ order.orderDate | date:'mediumDate' }}
                </div>
                <div>
                  <strong>Total Amount:</strong> ₹{{ order.totalAmount }}
                </div>
                <div>
                  <strong>Payment Card:</strong> {{ order.cardNumber || 'Paid Online' }}
                </div>
                <div>
                  <strong>Delivered To:</strong>
                  {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }}
                </div>
              </div>

              <div class="order-actions">
                <button class="view-btn" (click)="viewOrder(order.id!)">
                  📄 View Receipt
                </button>
                @if (canCancel(order)) {
                  <button class="cancel-btn" (click)="cancelOrder(order.id!)">
                    ❌ Cancel Order
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
    .orders-container {
      max-width: 950px;
      margin: 20px auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 25px;
      color: #333;
      font-size: 26px;
    }

    .order-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      padding: 18px;
      transition: transform 0.2s ease;
    }

    .order-card:hover {
      transform: translateY(-2px);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 12px;
      margin-bottom: 15px;
    }

    .order-number {
      font-weight: bold;
      font-size: 18px;
      color: #333;
    }

    .order-status {
      font-size: 12px;
      font-weight: bold;
      padding: 5px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      display: inline-block;
    }

    .order-status.Placed, .order-status.PLACED {
      background-color: #e7f1ff;
      color: #0056b3;
      border: 1px solid #b3d4ff;
    }

    .order-status.Cancelled, .order-status.CANCELLED {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .order-status.Delivered, .order-status.DELIVERED {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .order-status.Shipped, .order-status.SHIPPED, .order-status.PROCESSING {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }

    .order-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      font-size: 14px;
      color: #555;
    }

    .order-actions {
      margin-top: 15px;
      text-align: right;
    }

    .view-btn, .cancel-btn {
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s ease;
      margin-left: 8px;
    }

    .view-btn {
      background: #111;
      color: #fff;
    }

    .view-btn:hover {
      background: #333;
    }

    .cancel-btn {
      background: #dc3545;
      color: #fff;
    }

    .cancel-btn:hover {
      background: #c82333;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #fff;
      border-radius: 8px;
    }

    .btn-primary {
      display: inline-block;
      margin-top: 15px;
      padding: 10px 20px;
      background: #111;
      color: #fff;
      border-radius: 6px;
      font-weight: bold;
    }

    .status-msg {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    @media (max-width: 600px) {
      .order-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user?.id) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/orders' } });
      return;
    }

    this.orderService.getUserOrders(user.id).subscribe({
      next: (list) => {
        this.orders.set(list || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  canCancel(order: Order): boolean {
    const s = (order.status || '').toLowerCase();
    return s !== 'cancelled' && s !== 'delivered';
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/order', orderId]);
  }

  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this order? Items will be restocked.')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: (updated) => {
          this.orders.update((list) =>
            list.map((o) => (o.id === orderId ? updated : o))
          );
        },
        error: (err) => alert(err.error || 'Failed to cancel order')
      });
    }
  }
}
