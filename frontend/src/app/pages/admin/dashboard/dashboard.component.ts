import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Welcome Admin</h1>
      <h3>Select your operation</h3>

      <div class="btn-container">
        <a routerLink="/admin/add-product" class="btn-link">
          <button class="btn">➕ Add Product</button>
        </a>
        <a routerLink="/admin/products" class="btn-link">
          <button class="btn">📦 View Products</button>
        </a>
        <a routerLink="/admin/orders" class="btn-link">
          <button class="btn">📑 View All Orders</button>
        </a>
        <a routerLink="/admin/users" class="btn-link">
          <button class="btn">👥 View Users</button>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .container {
      background-color: #fff;
      width: 420px;
      max-width: 90%;
      padding: 35px 30px;
      margin: 60px auto;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      text-align: center;
      box-sizing: border-box;
    }

    h1 {
      color: #111;
      font-size: 26px;
      margin-bottom: 8px;
      font-weight: 600;
    }

    h3 {
      color: #666;
      margin-bottom: 25px;
      font-size: 15px;
      font-weight: 500;
    }

    .btn-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .btn-link {
      text-decoration: none;
      width: 100%;
    }

    .btn {
      padding: 14px 20px;
      font-size: 15px;
      background-color: #222;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
      width: 100%;
      font-weight: bold;
      box-sizing: border-box;
    }

    .btn:hover {
      background-color: #444;
      transform: scale(1.02);
    }
  `]
})
export class AdminDashboardComponent {
  readonly authService = inject(AuthService);
}
