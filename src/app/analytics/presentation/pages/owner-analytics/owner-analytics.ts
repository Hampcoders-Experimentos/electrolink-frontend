import {
  AfterViewInit, ChangeDetectionStrategy, Component, computed, effect,
  ElementRef, inject, OnDestroy, OnInit, signal, viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AnalyticsStore } from '@analytics/application/analytics-store.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

Chart.register(...registerables);

/**
 * Owner analytics dashboard.
 *
 * Renders two Chart.js canvases (bar + line) summarizing kWh consumption
 * and the related billing amounts for the current owner. Charts are driven
 * by an Angular `effect()` keyed to a {@link chartData} computed signal —
 * any update to the store's `consumptionData()` repaints both charts with
 * no manual subscription bookkeeping.
 *
 * ### State signals
 * - {@link selectedMonths}        - Active range (6 or 12 months).
 * - {@link hasExceededThreshold}  - True when any month exceeded 220 kWh.
 *
 * ### External store dependencies
 * - {@link AnalyticsStore} — owns `loadConsumption`, `consumptionData()`,
 *   and the `loading()` flag consumed by the skeleton placeholders.
 *
 * ### Lifecycle
 * - `ngOnInit`         - Initial fetch (12 months by default).
 * - `ngAfterViewInit`  - First chart render once the `<canvas>` is in the DOM.
 * - `ngOnDestroy`      - Destroys both Chart.js instances to free GPU memory.
 *
 * ### Performance
 * - `OnPush` + Signal-only state keeps the component zoneless-friendly.
 * - Charts are repainted via `effect()`, not by Angular CD ticks.
 */
@Component({
  selector: 'el-owner-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent],
  templateUrl: './owner-analytics.html',
  styleUrl: './owner-analytics.css',
})
export class OwnerAnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  analyticsStore = inject(AnalyticsStore);

  private readonly barCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barCanvas');
  private readonly lineCanvas = viewChild<ElementRef<HTMLCanvasElement>>('lineCanvas');
  private barChart?: Chart;
  private lineChart?: Chart;

  selectedMonths = signal(12);

  private readonly chartData = computed(() => {
    const data = this.analyticsStore.consumptionData();
    return {
      labels: data.map(d => d.month),
      consumption: data.map(d => d.energyConsumed),
      amounts: data.map(d => d.amountPaid),
    };
  });

  hasExceededThreshold = computed(() =>
    this.analyticsStore.consumptionData().some(item => item.energyConsumed > 220)
  );

  constructor() {
    effect(() => {
      const d = this.chartData();
      this.updateCharts(d.labels, d.consumption, d.amounts);
    });
  }

  ngOnInit(): void {
    this.analyticsStore.loadConsumption(1, 12).subscribe();
  }

  ngAfterViewInit(): void {
    const d = this.chartData();
    this.updateCharts(d.labels, d.consumption, d.amounts);
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.lineChart?.destroy();
  }

  onMonthChange(months: number): void {
    this.selectedMonths.set(months);
    this.analyticsStore.loadConsumption(1, months).subscribe();
  }

  private updateCharts(labels: string[], consumption: number[], amounts: number[]): void {
    const bar = this.barCanvas()?.nativeElement;
    if (bar) {
      this.barChart?.destroy();
      this.barChart = new Chart(bar, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Consumo (kWh)',
            data: consumption,
            backgroundColor: '#2e3a59',
            borderRadius: 8,
            barThickness: 32,
          }],
        },
        options: this.commonOptions(),
      });
    }

    const line = this.lineCanvas()?.nativeElement;
    if (line) {
      this.lineChart?.destroy();
      this.lineChart = new Chart(line, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Monto Facturado (S/)',
            data: amounts,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#10b981',
          }],
        },
        options: this.commonOptions(),
      });
    }
  }

  private commonOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top' as const } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } },
      },
    };
  }
}
