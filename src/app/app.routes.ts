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
    loadComponent: () => import('./shared/presentation/layouts/owner-layout/owner-layout').then(m => m.OwnerLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./shared/presentation/pages/owner-dashboard/owner-dashboard').then(m => m.OwnerDashboardComponent)
      },
      {
        path: 'properties',
        loadComponent: () => import('./assets/presentation/views/properties/properties').then(m => m.PropertiesComponent)
      },
      {
        path: 'new-request',
        loadComponent: () => import('./sdp/presentation/views/request-form/request-form').then(m => m.RequestFormComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/presentation/pages/owner-analytics/owner-analytics').then(m => m.OwnerAnalyticsComponent)
      },
      {
        path: 'subscription',
        loadComponent: () => import('./subscription/presentation/views/manage-subscription/manage-subscription').then(m => m.ManageSubscriptionComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'technician',
    loadComponent: () => import('./shared/presentation/layouts/technician-layout/technician-layout').then(m => m.TechnicianLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./shared/presentation/pages/technician-dashboard/technician-dashboard').then(m => m.TechnicianDashboardComponent)
      },
      {
        path: 'catalog',
        loadComponent: () => import('./sdp/presentation/views/service-catalog/service-catalog').then(m => m.ServiceCatalogComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./assets/presentation/views/inventory/inventory').then(m => m.InventoryComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profiles/presentation/views/profile-list/profile-list').then(m => m.ProfileListComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/presentation/pages/technician-analytics/technician-analytics').then(m => m.TechnicianAnalyticsComponent)
      },
      {
        path: 'service/:id',
        loadComponent: () => import('./monitoring/presentation/pages/active-service/active-service').then(m => m.ActiveServiceComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  { path: '', redirectTo: 'iam', pathMatch: 'full' }
];
