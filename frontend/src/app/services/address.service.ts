import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { Address } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch all saved shipping addresses for a specific customer
   * Calls GET http://localhost:8080/api/addresses/user/{userId}
   */
  getUserAddresses(userId: number): Observable<Address[]> {
    return this.http.get<Address[]>(`${API_ENDPOINTS.addresses}/user/${userId}`);
  }

  /**
   * Fetch single address by ID (used on edit address screen)
   * Calls GET http://localhost:8080/api/addresses/{id}
   */
  getAddressById(id: number): Observable<Address> {
    return this.http.get<Address>(`${API_ENDPOINTS.addresses}/${id}`);
  }

  /**
   * Save a new address
   * Calls POST http://localhost:8080/api/addresses/add
   */
  addAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(`${API_ENDPOINTS.addresses}/add`, address);
  }

  /**
   * Update an existing address
   * Calls PUT http://localhost:8080/api/addresses/{id}
   */
  updateAddress(id: number, address: Address): Observable<Address> {
    return this.http.put<Address>(`${API_ENDPOINTS.addresses}/${id}`, address);
  }

  /**
   * Delete an address
   * Calls DELETE http://localhost:8080/api/addresses/{id}
   */
  deleteAddress(id: number): Observable<string> {
    return this.http.delete(`${API_ENDPOINTS.addresses}/${id}`, { responseType: 'text' });
  }

  /**
   * Admin: Get all customer addresses
   * Calls GET http://localhost:8080/api/addresses
   */
  getAllAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(API_ENDPOINTS.addresses);
  }
}
