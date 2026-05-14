import { Routes } from '@angular/router';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: 'plans',
    loadComponent: () => import('./views/plan-list/plan-list.component').then(m => m.PlanListComponent)
  },
  {
    path: 'manage',
    loadComponent: () => import('./views/manage-subscription/manage-subscription.component').then(m => m.ManageSubscriptionComponent)
  },
  {
    path: '',
    redirectTo: 'manage',
    pathMatch: 'full'
  }
];
