import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';

export type UserRole = 'owner' | 'technician';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  plan: 'basic' | 'premium';
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<{ user: AuthUser | null }>({ user: null }),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
    isOwner: computed(() => user()?.role === 'owner'),
    isTechnician: computed(() => user()?.role === 'technician'),
    isPremium: computed(() => user()?.plan === 'premium'),
  })),
  withMethods((store) => ({
    login(userData: AuthUser) {
      patchState(store, { user: userData });
    },
    logout() {
      patchState(store, { user: null });
    },
  }))
);
