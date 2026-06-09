import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { IamStore } from '@iam/application/iam-store.service';
import { IconComponent } from '../../components/icon/icon';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'el-owner-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, IconComponent],
  templateUrl: './owner-layout.html',
  styleUrl: './owner-layout.css',
})
export class OwnerLayoutComponent {
  store = inject(IamStore);
  router = inject(Router);

  menu: MenuItem[] = [
    { label: 'Dashboard',         icon: 'home',        path: '/owner/dashboard' },
    { label: 'Mis Propiedades',   icon: 'building',    path: '/owner/properties' },
    { label: 'Solicitar Servicio', icon: 'plus-circle', path: '/owner/new-request' },
    { label: 'Analytics',         icon: 'chart-bar',   path: '/owner/analytics' },
  ];

  navigate(path: string) {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  logout() {
    this.store.logout();
    this.router.navigate(['/iam/sign-in']);
  }
}
