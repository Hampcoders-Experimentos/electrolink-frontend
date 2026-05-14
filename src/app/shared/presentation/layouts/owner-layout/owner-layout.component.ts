import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { AuthStore } from '../../../../shared/infrastructure/stores/auth.store';

@Component({
  selector: 'el-owner-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenubarModule],
  template: `
    <div class="min-h-screen bg-[var(--el-bg-soft)]">
      <p-menubar [model]="items">
        <ng-template pTemplate="start">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-bolt text-2xl" style="color: var(--el-primary)"></i>
            <span class="font-bold text-xl" style="color: var(--el-primary)">ElectroLink</span>
          </div>
        </ng-template>
        <ng-template pTemplate="end">
          <div class="flex align-items-center gap-2">
            <span class="font-semibold">{{ authStore.user()?.name }}</span>
            <i class="pi pi-user cursor-pointer"></i>
          </div>
        </ng-template>
      </p-menubar>
      <main class="p-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class OwnerLayoutComponent {
  authStore = inject(AuthStore);
  router = inject(Router);

  items: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', command: () => this.router.navigate(['/owner/dashboard']) },
    { label: 'Mis Propiedades', icon: 'pi pi-building', command: () => this.router.navigate(['/owner/properties']) },
    { label: 'Solicitar Servicio', icon: 'pi pi-plus-circle', command: () => this.router.navigate(['/owner/new-request']) },
    { label: 'Analytics', icon: 'pi pi-chart-bar', command: () => this.router.navigate(['/owner/analytics']) },
    { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: () => {
        this.authStore.logout();
        this.router.navigate(['/login']);
      }
    }
  ];
}
