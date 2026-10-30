import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards';

export const routes: Routes = [
  // Customer Catalog & Details
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Shopmart - Home'
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-details/product-details.component').then((m) => m.ProductDetailsComponent),
    title: 'Shopmart - Product Details'
  },

  // Authentication
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
    title: 'Shopmart - Sign In'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
    title: 'Shopmart - Register'
  },

  // Customer Shopping Flow (Protected by authGuard)
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [authGuard],
    title: 'Shopmart - Cart'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [authGuard],
    title: 'Shopmart - Checkout'
  },
  {
    path: 'addresses',
    loadComponent: () => import('./pages/addresses/addresses.component').then((m) => m.AddressesComponent),
    canActivate: [authGuard],
    title: 'Shopmart - Addresses'
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
    canActivate: [authGuard],
    title: 'Shopmart - My Orders'
  },
  {
    path: 'order/:id',
    loadComponent: () => import('./pages/order-details/order-details.component').then((m) => m.OrderDetailsComponent),
    canActivate: [authGuard],
    title: 'Shopmart - Order Receipt'
  },

  // Admin Section (Protected by adminGuard)
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then((m) => m.AdminDashboardComponent),
    canActivate: [adminGuard],
    title: 'Shopmart - Admin Dashboard'
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./pages/admin/products/products.component').then((m) => m.AdminProductsComponent),
    canActivate: [adminGuard],
    title: 'Shopmart - Manage Products'
  },
  {
    path: 'admin/add-product',
    loadComponent: () => import('./pages/admin/product-form/product-form.component').then((m) => m.AdminProductFormComponent),
    canActivate: [adminGuard],
    title: 'Shopmart - Add Product'
  },
  {
    path: 'admin/edit-product/:id',
    loadComponent: () => import('./pages/admin/product-form/product-form.component').then((m) => m.AdminProductFormComponent),
    canActivate: [adminGuard],
    title: 'Shopmart - Edit Product'
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./pages/admin/orders/orders.component').then((m) => m.AdminOrdersComponent),
    canActivate: [adminGuard],
    title: 'Shopmart - Customer Orders'
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin/users/users.component').then((m) => m.AdminUsersComponent),
    canActivate: [adminGuard],
    title: 'Shopmart - Users List'
  },

  // Fallback redirect to Home
  {
    path: '**',
    redirectTo: ''
  }
];
