import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { LoginRequest, User } from '../models';

const STORAGE_KEY = 'shopmart_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  // Reactive signal holding the currently authenticated user (null if guest)
  readonly currentUser = signal<User | null>(this.getStoredUser());

  // Computed state indicators
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'ADMIN' || user?.username === 'utkarsh_datar';
  });

  /**
   * Register a new customer
   * Calls POST http://localhost:8080/api/users/register
   */
  register(user: User): Observable<User> {
    return this.http.post<User>(`${API_ENDPOINTS.users}/register`, user);
  }

  /**
   * Login with username or email and password
   * Calls POST http://localhost:8080/api/users/login
   */
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${API_ENDPOINTS.users}/login`, credentials).pipe(
      tap((user) => {
        // Save user session in localStorage and update reactive signal
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  /**
   * Logout user and clear session storage
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  /**
   * Admin: View all registered users (replicates Flopkart ViewUsers servlet)
   * Calls GET http://localhost:8080/api/users
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(API_ENDPOINTS.users);
  }

  /**
   * Get user details by ID
   * Calls GET http://localhost:8080/api/users/{id}
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${API_ENDPOINTS.users}/${id}`);
  }

  /**
   * Helper to retrieve persisted user from browser storage
   */
  private getStoredUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
