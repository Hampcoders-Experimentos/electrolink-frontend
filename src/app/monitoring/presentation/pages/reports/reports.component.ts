import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { MonitoringStore } from '../../../application/monitoring-store.service';
import { ReportType } from '../../../domain/model/report.entity';
import { CreateReportResource } from '../../../infrastructure/report-response';

export type TagSeverity = 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' | undefined;

@Component({
  selector: 'el-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    TagModule,
    SelectModule,
    TextareaModule,
    ToastModule,
    MessageModule
  ],
  providers: [MessageService],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold mb-1" style="color: var(--el-primary, #2E3A59)">
            <i class="pi pi-file-edit mr-2 text-blue-500"></i>Reportes Técnicos
          </h1>
          <p class="text-sm text-slate-500">Historial de incidencias y registros de mantenimiento de servicios</p>
        </div>

        <p-button
          label="Nuevo Reporte Técnico"
          icon="pi pi-plus"
          severity="primary"
          styleClass="font-bold shadow-md"
          (onClick)="openNewReportDialog()"
        />
      </div>

      <p-message *ngIf="errorMessage()" severity="error" [text]="errorMessage() || ''" styleClass="mb-6 w-full" />

      <!-- Tabla de Reportes -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <p-table
          [value]="reports()"
          [loading]="loading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          responsiveLayout="stack"
          styleClass="p-datatable-sm"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr class="bg-slate-50 text-slate-700 text-xs font-bold uppercase border-b border-slate-200">
              <th pSortableColumn="id" class="p-4">ID <p-sortIcon field="id" /></th>
              <th pSortableColumn="reportType" class="p-4">Tipo <p-sortIcon field="reportType" /></th>
              <th pSortableColumn="description" class="p-4">Descripción <p-sortIcon field="description" /></th>
              <th pSortableColumn="createdAt" class="p-4">Fecha de Creación <p-sortIcon field="createdAt" /></th>
              <th class="p-4 text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-report>
            <tr class="border-b border-slate-100 text-sm text-slate-700 hover:bg-slate-50">
              <td class="p-4 font-mono font-semibold">{{ report.id }}</td>
              <td class="p-4">
                <p-tag
                  [value]="getReportTypeName(report.reportType)"
                  [severity]="getReportTypeSeverity(report.reportType)"
                  styleClass="font-bold px-2 py-1 text-xs"
                />
              </td>
              <td class="p-4 max-w-xs truncate">{{ report.description }}</td>
              <td class="p-4 text-slate-500">{{ report.createdAt | date:'medium' }}</td>
              <td class="p-4 text-center">
                <p-button
                  icon="pi pi-eye"
                  severity="secondary"
                  [text]="true"
                  [rounded]="true"
                  pTooltip="Ver Detalle"
                  (onClick)="viewReportDetail(report)"
                />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="empty">
            <tr>
              <td colspan="5" class="text-center p-8 text-slate-400">
                <i class="pi pi-inbox text-4xl mb-2"></i>
                <p>No se encontraron reportes técnicos registrados.</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Diálogo de Nuevo Reporte -->
      <p-dialog
        [(visible)]="showDialog"
        [modal]="true"
        [style]="{ width: '500px' }"
        header="Registrar Reporte Técnico"
        styleClass="rounded-2xl shadow-xl"
      >
        <div class="flex flex-col gap-4 py-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-bold text-slate-700">Tipo de Reporte</label>
            <p-select
              [(ngModel)]="selectedReportType"
              [options]="reportTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione el tipo"
              styleClass="w-full rounded-xl border-slate-300"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-bold text-slate-700">Operación de Servicio Asociada (ID)</label>
            <input
              type="text"
              [(ngModel)]="serviceOperationId"
              placeholder="Ej. op-123"
              class="w-full p-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-bold text-slate-700">Descripción Detallada</label>
            <textarea
              pTextarea
              [(ngModel)]="reportDescription"
              rows="4"
              placeholder="Describa el estado encontrado, los trabajos realizados y/o las piezas reemplazadas..."
              class="w-full p-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500"
            ></textarea>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-3 w-full">
            <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="showDialog.set(false)" />
            <p-button label="Guardar Reporte" icon="pi pi-check" severity="primary" [loading]="loading()" (onClick)="saveReport()" />
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private messageService = inject(MessageService);
  store = inject(MonitoringStore);

  reports = this.store.reports;
  loading = this.store.loading;
  errorMessage = this.store.errorMessage;

  showDialog = signal<boolean>(false);
  selectedReportType = signal<ReportType>('INCIDENT');
  serviceOperationId = signal<string>('op-1');
  reportDescription = signal<string>('');

  reportTypeOptions = [
    { label: '🔴 Incidencia / Falla', value: 'INCIDENT' },
    { label: '🟢 Mantenimiento Correctivo/Preventivo', value: 'MAINTENANCE' },
    { label: '⚪ Otro Hallazgo', value: 'OTHER' }
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
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe ingresar la descripción del reporte.'
      });
      return;
    }

    const resource: CreateReportResource = {
      serviceOperationId: this.serviceOperationId(),
      reportType: this.selectedReportType(),
      description: this.reportDescription()
    };

    this.store.addReport(resource).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Reporte Registrado',
          detail: 'El reporte técnico se ha guardado exitosamente.'
        });
        this.showDialog.set(false);
      }
    });
  }

  viewReportDetail(report: any): void {
    this.messageService.add({
      severity: 'info',
      summary: `Reporte #${report.id}`,
      detail: report.description
    });
  }

  getReportTypeName(type: ReportType): string {
    return {
      INCIDENT: 'Incidencia',
      MAINTENANCE: 'Mantenimiento',
      OTHER: 'Otro'
    }[type] || type;
  }

  getReportTypeSeverity(type: ReportType): TagSeverity {
    return {
      INCIDENT: 'danger' as TagSeverity,
      MAINTENANCE: 'success' as TagSeverity,
      OTHER: 'info' as TagSeverity
    }[type] || 'info';
  }
}
