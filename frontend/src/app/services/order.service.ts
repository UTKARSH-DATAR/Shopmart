import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { Order } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);

  /**
   * Place an order (triggers stock deduction and clears user cart in backend)
   * Calls POST http://localhost:8080/api/orders/place
   */
  placeOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${API_ENDPOINTS.orders}/place`, order);
  }

  /**
   * Get order history for a specific customer
   * Calls GET http://localhost:8080/api/orders/user/{userId}
   */
  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_ENDPOINTS.orders}/user/${userId}`);
  }

  /**
   * Get receipt / tracking details for a single order
   * Calls GET http://localhost:8080/api/orders/{id}
   */
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${API_ENDPOINTS.orders}/${orderId}`);
  }

  /**
   * Admin: View all orders across all customers
   * Calls GET http://localhost:8080/api/orders
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(API_ENDPOINTS.orders);
  }

  /**
   * Update order status (PLACED, PROCESSING, SHIPPED, DELIVERED, Cancelled)
   * Calls PUT http://localhost:8080/api/orders/{id}/status?status=...
   */
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${API_ENDPOINTS.orders}/${orderId}/status`, null, {
      params: { status }
    });
  }

  /**
   * Cancel an order (triggers automatic backend inventory restocking!)
   */
  cancelOrder(orderId: number): Observable<Order> {
    return this.updateOrderStatus(orderId, 'Cancelled');
  }
}
