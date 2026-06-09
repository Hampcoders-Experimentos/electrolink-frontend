import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MonitoringStore } from '@monitoring/application/monitoring-store.service';
import { CreateRatingResource } from '@monitoring/infrastructure/rating-response';
import { NotificationsService } from '@shared/application/notifications.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

type StatusKey = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;

const STATUS_BADGE: Record<string, string> = {
  PENDING:     'bg-slate-100 text-slate-700 ring-slate-200',
  IN_PROGRESS: 'bg-sky-100 text-sky-700 ring-sky-200',
  COMPLETED:   'bg-emerald-100 text-emerald-700 ring-emerald-200',
  CANCELLED:   'bg-rose-100 text-rose-700 ring-rose-200',
};

/**
 * Live service-operation view.
 *
 * Mounted from the technician timeline route: drives an in-progress service
 * job through its state machine (PENDING → IN_PROGRESS → COMPLETED /
 * CANCELLED), captures supporting photos, and collects the post-completion
 * client rating.
 *
 * ### State signals
 * - {@link uploadedPhotos}    - Local `URL.createObjectURL` blobs for previews.
 * - {@link showRatingDialog}  - Drives the post-completion rating dialog.
 * - {@link ratingScore}       - Star score selected in the dialog (1–5).
 * - {@link ratingComment}     - Free-text comment captured alongside the score.
 *
 * ### External dependencies
 * - {@link MonitoringStore}      - Loads the operation, transitions status,
 *   exposes `canStart` / `canComplete` / `canCancel` derived signals and
 *   submits the final rating.
 * - {@link NotificationsService} - Surfaces success/warn/error toasts.
 *
 * ### Lifecycle
 * - `ngOnInit` resolves the request id from the route and asks the store to
 *   fetch the operation. Errors surface as a toast and never break the page.
 */
@Component({
  selector: 'el-active-service',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, IconComponent],
  templateUrl: './active-service.html',
  styleUrl: './active-service.css',
})
export class ActiveServiceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notifications = inject(NotificationsService);
  store = inject(MonitoringStore);

  operation = this.store.currentServiceOperation;
  errorMessage = this.store.errorMessage;

  uploadedPhotos = signal<string[]>([]);
  showRatingDialog = signal<boolean>(false);
  ratingScore = signal<number>(5);
  ratingComment = signal<string>('');

  mockRequestInfo = {
    clientName: 'Carlos Mendoza',
    address: 'Av. Javier Prado 1234, San Isidro',
    serviceName: 'Instalación de Tomacorrientes y Tablero',
    scheduledTime: 'Hoy, 14:00 hrs'
  };

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('id') || 'req-1';
    this.store.loadServiceOperation(requestId).subscribe({
      error: () => this.notifications.showError('Error', 'No se pudo cargar la operación del servicio.')
    });
  }

  goBack(): void { this.router.navigate(['/technician/dashboard']).then(); }

  startService(): void {
    this.store.updateStatus('IN_PROGRESS').subscribe({
      next: () => this.notifications.showSuccess('Servicio Iniciado', 'El cronómetro y seguimiento en vivo están activos.')
    });
  }

  completeService(): void {
    this.store.updateStatus('COMPLETED').subscribe({
      next: () => {
        this.notifications.showSuccess('Servicio Finalizado', 'El trabajo ha sido registrado exitosamente.');
        this.showRatingDialog.set(true);
      }
    });
  }

  cancelService(): void {
    this.store.updateStatus('CANCELLED').subscribe({
      next: () => {
        this.notifications.showWarn('Servicio Cancelado', 'Se ha notificado la cancelación de la solicitud.');
        setTimeout(() => this.goBack(), 1500);
      }
    });
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        const objectUrl = URL.createObjectURL(file);
        this.uploadedPhotos.update(photos => [...photos, objectUrl]);
      }
      this.notifications.showSuccess('Fotos subidas', `Se adjuntaron ${files.length} fotografía(s) exitosamente.`);
    }
    input.value = '';
  }

  getRatingDescription(): string {
    return {
      1: '1 Estrella - Deficiente',
      2: '2 Estrellas - Regular',
      3: '3 Estrellas - Bueno',
      4: '4 Estrellas - Muy Bueno',
      5: '5 Estrellas - Excelente'
    }[this.ratingScore()] || '5 Estrellas - Excelente';
  }

  submitRating(): void {
    const currentOp = this.operation();
    if (!currentOp) return;

    const resource: CreateRatingResource = {
      requestId: currentOp.requestId,
      technicianId: currentOp.technicianId,
      raterId: currentOp.technicianId,
      score: this.ratingScore(),
      comment: this.ratingComment()
    };

    this.store.addRating(resource).subscribe({
      next: () => {
        this.notifications.showSuccess('¡Gracias!', 'Tu calificación ayuda a mantener la confianza en la comunidad.');
        this.showRatingDialog.set(false);
        setTimeout(() => this.goBack(), 1500);
      }
    });
  }

  skipRating(): void {
    this.showRatingDialog.set(false);
    this.goBack();
  }

  getStatusLabel(status: StatusKey): string {
    return {
      PENDING:     'Programado / Pendiente',
      IN_PROGRESS: 'En Curso (Ejecutando)',
      COMPLETED:   'Trabajo Finalizado',
      CANCELLED:   'Solicitud Cancelada'
    }[status] || status;
  }

  badge(status: string): string {
    return STATUS_BADGE[status] || STATUS_BADGE['PENDING'];
  }

  mapIcon(rawIcon: string): string {
    const tokens = (rawIcon || '').split(/\s+/);
    const candidate = tokens.reverse().find(t => t.startsWith('pi-') && t !== 'pi-spin');
    const name = (candidate || '').replace(/^pi-/, '');
    return name || 'info-circle';
  }
}
