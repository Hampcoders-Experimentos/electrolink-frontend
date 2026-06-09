import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoringStore } from '@monitoring/application/monitoring-store.service';
import { ReportType } from '@monitoring/domain/model/report.entity';
import { CreateReportResource } from '@monitoring/infrastructure/report-response';
import { NotificationsService } from '@shared/application/notifications.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

const TYPE_BADGE: Record<ReportType, string> = {
  INCIDENT:    'bg-rose-100 text-rose-700 ring-rose-200',
  MAINTENANCE: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  OTHER:       'bg-sky-100 text-sky-700 ring-sky-200',
};

@Component({
  selector: 'el-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, IconComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent implements OnInit {
  private notifications = inject(NotificationsService);
  store = inject(MonitoringStore);

  reports = this.store.reports;
  loading = this.store.loading;
  errorMessage = this.store.errorMessage;

  showDialog = signal<boolean>(false);
  selectedReportType = signal<ReportType>('INCIDENT');
  serviceOperationId = signal<string>('op-1');
  reportDescription = signal<string>('');

  page = signal(1);
  rows = 10;

  totalPages = computed(() => Math.max(1, Math.ceil(this.reports().length / this.rows)));
  pagedReports = computed(() => {
    const all = this.reports();
    const start = (this.page() - 1) * this.rows;
    return all.slice(start, start + this.rows);
  });

  reportTypeOptions = [
    { label: '🔴 Incidencia / Falla', value: 'INCIDENT' as ReportType },
    { label: '🟢 Mantenimiento Correctivo/Preventivo', value: 'MAINTENANCE' as ReportType },
    { label: '⚪ Otro Hallazgo', value: 'OTHER' as ReportType }
  ];

  ngOnInit(): void {
    this.store.loadReports('op-1').subscribe();
  }

  openNewReportDialog(): void {
    this.selectedReportType.set('INCIDENT');
    this.reportDescription.set('');
    this.showDialog.set(true);
  }

  saveReport(): void {
    if (!this.reportDescription().trim()) {
      this.notifications.showWarn('Atención', 'Debe ingresar la descripción del reporte.');
      return;
    }

    const resource: CreateReportResource = {
      serviceOperationId: this.serviceOperationId(),
      reportType: this.selectedReportType(),
      description: this.reportDescription()
    };

    this.store.addReport(resource).subscribe({
      next: () => {
        this.notifications.showSuccess('Reporte Registrado', 'El reporte técnico se ha guardado exitosamente.');
        this.showDialog.set(false);
      }
    });
  }

  viewReportDetail(report: { id: string | number; description: string }): void {
    this.notifications.showInfo(`Reporte #${report.id}`, report.description);
  }

  getReportTypeName(type: ReportType): string {
    return {
      INCIDENT: 'Incidencia',
      MAINTENANCE: 'Mantenimiento',
      OTHER: 'Otro'
    }[type] || type;
  }

  typeBadge(type: ReportType): string {
    return TYPE_BADGE[type] || TYPE_BADGE.OTHER;
  }
}
