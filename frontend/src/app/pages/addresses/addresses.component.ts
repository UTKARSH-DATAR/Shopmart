import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService, AuthService } from '../../services';
import { Address } from '../../models';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>My Saved Addresses</h1>

      <!-- Button to toggle add new address form -->
      <div class="top-bar">
        <button class="btn-add" (click)="openAddForm()">
          {{ showForm() ? '✕ Cancel' : '➕ Add New Address' }}
        </button>
      </div>

      <!-- Add / Edit Address Form matching Flopkart addaddress.jsp -->
      @if (showForm()) {
        <div class="form-card">
          <h2>{{ editingId() ? 'Edit Address' : 'Add New Address' }}</h2>
          <form (ngSubmit)="saveAddress()">
            <label>Address Line 1 (Street) *</label>
            <input
              type="text"
              name="street"
              [(ngModel)]="currentAddress.street"
              placeholder="House/Flat No, Building, Street"
              required
            />

            <label>Address Line 2</label>
            <input
              type="text"
              name="line2"
              [(ngModel)]="currentAddress.line2"
              placeholder="Area, Landmark (Optional)"
            />

            <div class="form-row">
              <div class="col">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  [(ngModel)]="currentAddress.city"
                  placeholder="City"
                  required
                />
              </div>
              <div class="col">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  [(ngModel)]="currentAddress.state"
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <label>Pincode *</label>
            <input
              type="text"
              name="zipCode"
              [(ngModel)]="currentAddress.zipCode"
              placeholder="6-digit Pincode"
              maxlength="6"
              required
            />

            <div class="form-buttons">
              <button type="submit" class="submit-btn" [disabled]="submitting()">
                {{ submitting() ? 'Saving...' : (editingId() ? '💾 Save Changes' : '➕ Add Address') }}
              </button>
              <button type="button" class="cancel-btn" (click)="cancelForm()">Cancel</button>
            </div>
          </form>
        </div>
      }

      <!-- Addresses List matching Flopkart addresses.jsp -->
      @if (loading()) {
        <p class="status-msg">Loading your addresses...</p>
      } @else if (addresses().length === 0 && !showForm()) {
        <div class="empty-state">
          <p>No addresses found.</p>
          <p class="sub">Add a shipping address to speed up your checkout.</p>
        </div>
      } @else {
        <div class="address-grid">
          @for (addr of addresses(); track addr.id) {
            <div class="address-card">
              <div class="addr-content">
                <p class="line-1"><strong>{{ addr.street }}</strong></p>
                @if (addr.line2) {
                  <p class="line-2">{{ addr.line2 }}</p>
                }
                <p class="city-state">{{ addr.city }}, {{ addr.state }} - {{ addr.zipCode }}</p>
              </div>

              <div class="addr-actions">
                <button class="btn-edit" (click)="editAddress(addr)">✏️ Edit</button>
                <button class="btn-delete" (click)="deleteAddress(addr.id!)">🗑️ Delete</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 25px;
      font-size: 26px;
    }

    .top-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    .btn-add {
      padding: 10px 20px;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
    }

    .btn-add:hover {
      background: #218838;
    }

    .form-card {
      background: #fff;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .form-card h2 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 20px;
      color: #333;
    }

    label {
      font-weight: bold;
      color: #555;
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
    }

    input[type="text"] {
      width: 100%;
      padding: 10px;
      margin-bottom: 16px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input[type="text"]:focus {
      border-color: #007bff;
      outline: none;
    }

    .form-row {
      display: flex;
      gap: 15px;
    }

    .col {
      flex: 1;
    }

    .form-buttons {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }

    .submit-btn {
      flex: 1;
      padding: 12px;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
    }

    .submit-btn:hover {
      background: #218838;
    }

    .cancel-btn {
      padding: 12px 20px;
      background: none;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }

    .address-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 18px;
    }

    .address-card {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .addr-content p {
      margin: 4px 0;
      color: #555;
      font-size: 14px;
    }

    .addr-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      border-top: 1px solid #eee;
      padding-top: 12px;
    }

    .btn-edit, .btn-delete {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .btn-edit {
      background: #eee;
      color: #333;
    }

    .btn-edit:hover {
      background: #ddd;
    }

    .btn-delete {
      background: #ffebee;
      color: #d32f2f;
    }

    .btn-delete:hover {
      background: #ffcdd2;
    }

    .empty-state, .status-msg {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class AddressesComponent implements OnInit {
  private readonly addressService = inject(AddressService);
  private readonly authService = inject(AuthService);

  addresses = signal<Address[]>([]);
  loading = signal<boolean>(true);
  showForm = signal<boolean>(false);
  editingId = signal<number | null>(null);
  submitting = signal<boolean>(false);

  currentAddress: Address = {
    street: '',
    line2: '',
    city: '',
    state: '',
    zipCode: ''
  };

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    this.loading.set(true);
    this.addressService.getUserAddresses(user.id).subscribe({
      next: (list) => {
        this.addresses.set(list || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openAddForm(): void {
    if (this.showForm()) {
      this.cancelForm();
    } else {
      this.editingId.set(null);
      this.currentAddress = { street: '', line2: '', city: '', state: '', zipCode: '' };
      this.showForm.set(true);
    }
  }

  editAddress(addr: Address): void {
    this.editingId.set(addr.id!);
    this.currentAddress = { ...addr };
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.currentAddress = { street: '', line2: '', city: '', state: '', zipCode: '' };
  }

  saveAddress(): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    this.submitting.set(true);
    const payload: Address = {
      ...this.currentAddress,
      user: { id: user.id, username: user.username }
    };

    if (this.editingId()) {
      this.addressService.updateAddress(this.editingId()!, payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.cancelForm();
          this.loadAddresses();
        },
        error: () => this.submitting.set(false)
      });
    } else {
      this.addressService.addAddress(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.cancelForm();
          this.loadAddresses();
        },
        error: () => this.submitting.set(false)
      });
    }
  }

  deleteAddress(id: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(id).subscribe({
        next: () => this.loadAddresses()
      });
    }
  }
}
