import { Routes } from '@angular/router';

export const PROFILES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./views/profile-list/profile-list.component').then(m => m.ProfileListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./views/profile-form/profile-form.component').then(m => m.ProfileFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./views/profile-form/profile-form.component').then(m => m.ProfileFormComponent)
  }
];
