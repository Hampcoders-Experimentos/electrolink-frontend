import { Routes } from '@angular/router';

export const IAM_ROUTES: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('./views/sign-in/sign-in').then(m => m.SignInComponent)
  },
  {
    path: 'login',
    redirectTo: 'sign-in',
    pathMatch: 'full'
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./views/sign-up/sign-up').then(m => m.SignUpComponent)
  },
  {
    path: 'register',
    redirectTo: 'sign-up',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./views/user-list/user-list').then(m => m.UserListComponent)
  },
  {
    path: 'user-list',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full'
  }
];
