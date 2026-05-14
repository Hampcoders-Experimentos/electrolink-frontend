import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'iam', loadChildren: () => import('./iam/presentation/iam.routes').then(m => m.IAM_ROUTES) },
  { path: 'profiles', loadChildren: () => import('./profiles/presentation/profiles.routes').then(m => m.PROFILES_ROUTES) },
  { path: 'subscription', loadChildren: () => import('./subscription/presentation/subscription.routes').then(m => m.SUBSCRIPTION_ROUTES) },
  { path: 'assets', loadChildren: () => import('./assets/presentation/assets.routes').then(m => m.ASSETS_ROUTES) },
  { path: 'sdp', loadChildren: () => import('./sdp/presentation/sdp.routes').then(m => m.SDP_ROUTES) },
  { path: 'analytics', loadChildren: () => import('./analytics/presentation/analytics.routes').then(m => m.ANALYTICS_ROUTES) },
  { path: 'monitoring', loadChildren: () => import('./monitoring/presentation/monitoring.routes').then(m => m.MONITORING_ROUTES) },
  { 
    path: 'owner', 
    loadComponent: () => import('./shared/presentation/layouts/owner-layout/owner-layout.component').then(m => m.OwnerLayoutComponent),
    children: [
      { path: 'analytics', loadChildren: () => import('./analytics/presentation/analytics.routes').then(m => m.OWNER_ANALYTICS_ROUTES) },
      { path: 'monitoring', loadChildren: () => import('./monitoring/presentation/monitoring.routes').then(m => m.OWNER_MONITORING_ROUTES) }
    ]
  },
  { 
    path: 'technician', 
    loadComponent: () => import('./shared/presentation/layouts/technician-layout/technician-layout.component').then(m => m.TechnicianLayoutComponent),
    children: [
      { path: 'analytics', loadChildren: () => import('./analytics/presentation/analytics.routes').then(m => m.TECHNICIAN_ANALYTICS_ROUTES) },
      { path: 'monitoring', loadChildren: () => import('./monitoring/presentation/monitoring.routes').then(m => m.TECHNICIAN_MONITORING_ROUTES) }
    ]
  },
  { path: '', redirectTo: 'iam', pathMatch: 'full' }
];
