import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

interface ServiceItem {
  id: number;
  technician: string;
  service: string;
  date: string;
  status: string;
}

@Component({
  selector: 'el-owner-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule],
  template: `
    <div class="el-dash">
      <div class="el-dash-header">
        <div>
          <h1 class="el-dash-title">Dashboard</h1>
          <p class="el-dash-subtitle">Resumen de tus propiedades y servicios</p>
        </div>
        <div class="el-dash-actions">
          <button pButton label="Solicitar Servicio" icon="pi pi-plus" class="el-btn-primary" (click)="navigate('/owner/new-request')"></button>
        </div>
      </div>

      <div class="el-kpi-grid">
        <div *ngFor="let kpi of kpis" class="el-kpi-card">
          <div class="el-kpi-icon" [class]="'el-kpi-icon--' + kpi.icon.split(' ')[1]">
            <i [class]="kpi.icon"></i>
          </div>
          <div class="el-kpi-info">
            <span class="el-kpi-label">{{ kpi.label }}</span>
            <span class="el-kpi-value">{{ kpi.value }}</span>
            <span class="el-kpi-change" [class.positive]="kpi.positive" [class.negative]="!kpi.positive">
              {{ kpi.change }}
            </span>
          </div>
        </div>
      </div>

      <div class="el-dash-grid">
        <p-card class="el-table-card">
          <ng-template pTemplate="header">
            <div class="el-card-header">
              <h3>Servicios Recientes</h3>
              <button pButton icon="pi pi-list" label="Ver Todo" class="p-button-text p-button-sm"></button>
            </div>
          </ng-template>
          <table class="el-table">
            <thead>
              <tr>
                <th>Técnico</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let service of recentServices">
                <td class="el-cell-name">{{ service.technician }}</td>
                <td>{{ service.service }}</td>
                <td>{{ service.date }}</td>
                <td><p-tag [value]="service.status" [severity]="getSeverity(service.status)"></p-tag></td>
              </tr>
            </tbody>
          </table>
        </p-card>

        <div class="el-quick-actions">
          <h3 class="el-qa-title">Acciones Rápidas</h3>
          <button class="el-qa-btn" (click)="navigate('/owner/properties')">
            <i class="pi pi-building"></i>
            <span>Mis Propiedades</span>
            <i class="pi pi-chevron-right el-qa-arrow"></i>
          </button>
          <button class="el-qa-btn" (click)="navigate('/owner/new-request')">
            <i class="pi pi-plus-circle"></i>
            <span>Nuevo Servicio</span>
            <i class="pi pi-chevron-right el-qa-arrow"></i>
          </button>
          <button class="el-qa-btn" (click)="navigate('/owner/analytics')">
            <i class="pi pi-chart-bar"></i>
            <span>Ver Analytics</span>
            <i class="pi pi-chevron-right el-qa-arrow"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .el-dash { padding: 32px; max-width: 1200px; }

    .el-dash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }
    .el-dash-title {
      font-family: 'Inter', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: var(--el-primary, #2e3a59);
      margin: 0 0 4px;
    }
    .el-dash-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: var(--el-warm-gray, #a9b1ba);
      margin: 0;
    }
    .el-btn-primary {
      background: var(--el-primary, #2e3a59) !important;
      border: none !important;
    }

    .el-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .el-kpi-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .el-kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .el-kpi-icon--building { background: #eff6ff; color: #3b82f6; }
    .el-kpi-icon--wrench { background: #fef3c7; color: #f59e0b; }
    .el-kpi-icon--check-circle { background: #f0fdf4; color: #22c55e; }
    .el-kpi-icon--dollar { background: #fef2f2; color: #ef4444; }
    .el-kpi-icon--clock { background: #f5f3ff; color: #8b5cf6; }
    .el-kpi-info { display: flex; flex-direction: column; gap: 2px; }
    .el-kpi-label {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--el-warm-gray, #a9b1ba);
    }
    .el-kpi-value {
      font-family: 'Inter', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--el-primary, #2e3a59);
    }
    .el-kpi-change {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
    }
    .el-kpi-change.positive { color: #22c55e; }
    .el-kpi-change.negative { color: #ef4444; }

    .el-dash-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
    }
    .el-table-card { overflow: hidden; }
    .el-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px 0;
    }
    .el-card-header h3 {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-primary, #2e3a59);
      margin: 0;
    }
    .el-table {
      width: 100%;
      border-collapse: collapse;
    }
    .el-table th {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: var(--el-warm-gray, #a9b1ba);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: left;
      padding: 12px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .el-table td {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: var(--el-primary, #2e3a59);
      padding: 14px 24px;
      border-bottom: 1px solid #f3f4f6;
    }
    .el-cell-name { font-weight: 600; }

    .el-quick-actions { display: flex; flex-direction: column; gap: 12px; }
    .el-qa-title {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-primary, #2e3a59);
      margin: 0;
    }
    .el-qa-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #ffffff;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-primary, #2e3a59);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: all 0.15s ease;
      text-align: left;
      width: 100%;
    }
    .el-qa-btn:hover {
      box-shadow: 0 4px 6px rgba(0,0,0,0.08);
      transform: translateY(-1px);
    }
    .el-qa-btn i:first-child {
      font-size: 20px;
      color: var(--el-primary, #2e3a59);
      width: 24px;
      text-align: center;
    }
    .el-qa-arrow {
      margin-left: auto;
      font-size: 14px !important;
      color: var(--el-warm-gray, #a9b1ba) !important;
    }
  `]
})
export class OwnerDashboardComponent {
  private router = inject(Router);

  kpis: KpiCard[] = [
    { label: 'Propiedades', value: '3', change: '1 en mantenimiento', positive: false, icon: 'pi pi-building' },
    { label: 'Servicios Activos', value: '4', change: '2 esta semana', positive: true, icon: 'pi pi-wrench' },
    { label: 'Completados', value: '12', change: '100% satisfacción', positive: true, icon: 'pi pi-check-circle' },
    { label: 'Gastos del Mes', value: '$1,250', change: '15% menos que el mes pasado', positive: true, icon: 'pi pi-dollar' },
    { label: 'Próximo Servicio', value: 'Mañana 10am', change: 'Mantenimiento Programado', positive: true, icon: 'pi pi-clock' },
  ];

  recentServices: ServiceItem[] = [
    { id: 1, technician: 'Carlos Martínez', service: 'Reparación Eléctrica', date: 'Hoy, 4:00 PM', status: 'En Proceso' },
    { id: 2, technician: 'Ana López', service: 'Instalación Panel Solar', date: 'Mañana, 9:00 AM', status: 'Programado' },
    { id: 3, technician: 'Roberto Díaz', service: 'Mantenimiento General', date: '12 May, 2:00 PM', status: 'Completado' },
    { id: 4, technician: 'María García', service: 'Domótica Smart Home', date: '14 May, 10:00 AM', status: 'Completado' },
  ];

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' | null | undefined {
    switch (status) {
      case 'Completado': return 'success';
      case 'Programado': return 'info';
      case 'En Proceso': return 'warn';
      default: return 'contrast';
    }
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
