import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MonitoringStore } from '../../../application/monitoring-store.service';
import { CreateRatingResource } from '../../../infrastructure/rating-response';

export type TagSeverity = 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' | undefined;

@Component({
  selector: 'el-active-service',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TimelineModule,
    CardModule,
    ButtonModule,
    TagModule,
    MessageModule,
    FileUploadModule,
    DialogModule,
    RatingModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <p-button icon="pi pi-arrow-left" severity="secondary" [text]="true" (onClick)="goBack()" />
          <h1 class="text-3xl font-bold" style="color: var(--el-primary, #2E3A59)">
            <i class="pi pi-bolt mr-2 text-yellow-500"></i>Seguimiento de Servicio Activo
          </h1>
        </div>
        <p-tag
          *ngIf="operation()"
          [value]="operation()?.status"
          [severity]="getStatusSeverity(operation()?.status || '')"
          styleClass="text-sm font-bold px-3 py-1"
        />
      </div>

      <p-message *ngIf="errorMessage()" severity="error" [text]="errorMessage() || ''" styleClass="mb-6 w-full" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Detalle del Servicio (Mock/ACL info) -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <p-card styleClass="shadow-sm border border-slate-200 rounded-xl">
            <ng-template pTemplate="title">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <i class="pi pi-info-circle text-blue-500"></i>
                <span class="text-xl font-bold">Información de la Solicitud</span>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Cliente</p>
                  <p class="text-base font-medium text-slate-800">{{ mockRequestInfo.clientName }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dirección</p>
                  <p class="text-base font-medium text-slate-800">{{ mockRequestInfo.address }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Servicio Solicitado</p>
                  <p class="text-base font-medium text-slate-800">{{ mockRequestInfo.serviceName }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fecha Programada</p>
                  <p class="text-base font-medium text-slate-800">{{ mockRequestInfo.scheduledTime }}</p>
                </div>
              </div>
            </ng-template>
          </p-card>

          <!-- Registro Fotográfico (Antes de finalizar) -->
          <p-card styleClass="shadow-sm border border-slate-200 rounded-xl">
            <ng-template pTemplate="title">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <i class="pi pi-camera text-blue-500"></i>
                <span class="text-xl font-bold">Registro Fotográfico Técnico</span>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <p class="text-sm text-slate-600 mb-4">
                Sube fotografías del antes y después para respaldar tu trabajo ante el cliente.
              </p>
              <p-fileUpload
                mode="advanced"
                [customUpload]="true"
                (uploadHandler)="onPhotoUpload($event)"
                accept="image/*"
                [maxFileSize]="5000000"
                chooseLabel="Seleccionar"
                uploadLabel="Subir Fotos"
                cancelLabel="Cancelar"
              >
                <ng-template pTemplate="empty">
                  <div class="flex flex-col items-center justify-center p-6 text-slate-400">
                    <i class="pi pi-cloud-upload text-4xl mb-2"></i>
                    <p>Arrastra imágenes aquí o haz clic en Seleccionar</p>
                  </div>
                </ng-template>
              </p-fileUpload>

              <div *ngIf="uploadedPhotos().length > 0" class="mt-6">
                <h4 class="text-sm font-bold text-slate-700 mb-3">Fotografías Subidas:</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div *ngFor="let photo of uploadedPhotos()" class="relative rounded-lg overflow-hidden border border-slate-200">
                    <img [src]="photo" alt="Report photo" class="w-full h-24 object-cover" />
                  </div>
                </div>
              </div>
            </ng-template>
          </p-card>
        </div>

        <!-- Columna Derecha: Timeline y Controles de Estado -->
        <div class="flex flex-col gap-6">
          <p-card styleClass="shadow-sm border border-slate-200 rounded-xl">
            <ng-template pTemplate="title">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <i class="pi pi-history text-blue-500"></i>
                <span class="text-xl font-bold">Estado del Servicio</span>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="py-4">
                <p-timeline [value]="store.timelineEvents()">
                  <ng-template pTemplate="marker" let-item>
                    <span
                      class="flex items-center justify-center w-8 h-8 rounded-full text-white shadow-md"
                      [style.backgroundColor]="item.color"
                    >
                      <i [class]="item.icon"></i>
                    </span>
                  </ng-template>
                  <ng-template pTemplate="content" let-item>
                    <div class="flex flex-col mb-4">
                      <span class="font-bold text-base text-slate-800">{{ getStatusLabel(item.status) }}</span>
                      <span class="text-xs text-slate-500">{{ item.timestamp | date:'medium' }}</span>
                    </div>
                  </ng-template>
                </p-timeline>
              </div>

              <!-- Botones de Acción según estado -->
              <div class="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <p-button
                  *ngIf="store.canStart()"
                  label="Iniciar Servicio"
                  icon="pi pi-play"
                  severity="info"
                  [loading]="store.loading()"
                  styleClass="w-full font-bold shadow-md"
                  (onClick)="startService()"
                />
                <p-button
                  *ngIf="store.canComplete()"
                  label="Finalizar Servicio"
                  icon="pi pi-check"
                  severity="success"
                  [loading]="store.loading()"
                  styleClass="w-full font-bold shadow-md"
                  (onClick)="completeService()"
                />
                <p-button
                  *ngIf="store.canCancel()"
                  label="Cancelar Solicitud"
                  icon="pi pi-times"
                  severity="danger"
                  [outlined]="true"
                  [loading]="store.loading()"
                  styleClass="w-full font-bold"
                  (onClick)="cancelService()"
                />
              </div>
            </ng-template>
          </p-card>
        </div>
      </div>

      <!-- Diálogo de Evaluación Mutua (Técnico evalúa al Propietario) -->
      <p-dialog
        [(visible)]="showRatingDialog"
        [modal]="true"
        [style]="{ width: '450px' }"
        header="Evalúa la Atención del Cliente"
        [closable]="false"
        styleClass="rounded-2xl shadow-2xl"
      >
        <div class="flex flex-col items-center gap-4 py-4 text-center">
          <i class="pi pi-star-fill text-yellow-500 text-5xl mb-2 animate-bounce"></i>
          <p class="text-slate-600">
            ¡Servicio completado con éxito! Por favor, califica tu experiencia trabajando con <strong>{{ mockRequestInfo.clientName }}</strong>.
          </p>

          <div class="flex flex-col items-center gap-2 my-2">
            <p-rating [(ngModel)]="ratingScore" [stars]="5" styleClass="text-3xl text-yellow-500" />
            <span class="text-sm font-bold text-slate-500">{{ getRatingDescription() }}</span>
          </div>

          <textarea
            pTextarea
            [(ngModel)]="ratingComment"
            rows="3"
            placeholder="Añade un comentario sobre el trato, puntualidad o facilidades brindadas..."
            class="w-full p-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500"
          ></textarea>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-3 w-full">
            <p-button label="Omitir" severity="secondary" [text]="true" (onClick)="skipRating()" />
            <p-button label="Enviar Calificación" icon="pi pi-send" severity="warn" [loading]="store.loading()" (onClick)="submitRating()" />
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class ActiveServiceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  store = inject(MonitoringStore);

  operation = this.store.currentServiceOperation;
  errorMessage = this.store.errorMessage;

  uploadedPhotos = signal<string[]>([]);
  showRatingDialog = signal<boolean>(false);
  ratingScore = signal<number>(5);
  ratingComment = signal<string>('');

  // Información inicial mockeada para la vista (se puede integrar con SDP store luego)
  mockRequestInfo = {
    clientName: 'Carlos Mendoza',
    address: 'Av. Javier Prado 1234, San Isidro',
    serviceName: 'Instalación de Tomacorrientes y Tablero',
    scheduledTime: 'Hoy, 14:00 hrs'
  };

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('id') || 'req-1';
    this.store.loadServiceOperation(requestId).subscribe({
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la operación del servicio.'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/technician/dashboard']);
  }

  startService(): void {
    this.store.updateStatus('IN_PROGRESS').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Servicio Iniciado',
          detail: 'El cronómetro y seguimiento en vivo están activos.'
        });
      }
    });
  }

  completeService(): void {
    this.store.updateStatus('COMPLETED').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Servicio Finalizado',
          detail: 'El trabajo ha sido registrado exitosamente.'
        });
        // Disparar diálogo de calificación
        this.showRatingDialog.set(true);
      }
    });
  }

  cancelService(): void {
    this.store.updateStatus('CANCELLED').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Servicio Cancelado',
          detail: 'Se ha notificado la cancelación de la solicitud.'
        });
        setTimeout(() => this.goBack(), 1500);
      }
    });
  }

  onPhotoUpload(event: any): void {
    const files = event.files;
    if (files && files.length > 0) {
      // Simulación de subida al endpoint y obtención de URL
      for (const file of files) {
        const objectUrl = URL.createObjectURL(file);
        this.uploadedPhotos.update(photos => [...photos, objectUrl]);
      }
      this.messageService.add({
        severity: 'success',
        summary: 'Fotos subidas',
        detail: `Se adjuntaron ${files.length} fotografía(s) exitosamente.`
      });
    }
  }

  getRatingDescription(): string {
    const score = this.ratingScore();
    return {
      1: '1 Estrella - Deficiente',
      2: '2 Estrellas - Regular',
      3: '3 Estrellas - Bueno',
      4: '4 Estrellas - Muy Bueno',
      5: '5 Estrellas - Excelente'
    }[score] || '5 Estrellas - Excelente';
  }

  submitRating(): void {
    const currentOp = this.operation();
    if (!currentOp) return;

    const resource: CreateRatingResource = {
      requestId: currentOp.requestId,
      technicianId: currentOp.technicianId,
      raterId: currentOp.technicianId, // El técnico evalúa
      score: this.ratingScore(),
      comment: this.ratingComment()
    };

    this.store.addRating(resource).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: '¡Gracias!',
          detail: 'Tu calificación ayuda a mantener la confianza en la comunidad.'
        });
        this.showRatingDialog.set(false);
        setTimeout(() => this.goBack(), 1500);
      }
    });
  }

  skipRating(): void {
    this.showRatingDialog.set(false);
    this.goBack();
  }

  getStatusLabel(status: string): string {
    return {
      PENDING: 'Programado / Pendiente',
      IN_PROGRESS: 'En Curso (Ejecutando)',
      COMPLETED: 'Trabajo Finalizado',
      CANCELLED: 'Solicitud Cancelada'
    }[status] || status;
  }

  getStatusSeverity(status: string): TagSeverity {
    return {
      PENDING: 'secondary' as TagSeverity,
      IN_PROGRESS: 'info' as TagSeverity,
      COMPLETED: 'success' as TagSeverity,
      CANCELLED: 'danger' as TagSeverity
    }[status] || 'secondary';
  }
}
