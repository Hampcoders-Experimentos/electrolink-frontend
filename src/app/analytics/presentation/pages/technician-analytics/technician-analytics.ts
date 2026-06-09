import {
  AfterViewInit, ChangeDetectionStrategy, Component, computed, effect,
  ElementRef, inject, OnDestroy, OnInit, viewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AnalyticsStore } from '../../../application/analytics-store.service';
import { IconComponent } from '../../../../shared/presentation/components/icon/icon';

Chart.register(...registerables);

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
