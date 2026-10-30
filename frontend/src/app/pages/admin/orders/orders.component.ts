import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services';
import { Order } from '../../../models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="orders-container">
      <div class="top-bar">
        <h1>All Customer Orders</h1>
        <a routerLink="/admin" class="btn-back">← Back to Dashboard</a>
      </div>

      @if (loading()) {
        <p class="status-msg">Loading customer orders...</p>
      } @else if (orders().length === 0) {
        <p class="status-msg">No customer orders found.</p>
      } @else {
        <!-- Orders list matching Flopkart viewallorders.jsp -->
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <div class="order-card">
              <div class="order-header">
                <div class="order-number">
                  {{ order.orderNumber || ('Order #' + order.id) }}
                  <span class="user-badge">User: {{ order.user?.username || 'Customer' }}</span>
                </div>
                <div class="order-status" [ngClass]="order.status || 'Placed'">
                  {{ order.status || 'Placed' }}
                </div>
              </div>

              <div class="order-details">
                <div><strong>Date:</strong> {{ order.orderDate | date:'medium' }}</div>
                <div><strong>Amount:</strong> ₹{{ order.totalAmount }}</div>
                <div><strong>Items Count:</strong> {{ order.items.length || 0 }} items</div>
                <div>
                  <strong>Address:</strong>
                  {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }}
                </div>
              </div>

              <div class="order-actions">
                <span class="status-label">Update Status:</span>
                <select
                  [ngModel]="order.status"
                  (ngModelChange)="updateStatus(order.id!, $event)"
                >
                  <option value="Placed">Placed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button class="btn view-btn" (click)="viewOrder(order.id!)">
                  📄 View Receipt
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-container {
      max-width: 1100px;
      margin: 20px auto;
      padding: 20px;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .top-bar h1 {
      margin: 0;
      font-size: 26px;
      color: #333;
    }

    .btn-back {
      padding: 8px 16px;
      background: #eee;
      color: #333;
      border-radius: 6px;
      font-size: 14px;
      text-decoration: none;
      font-weight: 500;
    }

    .btn-back:hover {
      background: #ddd;
    }

    .order-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      padding: 18px;
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
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-badge {
      font-size: 12px;
      font-weight: normal;
      background: #eee;
      padding: 2px 8px;
      border-radius: 12px;
      color: #555;
    }

    .order-status {
      font-size: 12px;
      font-weight: bold;
      padding: 5px 12px;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .order-status.Placed, .order-status.PLACED {
      background-color: #e7f1ff;
      color: #0056b3;
    }

    .order-status.Shipped, .order-status.SHIPPED, .order-status.PROCESSING {
      background-color: #fff3cd;
      color: #856404;
    }

    .order-status.Delivered, .order-status.DELIVERED {
      background-color: #d4edda;
      color: #155724;
    }

    .order-status.Cancelled, .order-status.CANCELLED {
      background-color: #f8d7da;
      color: #721c24;
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
      border-top: 1px solid #eee;
      padding-top: 12px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
    }

    .status-label {
      font-size: 13px;
      font-weight: 500;
      color: #666;
    }

    select {
      padding: 6px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 13px;
      font-family: inherit;
      background: #fff;
    }

    .btn {
      padding: 7px 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }

    .view-btn {
      background: #007bff;
      color: #fff;
    }

    .view-btn:hover {
      background: #0056b3;
    }

    .status-msg {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (list) => {
        this.orders.set(list || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updated) => {
        this.orders.update((list) =>
          list.map((o) => (o.id === orderId ? updated : o))
        );
      },
      error: (err) => alert(err.error || 'Failed to update order status')
    });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/order', orderId], { queryParams: { from: 'admin' } });
  }
}
