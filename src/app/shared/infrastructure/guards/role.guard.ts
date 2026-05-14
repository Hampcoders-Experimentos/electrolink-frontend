import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore, UserRole } from '../stores/auth.store';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);
    const user = authStore.user();

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    // Redirect to home or login if unauthorized
    return router.parseUrl('/login');
  };
};
