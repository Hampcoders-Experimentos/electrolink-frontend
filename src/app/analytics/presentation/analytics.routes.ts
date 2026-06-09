import { Routes } from '@angular/router';

export const OWNER_ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/owner-analytics/owner-analytics').then(m => m.OwnerAnalyticsComponent)
  }
];

export const TECHNICIAN_ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/technician-analytics/technician-analytics').then(m => m.TechnicianAnalyticsComponent)
  }
];

export const ANALYTICS_ROUTES: Routes = [
  {
    path: 'owner',
    loadComponent: () => import('./pages/owner-analytics/owner-analytics').then(m => m.OwnerAnalyticsComponent)
  },
  {
    path: 'technician',
    loadComponent: () => import('./pages/technician-analytics/technician-analytics').then(m => m.TechnicianAnalyticsComponent)
  }
];
