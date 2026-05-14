import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { IamStore } from '../../../../iam/application/iam-store.service';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'el-owner-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="el-layout">
      <aside class="el-sidebar">
        <div class="el-sidebar-brand">
          <i class="pi pi-bolt el-brand-icon"></i>
          <span class="el-brand-name">ElectroLink</span>
        </div>

        <nav class="el-sidebar-nav">
          <button *ngFor="let item of menu" class="el-nav-item" [class.active]="isActive(item.path)" (click)="navigate(item.path)">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <div class="el-sidebar-footer">
          <button class="el-support-btn">
            <i class="pi pi-headphones"></i>
            <span>Get Support</span>
          </button>
          <div class="el-user-section">
            <i class="pi pi-user el-user-avatar"></i>
            <div class="el-user-info">
              <span class="el-user-name">{{ store.currentUser()?.username }}</span>
              <span class="el-user-role">Homeowner</span>
            </div>
            <button class="el-logout-btn" (click)="logout()" title="Cerrar Sesión">
              <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </div>
      </aside>

      <main class="el-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .el-layout { display: flex; min-height: 100vh; background: var(--el-bg-soft, #e8eef7); }

    .el-sidebar {
      width: 260px;
      min-width: 260px;
      height: 100vh;
      background: #182442;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      align-self: flex-start;
    }

    .el-sidebar-brand {
      padding: 24px 24px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .el-brand-icon { font-size: 28px; color: #ffe492; }
    .el-brand-name { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; color: #ffffff; }

    .el-sidebar-nav {
      flex: 1;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .el-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: none;
      background: transparent;
      color: rgba(255,255,255,0.55);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.15s ease;
      border-left: 3px solid transparent;
    }
    .el-nav-item:hover {
      background: rgba(46, 58, 89, 0.6);
      color: rgba(255,255,255,0.9);
    }
    .el-nav-item.active {
      background: #2e3a59;
      color: #ffffff;
      border-left-color: #3b82f6;
    }
    .el-nav-item i { font-size: 18px; width: 20px; text-align: center; }

    .el-sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .el-support-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.75);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      transition: all 0.15s ease;
    }
    .el-support-btn:hover { background: rgba(255,255,255,0.12); }
    .el-support-btn i { font-size: 16px; }

    .el-user-section {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
    }
    .el-user-avatar {
      font-size: 20px;
      color: rgba(255,255,255,0.5);
      flex-shrink: 0;
    }
    .el-user-info {
      flex: 1;
      min-width: 0;
    }
    .el-user-name {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .el-user-role {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 400;
      color: rgba(255,255,255,0.35);
      display: block;
    }
    .el-logout-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.35);
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      transition: color 0.15s ease;
      flex-shrink: 0;
    }
    .el-logout-btn:hover { color: #ef4444; }

    .el-main {
      flex: 1;
      min-height: 100vh;
      overflow-y: auto;
    }
  `]
})
export class OwnerLayoutComponent {
  store = inject(IamStore);
  router = inject(Router);

  menu: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', path: '/owner/dashboard' },
    { label: 'Mis Propiedades', icon: 'pi pi-building', path: '/owner/properties' },
    { label: 'Solicitar Servicio', icon: 'pi pi-plus-circle', path: '/owner/new-request' },
    { label: 'Analytics', icon: 'pi pi-chart-bar', path: '/owner/analytics' },
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
