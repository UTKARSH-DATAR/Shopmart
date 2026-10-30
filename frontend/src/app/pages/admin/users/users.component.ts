import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services';
import { User } from '../../../models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="users-container">
      <div class="top-bar">
        <h1>All Registered Users</h1>
        <a routerLink="/admin" class="btn-back">← Back to Dashboard</a>
      </div>

      @if (loading()) {
        <p class="status-msg">Loading registered users...</p>
      } @else if (users().length === 0) {
        <p class="status-msg">No users found.</p>
      } @else {
        <!-- Table matching Flopkart viewusers.jsp -->
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr>
                <td>#{{ user.id }}</td>
                <td><strong>{{ user.name || '—' }}</strong></td>
                <td>{{ user.username }}</td>
                <td>{{ user.email || '—' }}</td>
                <td>{{ user.contact || '—' }}</td>
                <td>
                  <span class="role-badge" [class.admin]="user.role === 'ADMIN'">
                    {{ user.role || 'USER' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .users-container {
      width: 90%;
      max-width: 1000px;
      margin: 30px auto;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .top-bar h1 {
      margin: 0;
      color: #333;
      font-size: 26px;
    }

    .btn-back {
      padding: 8px 16px;
      background: #eee;
      color: #333;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
    }

    .btn-back:hover {
      background: #ddd;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    th, td {
      padding: 14px 16px;
      text-align: left;
    }

    th {
      background-color: #222;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #e9f3ff;
    }

    td {
      color: #555;
      font-size: 14px;
    }

    .role-badge {
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 12px;
      background: #e7f1ff;
      color: #0056b3;
    }

    .role-badge.admin {
      background: #ffecb3;
      color: #ff8f00;
    }

    .status-msg {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  private readonly authService = inject(AuthService);

  users = signal<User[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.authService.getAllUsers().subscribe({
      next: (list) => {
        this.users.set(list || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
