import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { AnalyticsStore } from '../../../application/analytics-store.service';

@Component({
  selector: 'el-owner-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    SelectModule,
    MessageModule,
    SkeletonModule
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[var(--el-primary)] flex items-center gap-2">
            <i class="pi pi-chart-bar text-2xl"></i>
            Mi Consumo Eléctrico
          </h1>
          <p class="text-sm text-[var(--el-warm-gray)] mt-1">Monitorea el historial de energía consumida y facturación</p>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-gray-700">Período:</span>
          <p-select
            [options]="monthOptions"
            [(ngModel)]="selectedMonths"
            optionLabel="label"
            optionValue="value"
            (ngModelChange)="onMonthChange($event)"
            styleClass="w-48 rounded-xl shadow-sm"
          />
        </div>
      </div>

      <!-- Alerta si excede umbral -->
      <p-message *ngIf="hasExceededThreshold()" severity="warn" styleClass="mb-6 w-full rounded-2xl border border-amber-500/30 shadow-lg">
        <div class="flex items-center gap-3 py-1">
          <i class="pi pi-exclamation-triangle text-xl text-amber-600"></i>
          <span class="text-sm font-semibold text-amber-900">
            ¡Atención! Tu consumo de energía ha excedido el umbral recomendado de 220 kWh en uno o más meses.
          </span>
        </div>
      </p-message>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gráfico de Barras: Consumo Mensual -->
        <p-card styleClass="shadow-xl border border-gray-100 rounded-3xl p-2 bg-white">
          <ng-template pTemplate="title">
            <div class="flex items-center gap-2 text-lg font-bold text-[var(--el-primary)]">
              <i class="pi pi-bolt text-amber-500"></i>
              Consumo mensual (kWh)
            </div>
          </ng-template>
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else barChart" class="flex flex-col gap-4 py-4">
              <p-skeleton width="100%" height="250px" borderRadius="16px" />
            </div>
            <ng-template #barChart>
              <div style="height: 300px; width: 100%;">
                <p-chart type="bar" [data]="barChartData()" [options]="chartOptions" height="300px" />
              </div>
            </ng-template>
          </ng-template>
        </p-card>

        <!-- Gráfico de Líneas: Monto Pagado -->
        <p-card styleClass="shadow-xl border border-gray-100 rounded-3xl p-2 bg-white">
          <ng-template pTemplate="title">
            <div class="flex items-center gap-2 text-lg font-bold text-[var(--el-primary)]">
              <i class="pi pi-money-bill text-green-500"></i>
              Monto pagado (S/)
            </div>
          </ng-template>
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else lineChart" class="flex flex-col gap-4 py-4">
              <p-skeleton width="100%" height="250px" borderRadius="16px" />
            </div>
            <ng-template #lineChart>
              <div style="height: 300px; width: 100%;">
                <p-chart type="line" [data]="lineChartData()" [options]="chartOptions" height="300px" />
              </div>
            </ng-template>
          </ng-template>
        </p-card>
      </div>
    </div>
  `
})
export class OwnerAnalyticsComponent implements OnInit {
  analyticsStore = inject(AnalyticsStore);

  monthOptions = [
    { label: 'Últimos 6 meses', value: 6 },
    { label: 'Últimos 12 meses', value: 12 }
  ];
  selectedMonths = signal(12);

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

  barChartData = computed(() => {
    const data = this.analyticsStore.consumptionData();
    return {
      labels: data.map(item => item.month),
      datasets: [
        {
          label: 'Consumo (kWh)',
          data: data.map(item => item.energyConsumed),
          backgroundColor: '#2e3a59', // --el-primary
          borderRadius: 8,
          barThickness: 32
        }
      ]
    };
  });

  lineChartData = computed(() => {
    const data = this.analyticsStore.consumptionData();
    return {
      labels: data.map(item => item.month),
      datasets: [
        {
          label: 'Monto Facturado (S/)',
          data: data.map(item => item.amountPaid),
          borderColor: '#10b981', // --el-success
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#10b981'
        }
      ]
    };
  });

  hasExceededThreshold = computed(() => {
    const data = this.analyticsStore.consumptionData();
    return data.some(item => item.energyConsumed > 220);
  });

  ngOnInit(): void {
    this.analyticsStore.loadConsumption(1, 12).subscribe();
  }

  onMonthChange(months: number): void {
    this.selectedMonths.set(months);
    this.analyticsStore.loadConsumption(1, months).subscribe();
  }
}
