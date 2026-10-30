import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';

/**
 * Route guard restricting admin section to authorized administrators
 * (Admin role or username 'utkarsh_datar' matching Flopkart)
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Not an admin: redirect back to home catalog
  router.navigate(['/']);
  return false;
};
