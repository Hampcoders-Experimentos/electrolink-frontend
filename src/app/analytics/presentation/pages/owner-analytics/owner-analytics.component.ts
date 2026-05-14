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
    <div class="el-owner-page">
      <div class="el-owner-header">
        <div>
          <h1 class="el-owner-title">
            <i class="pi pi-chart-bar"></i>
            Mi Consumo Eléctrico
          </h1>
          <p class="el-owner-subtitle">Monitorea el historial de energía consumida y facturación</p>
        </div>
        <div class="el-owner-period">
          <span class="el-owner-period-label">Período:</span>
          <p-select
            [options]="monthOptions"
            [(ngModel)]="selectedMonths"
            optionLabel="label"
            optionValue="value"
            (ngModelChange)="onMonthChange($event)"
            styleClass="el-owner-period-select"
          />
        </div>
      </div>

      <p-message *ngIf="hasExceededThreshold()" severity="warn" styleClass="el-owner-alert">
        <div class="el-owner-warning">
          <i class="pi pi-exclamation-triangle"></i>
          <span class="el-owner-warning-text">
            ¡Atención! Tu consumo de energía ha excedido el umbral recomendado de 220 kWh en uno o más meses.
          </span>
        </div>
      </p-message>

      <div class="el-owner-chart-grid">
        <p-card styleClass="el-owner-card">
          <ng-template pTemplate="title">
            <div class="el-owner-card-title">
              <i class="pi pi-bolt"></i>
              Consumo mensual (kWh)
            </div>
          </ng-template>
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else barChart" class="el-owner-skeleton-area">
              <p-skeleton width="100%" height="250px" borderRadius="16px" />
            </div>
            <ng-template #barChart>
              <div style="height: 300px; width: 100%;">
                <p-chart type="bar" [data]="barChartData()" [options]="chartOptions" height="300px" />
              </div>
            </ng-template>
          </ng-template>
        </p-card>

        <p-card styleClass="el-owner-card">
          <ng-template pTemplate="title">
            <div class="el-owner-card-title">
              <i class="pi pi-money-bill"></i>
              Monto pagado (S/)
            </div>
          </ng-template>
          <ng-template pTemplate="content">
            <div *ngIf="analyticsStore.loading(); else lineChart" class="el-owner-skeleton-area">
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
  `,
  styles: [`
    :host { display: block; }
    .el-owner-page { padding: 24px; max-width: 1280px; margin: 0 auto; }
    .el-owner-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    @media (min-width: 768px) { .el-owner-header { flex-direction: row; justify-content: space-between; align-items: center; } }
    .el-owner-title { font-size: 24px; font-weight: 700; color: var(--el-primary); display: flex; align-items: center; gap: 8px; margin: 0; }
    .el-owner-title i { font-size: 24px; }
    .el-owner-subtitle { font-size: 14px; color: var(--el-warm-gray); margin: 4px 0 0 0; }
    .el-owner-period { display: flex; align-items: center; gap: 12px; }
    .el-owner-period-label { font-size: 14px; font-weight: 600; color: #374151; white-space: nowrap; }
    .el-owner-alert { margin-bottom: 24px; width: 100%; }
    .el-owner-warning { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
    .el-owner-warning i { font-size: 20px; color: #d97706; }
    .el-owner-warning-text { font-size: 14px; font-weight: 600; color: #78350f; }
    .el-owner-chart-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
    @media (min-width: 1024px) { .el-owner-chart-grid { grid-template-columns: 1fr 1fr; } }
    .el-owner-card-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: var(--el-primary); }
    .el-owner-card-title .pi-bolt { color: #f59e0b; }
    .el-owner-card-title .pi-money-bill { color: #10b981; }
    .el-owner-skeleton-area { display: flex; flex-direction: column; gap: 16px; padding: 16px 0; }
  `]
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
