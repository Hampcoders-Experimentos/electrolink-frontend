import { Routes } from '@angular/router';

export const ASSETS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'properties',
    pathMatch: 'full'
  },
  {
    path: 'properties',
    loadComponent: () => import('./views/properties/properties.component').then(m => m.PropertiesComponent)
  },
  {
    path: 'inventory',
    loadComponent: () => import('./views/inventory/inventory.component').then(m => m.InventoryComponent)
  },
  // Legacy routes kept for backward compatibility if needed
  {
    path: 'list',
    loadComponent: () => import('./views/property-list/property-list.component').then(m => m.PropertyListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./views/property-form/property-form.component').then(m => m.PropertyFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./views/property-form/property-form.component').then(m => m.PropertyFormComponent)
  }
];
