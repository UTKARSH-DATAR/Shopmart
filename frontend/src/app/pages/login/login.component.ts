import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, CartService } from '../../services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="userform">
      <h1>Sign In</h1>

      @if (errorMessage()) {
        <div class="error-message">{{ errorMessage() }}</div>
      }

      <form (ngSubmit)="onLogin()">
        <label>Username or Email :</label>
        <input
          type="text"
          name="identifier"
          [(ngModel)]="identifier"
          placeholder="Enter username or email"
          required
        />

        <label>Password :</label>
        <input
          type="password"
          name="password"
          [(ngModel)]="password"
          placeholder="Enter password"
          required
        />

        <input
          type="submit"
          [value]="submitting() ? 'Signing In...' : 'Sign In'"
          [disabled]="submitting()"
        />
      </form>

      <a routerLink="/register">New to Shopmart? Register here</a>
    </div>
  `,
  styles: [`
    .userform {
      background: #ffffff;
      width: 425px;
      max-width: 90%;
      padding: 30px 35px;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      margin: 60px auto;
      text-align: left;
      transition: transform 0.3s ease;
      box-sizing: border-box;
    }

    .userform:hover {
      transform: translateY(-5px);
    }

    .userform h1 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 25px;
      font-size: 26px;
      font-weight: 600;
    }

    .userform label {
      display: block;
      margin-bottom: 6px;
      font-weight: bold;
      color: #444;
      font-size: 14px;
    }

    .userform input[type="text"],
    .userform input[type="password"] {
      width: 100%;
      padding: 12px;
      margin-bottom: 18px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      box-sizing: border-box;
    }

    .userform input[type="text"]:focus,
    .userform input[type="password"]:focus {
      border-color: #2c3e50;
      box-shadow: 0 0 6px rgba(44, 62, 80, 0.3);
      outline: none;
    }

    .userform input[type="submit"] {
      width: 100%;
      padding: 14px;
      background: #111;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s ease, transform 0.2s ease;
      box-sizing: border-box;
    }

    .userform input[type="submit"]:hover:not(:disabled) {
      background: #333;
      transform: scale(1.02);
    }

    .userform input[type="submit"]:disabled {
      background: #888;
      cursor: not-allowed;
    }

    .error-message {
      color: #d32f2f;
      text-align: center;
      margin-bottom: 15px;
      font-size: 14px;
      font-weight: bold;
      background: #ffebee;
      padding: 8px;
      border-radius: 6px;
    }

    .userform a {
      display: block;
      text-align: center;
      margin-top: 20px;
      color: #2c3e50;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }

    .userform a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .userform {
        margin: 40px 15px;
        padding: 20px;
      }
      .userform h1 { font-size: 22px; }
      .userform input[type="submit"] { font-size: 15px; padding: 12px; }
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  identifier = '';
  password = '';
  errorMessage = signal<string>('');
  submitting = signal<boolean>(false);

  onLogin(): void {
    if (!this.identifier.trim() || !this.password) {
      this.errorMessage.set('Please enter both username/email and password.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.authService.login({
      username: this.identifier.trim(),
      password: this.password
    }).subscribe({
      next: (user) => {
        this.submitting.set(false);
        // Load active cart for badge counter
        if (user.id) {
          this.cartService.loadCart(user.id).subscribe();
        }

        // Redirect to intended destination or admin/home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error || 'Invalid username or password!');
      }
    });
  }
}
