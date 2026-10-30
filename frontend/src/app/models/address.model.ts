import { User } from './user.model';

// Address model for customer delivery locations
export interface Address {
  id?: number;
  street: string;   // Address Line 1 (street)
  line1?: string;
  line2?: string;    // Address Line 2 (suite, apt, landmark)
  city: string;
  state: string;
  zipCode: string;  // 6-digit Pincode / Postal Code
  pincode?: string;
  user?: User;
}
