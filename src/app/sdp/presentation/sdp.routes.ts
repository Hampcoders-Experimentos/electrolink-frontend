import { Routes } from '@angular/router';

export const SDP_ROUTES: Routes = [
  {
    path: 'catalog',
    loadComponent: () => import('./views/service-catalog/service-catalog').then(m => m.ServiceCatalogComponent)
  },
  {
    path: 'request',
    loadComponent: () => import('./views/request-form/request-form').then(m => m.RequestFormComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./views/schedule-calendar/schedule-calendar').then(m => m.ScheduleCalendarComponent)
  },
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  }
];
