import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AddressService, AuthService, CartService, OrderService } from '../../services';
import { Address, Order, OrderItem } from '../../models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="checkout-container">
      <h1>Checkout & Payment</h1>

      @if (cartService.cartItems().length === 0) {
        <div class="empty-state">
          <p>Your cart is empty. Nothing to checkout.</p>
          <a routerLink="/" class="btn-primary">Browse Products</a>
        </div>
      } @else {
        <div class="checkout-grid">
          <!-- Left Column: Steps -->
          <div class="left-col">
            <!-- STEP 1: Select Address matching selectaddress.jsp -->
            <div class="step-card">
              <div class="step-header">
                <span class="step-num">1</span>
                <h3>Select Delivery Address</h3>
              </div>

              @if (addresses().length === 0 && !showNewAddressForm()) {
                <div class="no-addr-notice">
                  <p>You don't have any saved addresses.</p>
                  <button class="btn-small" (click)="showNewAddressForm.set(true)">
                    ➕ Add Address
                  </button>
                </div>
              } @else {
                <div class="address-options">
                  @for (addr of addresses(); track addr.id) {
                    <label
                      class="addr-option"
                      [class.selected]="selectedAddressId() === addr.id"
                    >
                      <input
                        type="radio"
                        name="deliveryAddress"
                        [value]="addr.id"
                        [checked]="selectedAddressId() === addr.id"
                        (change)="selectAddress(addr.id!)"
                      />
                      <div class="addr-text">
                        <strong>{{ addr.street }}</strong>
                        @if (addr.line2) {
                          <div>{{ addr.line2 }}</div>
                        }
                        <div>{{ addr.city }}, {{ addr.state }} - {{ addr.zipCode }}</div>
                      </div>
                    </label>
                  }
                </div>

                @if (!showNewAddressForm()) {
                  <button class="btn-text" (click)="showNewAddressForm.set(true)">
                    ➕ Add a different address
                  </button>
                }
              }

              <!-- Inline Add Address Form -->
              @if (showNewAddressForm()) {
                <div class="new-addr-form">
                  <h4>New Shipping Address</h4>
                  <input
                    type="text"
                    placeholder="Address Line 1 (Street) *"
                    [(ngModel)]="newAddress.street"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    [(ngModel)]="newAddress.line2"
                  />
                  <div class="form-row">
                    <input
                      type="text"
                      placeholder="City *"
                      [(ngModel)]="newAddress.city"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      [(ngModel)]="newAddress.state"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="6-digit Pincode *"
                    [(ngModel)]="newAddress.zipCode"
                    maxlength="6"
                    required
                  />
                  <div class="btn-group">
                    <button class="btn-save" (click)="saveNewAddress()">Save & Use</button>
                    <button class="btn-cancel" (click)="showNewAddressForm.set(false)">Cancel</button>
                  </div>
                </div>
              }
            </div>

            <!-- STEP 2: Payment matching Flopkart payment.jsp -->
            <div class="step-card">
              <div class="step-header">
                <span class="step-num">2</span>
                <h3>Payment Details</h3>
              </div>

              <!-- Accepted Cards from Flopkart payment.jsp -->
              <div class="card-logos">
                <p>Accepted cards:</p>
                <div class="logo-row">
                  <img src="https://res.cloudinary.com/dz8qf9ugu/image/upload/v1765883262/visa_byqdjm.png" alt="Visa" />
                  <img src="https://res.cloudinary.com/dz8qf9ugu/image/upload/v1765883262/mastercard_cywhrh.png" alt="MasterCard" />
                  <img src="https://res.cloudinary.com/dz8qf9ugu/image/upload/v1765883261/amex_rcfyyu.png" alt="American Express" />
                </div>
              </div>

              <div class="form-group">
                <label>Credit / Debit Card Number *</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  [(ngModel)]="cardNumber"
                  maxlength="19"
                  (input)="formatCardNumber($event)"
                />
              </div>

              <div class="form-row">
                <div class="col">
                  <label>Expiry Month *</label>
                  <select [(ngModel)]="expMonth">
                    <option value="">Month</option>
                    @for (m of months; track m) {
                      <option [value]="m">{{ m }}</option>
                    }
                  </select>
                </div>
                <div class="col">
                  <label>Expiry Year *</label>
                  <select [(ngModel)]="expYear">
                    <option value="">Year</option>
                    @for (y of years; track y) {
                      <option [value]="y">{{ y }}</option>
                    }
                  </select>
                </div>
                <div class="col">
                  <label>CVV *</label>
                  <input
                    type="password"
                    placeholder="123"
                    [(ngModel)]="cvv"
                    maxlength="4"
                  />
                </div>
              </div>

              @if (errorMessage()) {
                <div class="error-box">{{ errorMessage() }}</div>
              }
            </div>
          </div>

          <!-- Right Column: Order Summary -->
          <div class="right-col">
            <div class="summary-card">
              <h3>Order Summary</h3>

              <div class="items-preview">
                @for (item of cartService.cartItems(); track item.id) {
                  <div class="preview-item">
                    <span class="p-name">{{ item.quantity }}x {{ item.product.name }}</span>
                    <span class="p-price">₹{{ item.product.price * item.quantity }}</span>
                  </div>
                }
              </div>

              <hr />

              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹{{ cartService.cartTotal() }}</span>
              </div>
              <div class="summary-row">
                <span>Delivery:</span>
                <span class="free">FREE</span>
              </div>
              <div class="summary-row grand-total">
                <span>Total Amount:</span>
                <span>₹{{ cartService.cartTotal() }}</span>
              </div>

              <button
                class="btn-place-order"
                [disabled]="placingOrder()"
                (click)="placeOrder()"
              >
                {{ placingOrder() ? 'Processing Order...' : '🔒 Place Order & Pay' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1050px;
      margin: 20px auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 25px;
      color: #222;
      font-size: 26px;
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 25px;
      align-items: start;
    }

    .left-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .step-card {
      background: #fff;
      padding: 24px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 18px;
    }

    .step-num {
      width: 28px;
      height: 28px;
      background: #111;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }

    .step-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .address-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .addr-option {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .addr-option.selected {
      border-color: #111;
      background: #fafafa;
    }

    .addr-option input[type="radio"] {
      margin-top: 4px;
    }

    .addr-text strong {
      color: #222;
    }

    .addr-text div {
      font-size: 13px;
      color: #666;
      margin-top: 2px;
    }

    .btn-text {
      background: none;
      border: none;
      color: #007bff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 15px;
      padding: 0;
    }

    .new-addr-form {
      margin-top: 15px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .new-addr-form h4 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 15px;
    }

    .new-addr-form input, .new-addr-form select {
      width: 100%;
      padding: 10px;
      margin-bottom: 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 13px;
      box-sizing: border-box;
    }

    .card-logos {
      margin-bottom: 16px;
    }

    .card-logos p {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #666;
    }

    .logo-row {
      display: flex;
      gap: 12px;
    }

    .logo-row img {
      height: 32px;
      object-fit: contain;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label, .col label {
      display: block;
      margin-bottom: 5px;
      font-size: 13px;
      font-weight: bold;
      color: #555;
    }

    .form-group input, .col select, .col input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .col {
      flex: 1;
    }

    .btn-group {
      display: flex;
      gap: 10px;
      margin-top: 6px;
    }

    .btn-save {
      padding: 8px 16px;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .btn-cancel {
      padding: 8px 16px;
      background: none;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }

    .summary-card {
      background: #fff;
      padding: 24px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .summary-card h3 {
      margin-top: 0;
      margin-bottom: 16px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      font-size: 18px;
    }

    .items-preview {
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 15px;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 8px;
      color: #555;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
      color: #666;
    }

    .free {
      color: #28a745;
      font-weight: bold;
    }

    .grand-total {
      font-size: 18px;
      font-weight: bold;
      color: #222;
      margin-top: 15px;
    }

    .btn-place-order {
      display: block;
      width: 100%;
      margin-top: 20px;
      padding: 14px;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .btn-place-order:hover:not(:disabled) {
      background: #218838;
    }

    .btn-place-order:disabled {
      background: #888;
      cursor: not-allowed;
    }

    .error-box {
      background: #ffebee;
      color: #d32f2f;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: bold;
      margin-top: 15px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #fff;
      border-radius: 10px;
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

    @media (max-width: 768px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  readonly cartService = inject(CartService);
  private readonly addressService = inject(AddressService);
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  addresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);
  showNewAddressForm = signal<boolean>(false);
  placingOrder = signal<boolean>(false);
  errorMessage = signal<string>('');

  cardNumber = '';
  expMonth = '';
  expYear = '';
  cvv = '';

  months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  years = ['2026', '2027', '2028', '2029', '2030', '2031'];

  newAddress: Address = {
    street: '',
    line2: '',
    city: '',
    state: '',
    zipCode: ''
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user?.id) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Load user addresses
    this.addressService.getUserAddresses(user.id).subscribe({
      next: (list) => {
        this.addresses.set(list || []);
        if (list && list.length > 0) {
          this.selectedAddressId.set(list[0].id!);
        }
      }
    });
  }

  selectAddress(id: number): void {
    this.selectedAddressId.set(id);
  }

  formatCardNumber(event: any): void {
    let val = event.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    const parts = [];
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.substring(i, i + 4));
    }
    this.cardNumber = parts.join(' ');
  }

  saveNewAddress(): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    if (!this.newAddress.street || !this.newAddress.city || !this.newAddress.state || !this.newAddress.zipCode) {
      this.errorMessage.set('Please fill out all required address fields.');
      return;
    }

    this.addressService.addAddress({
      ...this.newAddress,
      user: { id: user.id, username: user.username }
    }).subscribe({
      next: (saved) => {
        this.addresses.update((list) => [...list, saved]);
        this.selectedAddressId.set(saved.id!);
        this.showNewAddressForm.set(false);
        this.errorMessage.set('');
        this.newAddress = { street: '', line2: '', city: '', state: '', zipCode: '' };
      }
    });
  }

  placeOrder(): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    if (!this.selectedAddressId()) {
      this.errorMessage.set('Please select or add a delivery address.');
      return;
    }

    const rawCard = this.cardNumber.replace(/\s+/g, '');
    if (!rawCard || rawCard.length < 12) {
      this.errorMessage.set('Please enter a valid credit card number.');
      return;
    }

    if (!this.expMonth || !this.expYear || !this.cvv) {
      this.errorMessage.set('Please complete all card details (Expiry & CVV).');
      return;
    }

    this.placingOrder.set(true);
    this.errorMessage.set('');

    const selectedAddr = this.addresses().find((a) => a.id === this.selectedAddressId());
    if (!selectedAddr) {
      this.errorMessage.set('Selected address not found.');
      this.placingOrder.set(false);
      return;
    }

    // Construct order items from active cart
    const orderItems: OrderItem[] = this.cartService.cartItems().map((ci) => ({
      product: ci.product,
      price: ci.product.price,
      quantity: ci.quantity
    }));

    const orderPayload: Order = {
      user: { id: user.id, username: user.username },
      shippingAddress: selectedAddr,
      cardNumber: '**** **** **** ' + rawCard.slice(-4),
      totalAmount: this.cartService.cartTotal(),
      items: orderItems
    };

    this.orderService.placeOrder(orderPayload).subscribe({
      next: (savedOrder) => {
        this.placingOrder.set(false);
        // Clear local cart signal because backend emptied cart on checkout
        this.cartService.cartItems.set([]);
        // Navigate to receipt screen with new order banner!
        this.router.navigate(['/order', savedOrder.id], { queryParams: { new: 'true' } });
      },
      error: (err) => {
        this.placingOrder.set(false);
        this.errorMessage.set(err.error || 'Failed to place order. Check product stock.');
      }
    });
  }
}
