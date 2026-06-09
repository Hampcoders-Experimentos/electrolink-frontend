import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { IamStore } from '../../../../iam/application/iam-store.service';
import { IconComponent } from '../../components/icon/icon';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'el-technician-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, IconComponent],
  templateUrl: './technician-layout.html',
  styleUrl: './technician-layout.css',
})
export class TechnicianLayoutComponent {
  store = inject(IamStore);
  router = inject(Router);

  menu: MenuItem[] = [
    { label: 'Dashboard',  icon: 'home',       path: '/technician/dashboard' },
    { label: 'Mi Catálogo', icon: 'list',      path: '/technician/catalog' },
    { label: 'Inventario', icon: 'box',        path: '/technician/inventory' },
    { label: 'Perfil',     icon: 'user',       path: '/technician/profile' },
    { label: 'Analytics',  icon: 'chart-line', path: '/technician/analytics' },
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
