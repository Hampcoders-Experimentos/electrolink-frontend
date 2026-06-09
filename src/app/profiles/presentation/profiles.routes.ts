import { Routes } from '@angular/router';

export const PROFILES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./views/profile-list/profile-list').then(m => m.ProfileListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./views/profile-form/profile-form').then(m => m.ProfileFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./views/profile-form/profile-form').then(m => m.ProfileFormComponent)
  }
];
