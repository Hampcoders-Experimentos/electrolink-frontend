import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AuthStore } from '../../../../shared/infrastructure/stores/auth.store';

@Component({
  selector: 'el-technician-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DrawerModule, ButtonModule],
  template: `
    <div class="flex min-h-screen bg-[var(--el-bg-soft)]">
      <!-- Menú Lateral -->
      <p-drawer [(visible)]="drawerVisible" [modal]="false" [showCloseIcon]="false" [style]="{ width: '250px' }">
        <div class="flex flex-col h-full">
          <div class="flex align-items-center gap-2 p-4 mb-4 border-b border-gray-200">
            <i class="pi pi-bolt text-2xl" style="color: var(--el-primary)"></i>
            <span class="font-bold text-xl" style="color: var(--el-primary)">ElectroLink Tech</span>
          </div>

          <div class="flex flex-col gap-2 p-4 flex-1">
            <p-button label="Dashboard" icon="pi pi-home" styleClass="p-button-text w-full justify-content-start" (onClick)="navigate('/technician/dashboard')" />
            <p-button label="Mi Catálogo" icon="pi pi-list" styleClass="p-button-text w-full justify-content-start" (onClick)="navigate('/technician/catalog')" />
            <p-button label="Inventario" icon="pi pi-box" styleClass="p-button-text w-full justify-content-start" (onClick)="navigate('/technician/inventory')" />
            <p-button label="Perfil" icon="pi pi-user" styleClass="p-button-text w-full justify-content-start" (onClick)="navigate('/technician/profile')" />
            <p-button label="Analytics" icon="pi pi-chart-line" styleClass="p-button-text w-full justify-content-start" (onClick)="navigate('/technician/analytics')" />
          </div>

          <div class="p-4 border-t border-gray-200">
            <p class="font-semibold mb-2">{{ authStore.user()?.name }}</p>
            <p-button label="Cerrar Sesión" icon="pi pi-sign-out" severity="danger" styleClass="p-button-text w-full justify-content-start" (onClick)="logout()" />
          </div>
        </div>
      </p-drawer>

      <!-- Contenido Principal -->
      <div class="flex-1 transition-all duration-300" [style.margin-left]="drawerVisible ? '250px' : '0'">
        <div class="p-3 bg-white shadow-sm flex items-center">
          <p-button icon="pi pi-bars" styleClass="p-button-text" (onClick)="drawerVisible = !drawerVisible" />
          <span class="ml-2 font-semibold text-lg text-gray-700">Área Técnica</span>
        </div>
        <main class="p-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class TechnicianLayoutComponent {
  authStore = inject(AuthStore);
  router = inject(Router);

  drawerVisible = true;

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
