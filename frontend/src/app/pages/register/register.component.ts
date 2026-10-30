import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="userform">
      <h1>Register New User</h1>

      @if (errorMessage()) {
        <div class="error-message">{{ errorMessage() }}</div>
      }
      @if (successMessage()) {
        <div class="success-message">{{ successMessage() }}</div>
      }

      <form (ngSubmit)="onRegister()">
        <label>Name :</label>
        <input
          type="text"
          name="name"
          [(ngModel)]="name"
          placeholder="Enter your name"
          required
        />

        <label>Contact :</label>
        <input
          type="text"
          name="contact"
          [(ngModel)]="contact"
          placeholder="Enter your contact number"
          required
        />

        <label>Username :</label>
        <input
          type="text"
          name="username"
          [(ngModel)]="username"
          placeholder="Enter username"
          maxlength="20"
          required
        />

        <label>Email :</label>
        <input
          type="email"
          name="email"
          [(ngModel)]="email"
          placeholder="Enter email address"
          required
        />

        <label>Password :</label>
        <input
          type="password"
          name="password"
          [(ngModel)]="password"
          placeholder="Enter strong password (min 6 chars)"
          minlength="6"
          maxlength="20"
          required
        />

        <input
          type="submit"
          [value]="submitting() ? 'Registering...' : 'Register'"
          [disabled]="submitting()"
        />
      </form>

      <a routerLink="/login">Already registered? Sign in here</a>
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
    .userform input[type="email"],
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

    .userform input:focus {
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

    .success-message {
      color: #2e7d32;
      text-align: center;
      margin-bottom: 15px;
      font-size: 14px;
      font-weight: bold;
      background: #e8f5e9;
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
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  contact = '';
  username = '';
  email = '';
  password = '';

  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  submitting = signal<boolean>(false);

  onRegister(): void {
    if (!this.name || !this.username || !this.email || !this.password) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.authService.register({
      name: this.name,
      contact: this.contact,
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Account created successfully! Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error || 'Registration failed. Try a different username/email.');
      }
    });
  }
}
