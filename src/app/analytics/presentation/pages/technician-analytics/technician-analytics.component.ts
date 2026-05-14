import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { AnalyticsStore } from '../../../application/analytics-store.service';

@Component({
  selector: 'el-technician-analytics',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    SkeletonModule,
    TagModule
  ],
  template: `
    <div class="el-tech-page">
      <div class="el-tech-header">
        <h1 class="el-tech-title">
          <i class="pi pi-briefcase"></i>
          Métricas de Desempeño e Ingresos
        </h1>
        <p class="el-tech-subtitle">Resumen general de actividad técnica, ganancias y evaluaciones</p>
      </div>

      <div class="el-tech-kpi-grid">
        <p-card styleClass="el-tech-kpi-card">
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else kpi1" class="el-tech-kpi-skeleton">
              <p-skeleton width="80px" height="36px" borderRadius="8px" styleClass="el-tech-kpi-skel" />
              <p-skeleton width="140px" height="16px" borderRadius="4px" />
            </div>
            <ng-template #kpi1>
              <div class="el-tech-kpi-inner">
                <div>
                  <p class="el-tech-kpi-value">{{ analyticsStore.performanceData()?.totalServicesCompleted || 0 }}</p>
                  <p class="el-tech-kpi-label">Total servicios completados</p>
                </div>
                <div class="el-tech-kpi-icon el-tech-kpi-icon-blue">
                  <i class="pi pi-check-circle"></i>
                </div>
              </div>
            </ng-template>
          </ng-template>
        </p-card>

        <p-card styleClass="el-tech-kpi-card">
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else kpi2" class="el-tech-kpi-skeleton">
              <p-skeleton width="80px" height="36px" borderRadius="8px" styleClass="el-tech-kpi-skel" />
              <p-skeleton width="140px" height="16px" borderRadius="4px" />
            </div>
            <ng-template #kpi2>
              <div class="el-tech-kpi-inner">
                <div>
                  <div class="el-tech-kpi-rating">
                    <p class="el-tech-kpi-value">{{ analyticsStore.performanceData()?.averageRating || '0.0' }}</p>
                    <i class="pi pi-star-fill"></i>
                  </div>
                  <p class="el-tech-kpi-label">Rating promedio</p>
                </div>
                <div class="el-tech-kpi-icon el-tech-kpi-icon-amber">
                  <i class="pi pi-star"></i>
                </div>
              </div>
            </ng-template>
          </ng-template>
        </p-card>

        <p-card styleClass="el-tech-kpi-card">
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else kpi3" class="el-tech-kpi-skeleton">
              <p-skeleton width="120px" height="36px" borderRadius="8px" styleClass="el-tech-kpi-skel" />
              <p-skeleton width="140px" height="16px" borderRadius="4px" />
            </div>
            <ng-template #kpi3>
              <div class="el-tech-kpi-inner">
                <div>
                  <p class="el-tech-kpi-value el-tech-kpi-value-green">S/ {{ currentMonthEarnings() }}</p>
                  <p class="el-tech-kpi-label">Ingresos este mes</p>
                </div>
                <div class="el-tech-kpi-icon el-tech-kpi-icon-green">
                  <i class="pi pi-dollar"></i>
                </div>
              </div>
            </ng-template>
          </ng-template>
        </p-card>
      </div>

      <div class="el-tech-bottom-grid">
        <div class="el-tech-chart-col">
          <p-card styleClass="el-tech-bottom-card">
            <ng-template pTemplate="title">
              <div class="el-tech-bottom-card-title">
                <i class="pi pi-chart-line"></i>
                Ingresos por mes (últimos 6 meses)
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div *ngIf="analyticsStore.loading(); else chart" class="el-tech-skeleton-area">
                <p-skeleton width="100%" height="250px" borderRadius="16px" />
              </div>
              <ng-template #chart>
                <div style="height: 300px; width: 100%;">
                  <p-chart type="bar" [data]="revenueChartData()" [options]="chartOptions" height="300px" />
                </div>
              </ng-template>
            </ng-template>
          </p-card>
        </div>

        <div class="el-tech-table-col">
          <p-card styleClass="el-tech-bottom-card">
            <ng-template pTemplate="title">
              <div class="el-tech-bottom-card-title">
                <i class="pi pi-list"></i>
                Servicios recientes
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <p-table [value]="recentServices()" [scrollable]="true" scrollHeight="280px" styleClass="el-tech-table">
                <ng-template pTemplate="header">
                  <tr>
                    <th class="el-tech-th">Fecha</th>
                    <th class="el-tech-th">Cliente</th>
                    <th class="el-tech-th el-tech-th-right">Monto</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                  <tr class="el-tech-tr">
                    <td class="el-tech-td">{{ item.date }}</td>
                    <td class="el-tech-td el-tech-td-medium">{{ item.clientName }}</td>
                    <td class="el-tech-td el-tech-td-bold el-tech-td-right">S/ {{ item.amount }}</td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="3" class="el-tech-empty">No hay servicios recientes</td>
                  </tr>
                </ng-template>
              </p-table>
            </ng-template>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .el-tech-page { padding: 24px; max-width: 1280px; margin: 0 auto; }
    .el-tech-header { margin-bottom: 24px; }
    .el-tech-title { font-size: 24px; font-weight: 700; color: var(--el-primary); display: flex; align-items: center; gap: 8px; margin: 0; }
    .el-tech-title i { font-size: 24px; }
    .el-tech-subtitle { font-size: 14px; color: var(--el-warm-gray); margin: 4px 0 0 0; }

    .el-tech-kpi-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 32px; }
    @media (min-width: 768px) { .el-tech-kpi-grid { grid-template-columns: 1fr 1fr 1fr; } }

    .el-tech-kpi-inner { display: flex; align-items: center; justify-content: space-between; }
    .el-tech-kpi-value { font-size: 36px; font-weight: 800; color: var(--el-primary); margin: 0; }
    .el-tech-kpi-value-green { color: #16a34a; }
    .el-tech-kpi-label { font-size: 14px; font-weight: 600; color: var(--el-warm-gray); margin: 4px 0 0 0; }
    .el-tech-kpi-rating { display: flex; align-items: center; gap: 8px; }
    .el-tech-kpi-rating i { font-size: 20px; color: #f59e0b; }

    .el-tech-kpi-icon { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .el-tech-kpi-icon i { font-size: 24px; }
    .el-tech-kpi-icon-blue { background: #eff6ff; }
    .el-tech-kpi-icon-blue i { color: #3b82f6; }
    .el-tech-kpi-icon-amber { background: #fffbeb; }
    .el-tech-kpi-icon-amber i { color: #f59e0b; }
    .el-tech-kpi-icon-green { background: #f0fdf4; }
    .el-tech-kpi-icon-green i { color: #22c55e; }

    .el-tech-kpi-skeleton { padding: 8px 0; }
    .el-tech-kpi-skel { margin-bottom: 8px; }

    .el-tech-bottom-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
    @media (min-width: 1024px) { .el-tech-bottom-grid { grid-template-columns: 2fr 1fr; } }

    .el-tech-bottom-card-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: var(--el-primary); margin-bottom: 8px; }
    .el-tech-bottom-card-title .pi-chart-line { color: #22c55e; }
    .el-tech-bottom-card-title .pi-list { color: #3b82f6; }

    .el-tech-skeleton-area { padding: 16px 0; }

    .el-tech-th { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; }
    .el-tech-th-right { text-align: right; }
    .el-tech-tr { }
    .el-tech-tr:hover { background: #f9fafb; }
    .el-tech-td { font-size: 12px; color: #4b5563; padding: 12px 0; }
    .el-tech-td-medium { font-weight: 500; color: #1f2937; }
    .el-tech-td-bold { font-weight: 700; color: #16a34a; }
    .el-tech-td-right { text-align: right; }
    .el-tech-empty { text-align: center; padding: 24px 0; font-size: 14px; color: #9ca3af; }
  `]
})
export class TechnicianAnalyticsComponent implements OnInit {
  analyticsStore = inject(AnalyticsStore);

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  currentMonthEarnings = computed(() => {
    const data = this.analyticsStore.revenueData();
    if (!data || data.length === 0) return 0;
    return data[data.length - 1].totalRevenue;
  });

  recentServices = computed(() => {
    const data = this.analyticsStore.revenueData();
    if (!data || data.length === 0) return [];
    return data[data.length - 1].recentServices || [];
  });

  revenueChartData = computed(() => {
    const data = this.analyticsStore.revenueData();
    return {
      labels: data.map(item => item.period),
      datasets: [
        {
          label: 'Ingresos Mensuales (S/)',
          data: data.map(item => item.totalRevenue),
          backgroundColor: '#10b981', // --el-success
          borderRadius: 8,
          barThickness: 32
        }
      ]
    };
  });

  ngOnInit(): void {
    this.analyticsStore.loadPerformance(1).subscribe();
    this.analyticsStore.loadRevenue(1, 6).subscribe();
  }
}
