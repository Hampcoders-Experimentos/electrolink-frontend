import { Routes } from '@angular/router';
import { roleGuard } from '../../shared/infrastructure/guards/role.guard';

export const OWNER_MONITORING_ROUTES: Routes = [
  {
    path: 'ratings',
    canActivate: [roleGuard(['owner', 'technician'])],
    loadComponent: () => import('./pages/ratings/ratings.component').then(m => m.RatingsComponent)
  },
  {
    path: '',
    redirectTo: 'ratings',
    pathMatch: 'full'
  }
];

export const TECHNICIAN_MONITORING_ROUTES: Routes = [
  {
    path: 'service/:id',
    canActivate: [roleGuard(['technician', 'owner'])],
    loadComponent: () => import('./pages/active-service/active-service.component').then(m => m.ActiveServiceComponent)
  },
  {
    path: 'reports',
    canActivate: [roleGuard(['technician'])],
    loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: '',
    redirectTo: 'service/req-1',
    pathMatch: 'full'
  }
];

export const MONITORING_ROUTES: Routes = [
  {
    path: 'technician/service/:id',
    canActivate: [roleGuard(['technician', 'owner'])],
    loadComponent: () => import('./pages/active-service/active-service.component').then(m => m.ActiveServiceComponent)
  },
  {
    path: 'technician/reports',
    canActivate: [roleGuard(['technician'])],
    loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'owner/ratings',
    canActivate: [roleGuard(['owner', 'technician'])],
    loadComponent: () => import('./pages/ratings/ratings.component').then(m => m.RatingsComponent)
  },
  {
    path: '',
    redirectTo: 'technician/service/req-1',
    pathMatch: 'full'
  }
];
