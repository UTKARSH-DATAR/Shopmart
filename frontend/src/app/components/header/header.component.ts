import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, CartService } from '../../services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <header class="header">
      <div class="header-left">
        <h1 id="logo" (click)="navigateHome()">SHOPMART</h1>
        <i>we deliver disappointment faster!</i>
      </div>

      <!-- Search bar matching e-commerce experience -->
      <div class="header-search">
        <input
          type="text"
          placeholder="Search products..."
          [(ngModel)]="searchQuery"
          (keyup.enter)="onSearch()"
        />
        <button type="button" (click)="onSearch()">🔍</button>
      </div>

      <div class="header-right">
        @if (authService.isLoggedIn()) {
          <span class="user-greeting">
            Welcome, {{ authService.currentUser()?.name || authService.currentUser()?.username }}
          </span>
          <a routerLink="/cart" class="cart-link">
            🛒 Cart
            @if (cartService.cartCount() > 0) {
              <span class="badge">{{ cartService.cartCount() }}</span>
            }
          </a>
        } @else {
          <a routerLink="/login">Sign in</a>
          <a routerLink="/">All products</a>
        }

        <!-- Hamburger Icon for sidebar -->
        <span class="hamburger" (click)="toggleSidebar(true)">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 18H20" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 12H20" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 6H20" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </div>
    </header>

    <!-- Slide-out Sidebar from Flopkart -->
    <div id="mySidebar" class="sidebar" [style.width]="sidebarOpen() ? '260px' : '0'">
      <span class="closebtn" (click)="toggleSidebar(false)">&times;</span>
      
      @if (authService.isAdmin()) {
        <a routerLink="/admin" (click)="toggleSidebar(false)">👑 Admin Home</a>
        <a routerLink="/" (click)="toggleSidebar(false)">🛍️ All Products</a>
        <a href="javascript:void(0)" (click)="logout()">🚪 Logout</a>
      } @else if (authService.isLoggedIn()) {
        <a routerLink="/cart" (click)="toggleSidebar(false)">
          🛒 Cart ({{ cartService.cartCount() }})
        </a>
        <a routerLink="/orders" (click)="toggleSidebar(false)">📦 Orders</a>
        <a routerLink="/addresses" (click)="toggleSidebar(false)">📍 Addresses</a>
        <a routerLink="/" (click)="toggleSidebar(false)">🛍️ All Products</a>
        <a href="javascript:void(0)" (click)="logout()">🚪 Logout</a>
      } @else {
        <a routerLink="/" (click)="toggleSidebar(false)">🛍️ All Products</a>
        <a routerLink="/login" (click)="toggleSidebar(false)">🔑 Sign in</a>
        <a routerLink="/register" (click)="toggleSidebar(false)">📝 Register</a>
      }
    </div>

    <!-- Backdrop when sidebar is open -->
    @if (sidebarOpen()) {
      <div class="sidebar-backdrop" (click)="toggleSidebar(false)"></div>
    }
  `,
  styles: [`
    .header {
      background-color: #111;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 15px;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 60px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      box-sizing: border-box;
      flex-wrap: nowrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    #logo {
      margin: 0;
      font-size: 1.4rem;
      font-weight: bold;
      color: white;
      letter-spacing: 1px;
      cursor: pointer;
    }

    .header-left i {
      font-size: 0.85rem;
      color: #BBB;
      font-style: normal;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-search {
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 400px;
      margin: 0 15px;
    }

    .header-search input {
      width: 100%;
      padding: 8px 12px;
      border: none;
      border-radius: 4px 0 0 4px;
      font-size: 14px;
      outline: none;
    }

    .header-search button {
      background: #ffcc00;
      border: none;
      padding: 8px 12px;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      font-size: 14px;
    }

    .header-right {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .header-right a, .header-right span {
      margin-left: 12px;
      color: white;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.2s ease;
    }

    .header-right a:hover {
      color: #ffcc00;
    }

    .cart-link {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .badge {
      background-color: #ffcc00;
      color: #111;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .hamburger {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: 14px;
      flex-shrink: 0;
    }

    .hamburger svg {
      width: 24px;
      height: 24px;
      stroke: white;
      transition: stroke 0.2s ease;
    }

    .hamburger:hover svg {
      stroke: #ffcc00;
    }

    .sidebar {
      height: 100%;
      width: 0;
      position: fixed;
      top: 0;
      right: 0;
      background-color: #111;
      overflow-x: hidden;
      transition: width 0.3s ease;
      padding-top: 70px;
      z-index: 2000;
      box-shadow: -2px 0 8px rgba(0,0,0,0.4);
    }

    .sidebar a {
      padding: 14px 20px;
      text-decoration: none;
      font-size: 1rem;
      color: #eee;
      display: block;
      transition: background-color 0.2s, padding-left 0.2s;
    }

    .sidebar a:hover {
      background-color: #333;
      padding-left: 28px;
    }

    .sidebar .closebtn {
      position: absolute;
      top: 20px;
      right: 25px;
      font-size: 2rem;
      color: #fff;
      cursor: pointer;
    }

    .sidebar-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.4);
      z-index: 1500;
    }

    @media (max-width: 768px) {
      .header-left i { display: none; }
      .header-search { max-width: 200px; margin: 0 8px; }
      .user-greeting { display: none; }
    }

    @media (max-width: 480px) {
      .header-search { display: none; }
      #logo { font-size: 1.1rem; }
    }
  `]
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  sidebarOpen = signal(false);
  searchQuery = '';

  constructor() {
    // If user is logged in, preload their active cart to populate badge
    const user = this.authService.currentUser();
    if (user?.id) {
      this.cartService.loadCart(user.id).subscribe();
    }
  }

  toggleSidebar(open: boolean): void {
    this.sidebarOpen.set(open);
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/'], { queryParams: { q } });
    } else {
      this.router.navigate(['/']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.toggleSidebar(false);
    this.router.navigate(['/login']);
  }
}
