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
    <div class="p-6 max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-[var(--el-primary)] flex items-center gap-2">
          <i class="pi pi-briefcase text-2xl"></i>
          Métricas de Desempeño e Ingresos
        </h1>
        <p class="text-sm text-[var(--el-warm-gray)] mt-1">Resumen general de actividad técnica, ganancias y evaluaciones</p>
      </div>

      <!-- Tarjetas KPI -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- KPI 1: Servicios completados -->
        <p-card styleClass="shadow-xl border border-gray-100 rounded-3xl p-2 bg-white">
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else kpi1" class="py-2">
              <p-skeleton width="80px" height="36px" borderRadius="8px" styleClass="mb-2" />
              <p-skeleton width="140px" height="16px" borderRadius="4px" />
            </div>
            <ng-template #kpi1>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-4xl font-extrabold text-[var(--el-primary)]">
                    {{ analyticsStore.performanceData()?.totalServicesCompleted || 0 }}
                  </p>
                  <p class="text-sm font-semibold text-[var(--el-warm-gray)] mt-1">Total servicios completados</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <i class="pi pi-check-circle text-2xl text-blue-500"></i>
                </div>
              </div>
            </ng-template>
          </ng-template>
        </p-card>

        <!-- KPI 2: Rating promedio -->
        <p-card styleClass="shadow-xl border border-gray-100 rounded-3xl p-2 bg-white">
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else kpi2" class="py-2">
              <p-skeleton width="80px" height="36px" borderRadius="8px" styleClass="mb-2" />
              <p-skeleton width="140px" height="16px" borderRadius="4px" />
            </div>
            <ng-template #kpi2>
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-4xl font-extrabold text-[var(--el-primary)]">
                      {{ analyticsStore.performanceData()?.averageRating || '0.0' }}
                    </p>
                    <i class="pi pi-star-fill text-amber-500 text-xl"></i>
                  </div>
                  <p class="text-sm font-semibold text-[var(--el-warm-gray)] mt-1">Rating promedio</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <i class="pi pi-star text-2xl text-amber-500"></i>
                </div>
              </div>
            </ng-template>
          </ng-template>
        </p-card>

        <!-- KPI 3: Ingresos este mes -->
        <p-card styleClass="shadow-xl border border-gray-100 rounded-3xl p-2 bg-white">
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else kpi3" class="py-2">
              <p-skeleton width="120px" height="36px" borderRadius="8px" styleClass="mb-2" />
              <p-skeleton width="140px" height="16px" borderRadius="4px" />
            </div>
            <ng-template #kpi3>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-4xl font-extrabold text-green-600">
                    S/ {{ currentMonthEarnings() }}
                  </p>
                  <p class="text-sm font-semibold text-[var(--el-warm-gray)] mt-1">Ingresos este mes</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                  <i class="pi pi-dollar text-2xl text-green-500"></i>
                </div>
              </div>
            </ng-template>
          </ng-template>
        </p-card>
      </div>

      <!-- Sección de Gráfico y Tabla -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Gráfico de Barras (Ingresos por mes) -->
        <div class="lg:col-span-2">
          <p-card styleClass="shadow-xl border border-gray-100 rounded-3xl p-4 bg-white h-full">
            <ng-template pTemplate="title">
              <div class="flex items-center gap-2 text-lg font-bold text-[var(--el-primary)] mb-2">
                <i class="pi pi-chart-line text-green-500"></i>
                Ingresos por mes (últimos 6 meses)
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div *ngIf="analyticsStore.loading(); else chart" class="py-4">
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

        <!-- Tabla de Servicios Recientes -->
        <div class="lg:col-span-1">
          <p-card styleClass="shadow-xl border border-gray-100 rounded-3xl p-4 bg-white h-full overflow-hidden">
            <ng-template pTemplate="title">
              <div class="flex items-center gap-2 text-lg font-bold text-[var(--el-primary)] mb-2">
                <i class="pi pi-list text-blue-500"></i>
                Servicios recientes
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <p-table [value]="recentServices()" [scrollable]="true" scrollHeight="280px" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th class="text-xs text-gray-500 font-semibold uppercase">Fecha</th>
                    <th class="text-xs text-gray-500 font-semibold uppercase">Cliente</th>
                    <th class="text-xs text-gray-500 font-semibold uppercase text-right">Monto</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="text-xs text-gray-600 py-3">{{ item.date }}</td>
                    <td class="text-xs font-medium text-gray-800 py-3">{{ item.clientName }}</td>
                    <td class="text-xs font-bold text-green-600 py-3 text-right">S/ {{ item.amount }}</td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="3" class="text-center py-6 text-sm text-gray-400">No hay servicios recientes</td>
                  </tr>
                </ng-template>
              </p-table>
            </ng-template>
          </p-card>
        </div>
      </div>
    </div>
  `
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
