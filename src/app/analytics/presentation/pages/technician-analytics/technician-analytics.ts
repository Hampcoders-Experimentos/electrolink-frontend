import {
  AfterViewInit, ChangeDetectionStrategy, Component, computed, effect,
  ElementRef, inject, OnDestroy, OnInit, viewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AnalyticsStore } from '@analytics/application/analytics-store.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

Chart.register(...registerables);

/**
 * Technician analytics dashboard.
 *
 * Surfaces three KPI tiles (total services, average rating, monthly
 * earnings), a 6-month revenue bar chart and the most recent service list.
 *
 * ### State signals
 * - {@link currentMonthEarnings} - Earnings reported for the last revenue period.
 * - {@link recentServices}       - List of last-period services for the side table.
 *
 * ### External store dependencies
 * - {@link AnalyticsStore} — `loadPerformance`, `loadRevenue`, plus the
 *   read-only `performanceData()`, `revenueData()`, `loading()` signals.
 *
 * ### Lifecycle
 * - `ngOnInit`        - Issues parallel `loadPerformance`/`loadRevenue` calls.
 * - `ngAfterViewInit` - Renders the chart once the canvas is mounted.
 * - `ngOnDestroy`     - Destroys the Chart.js instance to release resources.
 */
@Component({
  selector: 'el-technician-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './technician-analytics.html',
  styleUrl: './technician-analytics.css',
})
export class TechnicianAnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  analyticsStore = inject(AnalyticsStore);

  private readonly barCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barCanvas');
  private chart?: Chart;

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

  private readonly revenueChartData = computed(() => {
    const data = this.analyticsStore.revenueData();
    return {
      labels: data.map(item => item.period),
      values: data.map(item => item.totalRevenue),
    };
  });

  constructor() {
    effect(() => {
      const d = this.revenueChartData();
      this.renderChart(d.labels, d.values);
    });
  }

  ngOnInit(): void {
    this.analyticsStore.loadPerformance(1).subscribe();
    this.analyticsStore.loadRevenue(1, 6).subscribe();
  }

  ngAfterViewInit(): void {
    const d = this.revenueChartData();
    this.renderChart(d.labels, d.values);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(labels: string[], values: number[]): void {
    const canvas = this.barCanvas()?.nativeElement;
    if (!canvas) return;
    this.chart?.destroy();
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ingresos Mensuales (S/)',
          data: values,
          backgroundColor: '#10b981',
          borderRadius: 8,
          barThickness: 32,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' as const } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } },
        },
      },
    });
  }
}
