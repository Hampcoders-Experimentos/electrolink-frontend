import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MonitoringStore } from '../../../application/monitoring-store.service';

export type TagSeverity = 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' | undefined;

@Component({
  selector: 'el-ratings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    RatingModule,
    TagModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <!-- Encabezado y Resumen de Reputación -->
      <div class="bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            <i class="pi pi-star-fill text-yellow-400"></i>Reputación y Evaluaciones
          </h1>
          <p class="text-slate-300 max-w-xl text-sm">
            Consulta el historial de evaluaciones mutuas entre clientes y técnicos para mantener un alto estándar de servicio en la plataforma.
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/20 flex flex-col items-center text-center shadow-inner min-w-[200px]">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Calificación Promedio</span>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-4xl font-extrabold text-yellow-400">{{ store.averageRating() }}</span>
            <span class="text-xl text-slate-400">/ 5.0</span>
          </div>
          <p-rating [ngModel]="store.averageRating()" [readonly]="true" [stars]="5" styleClass="text-yellow-400 text-lg" />
        </div>
      </div>

      <p-message *ngIf="store.errorMessage()" severity="error" [text]="store.errorMessage() || ''" styleClass="mb-6 w-full" />

      <!-- Tarjetas de Evaluaciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let rating of store.ratings()" class="flex">
          <p-card styleClass="w-full shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 rounded-2xl flex flex-col justify-between">
            <ng-template pTemplate="header">
              <div class="px-6 pt-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-300">
                    {{ getInitials(rating.raterId) }}
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-800 text-base leading-tight">{{ getRaterDisplayName(rating.raterId) }}</h3>
                    <span class="text-xs text-slate-400">{{ rating.createdAt | date:'mediumDate' }}</span>
                  </div>
                </div>
                <p-tag [value]="rating.score + ' Estrellas'" [severity]="getScoreSeverity(rating.score)" styleClass="font-bold text-xs" />
              </div>
            </ng-template>

            <ng-template pTemplate="content">
              <div class="py-2">
                <p-rating [ngModel]="rating.score" [readonly]="true" [stars]="5" styleClass="text-yellow-500 mb-3 text-lg" />
                <p class="text-slate-600 text-sm leading-relaxed italic">
                  "{{ rating.comment || 'Sin comentarios adicionales.' }}"
                </p>
              </div>
            </ng-template>

            <ng-template pTemplate="footer">
              <div class="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>Solicitud: {{ rating.requestId }}</span>
                <span>Téc ID: {{ rating.technicianId }}</span>
              </div>
            </ng-template>
          </p-card>
        </div>

        <div *ngIf="store.ratings().length === 0" class="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <i class="pi pi-star text-5xl mb-3 text-slate-300 animate-pulse"></i>
          <p class="text-base font-medium">No se han registrado evaluaciones todavía.</p>
        </div>
      </div>
    </div>
  `
})
export class RatingsComponent implements OnInit {
  store = inject(MonitoringStore);

  ngOnInit(): void {
    // Carga de calificaciones para el técnico/usuario actual
    this.store.loadRatings('tech-1').subscribe();
  }

  getInitials(raterId: string): string {
    return raterId ? raterId.substring(0, 2).toUpperCase() : 'US';
  }

  getRaterDisplayName(raterId: string): string {
    return raterId === 'tech-1' ? 'Técnico Asignado' : 'Cliente ElectroLink';
  }

  getScoreSeverity(score: number): TagSeverity {
    if (score >= 4) return 'success' as TagSeverity;
    if (score === 3) return 'warn' as TagSeverity;
    return 'danger' as TagSeverity;
  }
}
