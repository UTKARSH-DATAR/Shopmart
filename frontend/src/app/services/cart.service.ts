import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { CartItem, Product, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);

  // Reactive state holding the items in the user's cart
  readonly cartItems = signal<CartItem[]>([]);

  // Computed badge counter for header: total quantity of all items in cart
  readonly cartCount = computed(() =>
    this.cartItems().reduce((total, item) => total + (item.quantity || 0), 0)
  );

  // Computed total monetary value of items currently in cart
  readonly cartTotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  /**
   * Load active shopping cart for a user
   * Calls GET http://localhost:8080/api/cart/user/{userId}
   */
  loadCart(userId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${API_ENDPOINTS.cart}/user/${userId}`).pipe(
      tap((items) => this.cartItems.set(items || []))
    );
  }

  /**
   * Add a product to cart (or increments quantity if already present)
   * Calls POST http://localhost:8080/api/cart/add
   */
  addToCart(product: Product, user: User, quantity = 1): Observable<CartItem> {
    const payload: CartItem = {
      product,
      user: { id: user.id, username: user.username },
      quantity
    };

    return this.http.post<CartItem>(`${API_ENDPOINTS.cart}/add`, payload).pipe(
      tap((savedItem) => {
        // Update local signal to instantly reflect badge counter
        this.cartItems.update((current) => {
          const index = current.findIndex((i) => i.id === savedItem.id);
          if (index > -1) {
            const updated = [...current];
            updated[index] = savedItem;
            return updated;
          }
          return [...current, savedItem];
        });
      })
    );
  }

  /**
   * Update item quantity (+ / -)
   * Calls PUT http://localhost:8080/api/cart/update/{id}?quantity=...
   */
  updateQuantity(cartItemId: number, quantity: number): Observable<CartItem | null> {
    return this.http
      .put<CartItem | null>(`${API_ENDPOINTS.cart}/update/${cartItemId}`, null, {
        params: { quantity: quantity.toString() }
      })
      .pipe(
        tap((updatedItem) => {
          if (!updatedItem) {
            // If quantity <= 0, item was deleted from backend
            this.cartItems.update((items) => items.filter((i) => i.id !== cartItemId));
          } else {
            this.cartItems.update((items) =>
              items.map((i) => (i.id === cartItemId ? updatedItem : i))
            );
          }
        })
      );
  }

  /**
   * Remove a single item from cart
   * Calls DELETE http://localhost:8080/api/cart/remove/{id}
   */
  removeFromCart(cartItemId: number): Observable<string> {
    return this.http
      .delete(`${API_ENDPOINTS.cart}/remove/${cartItemId}`, { responseType: 'text' })
      .pipe(
        tap(() => {
          this.cartItems.update((items) => items.filter((i) => i.id !== cartItemId));
        })
      );
  }

  /**
   * Empty entire cart for a user (e.g. after order checkout)
   * Calls DELETE http://localhost:8080/api/cart/clear/user/{userId}
   */
  clearCart(userId: number): Observable<string> {
    return this.http
      .delete(`${API_ENDPOINTS.cart}/clear/user/${userId}`, { responseType: 'text' })
      .pipe(
        tap(() => {
          this.cartItems.set([]);
        })
      );
  }
}
