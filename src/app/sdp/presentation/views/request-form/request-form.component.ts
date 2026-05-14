import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SdpStoreService } from '../../../application/sdp-store.service';
import { AssetsStoreService } from '../../../../assets/application/assets-store.service';
import { SubscriptionStore } from '../../../../subscription/application/subscription-store.service';
import { AuthStore } from '../../../../shared/infrastructure/stores/auth.store';
import { ElectroMapComponent, MapMarker } from '../../../../shared/presentation/components/electro-map/electro-map.component';
import { Property } from '../../../../assets/domain/model/property.entity';
import { ServiceEntity } from '../../../domain/model/service.entity';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, StepperModule, ButtonModule,
    MessageModule, TagModule, ProgressBarModule, CardModule,
    DialogModule, SelectModule, TextareaModule,
    InputNumberModule, FileUploadModule, ToggleButtonModule,
    ToastModule, ElectroMapComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="el-wiz-page">
      <div class="el-wiz-header">
        <div>
          <h1 class="el-wiz-title">
            <span class="el-wiz-icon-wrap"><i class="pi pi-bolt"></i></span>
            Asistente de Solicitud de Servicio
          </h1>
          <p class="el-wiz-desc">Sigue los pasos para programar la visita de un técnico certificado</p>
        </div>
        <button class="el-wiz-close" (click)="cancelWizard()">
          <i class="pi pi-times"></i> Cerrar Asistente
        </button>
      </div>

      <p-message *ngIf="hasReachedLimit() && !isPremium()" severity="warn" styleClass="el-wiz-limit-banner">
        <div class="el-wiz-limit-msg">
          <div class="el-wiz-limit-left">
            <i class="pi pi-exclamation-triangle el-warn-icon"></i>
            <span class="el-warn-text">Has alcanzado tu límite mensual de solicitudes del Plan Básico.</span>
          </div>
          <p-button label="Actualizar a Premium" severity="warn" size="small" styleClass="el-btn-premium-sm" (onClick)="showUpgradeDialog.set(true)" />
        </div>
      </p-message>

      <p-stepper [(value)]="activeStep" [linear]="true" styleClass="el-wiz-stepper">
        <p-step-list>
          <p-step [value]="1">Plan y Cuota</p-step>
          <p-step [value]="2">Propiedad y Servicio</p-step>
          <p-step [value]="3">Detalles Técnicos</p-step>
          <p-step [value]="4">Confirmación</p-step>
          <p-step [value]="5">Asignación</p-step>
        </p-step-list>

        <p-step-panels>
          <p-step-panel [value]="1">
            <ng-template #content>
              <div class="el-step-card">
                <h2 class="el-step-title">Verificación de Cuenta</h2>
                <p class="el-step-desc">Revisión de cuota disponible de solicitudes de servicio técnico</p>

                <div class="el-plan-badge" [class.el-plan-premium]="isPremium()" [class.el-plan-basic]="!isPremium()">
                  <span class="el-plan-icon-wrap" [class.el-plan-icon-premium]="isPremium()" [class.el-plan-icon-basic]="!isPremium()">
                    <i class="pi" [ngClass]="isPremium() ? 'pi-star-fill' : 'pi-shield'"></i>
                  </span>
                  <div class="el-plan-info">
                    <p class="el-plan-name">
                      {{ isPremium() ? 'Plan Premium Activo' : 'Plan Básico (Gratis)' }}
                      <p-tag *ngIf="isPremium()" value="PREMIUM" severity="warn" styleClass="el-tag-premium" />
                    </p>
                    <p *ngIf="!isPremium()" class="el-plan-detail">
                      Solicitudes consumidas este mes: <strong>{{ monthlyCount() }} / 2</strong>
                    </p>
                    <p *ngIf="isPremium()" class="el-plan-detail-premium">
                      Disfrutas de solicitudes ilimitadas y atención prioritaria en todas tus visitas.
                    </p>
                  </div>
                </div>

                <div *ngIf="!isPremium()" class="el-progress-card">
                  <div class="el-progress-labels">
                    <span>Capacidad Mensual</span>
                    <span>{{ (monthlyCount() / 2) * 100 }}% Consumido</span>
                  </div>
                  <p-progressbar [value]="(monthlyCount() / 2) * 100" [showValue]="false" [style]="{ height: '8px' }" />
                </div>

                <div class="el-step-footer">
                  <p-button label="Continuar a Propiedad" icon="pi pi-arrow-right" iconPos="right" styleClass="el-btn-amber" [disabled]="hasReachedLimit() && !isPremium()" (onClick)="activeStep.set(2)" />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

          <p-step-panel [value]="2">
            <ng-template #content>
              <div class="el-step-card">
                <h2 class="el-step-title">Ubicación y Cobertura</h2>
                <p class="el-step-desc">Selecciona la propiedad y el servicio eléctrico que requieres</p>

                <div class="el-wiz-two-col">
                  <div class="el-col">
                    <label class="el-col-label"><i class="pi pi-home el-amber"></i> Selecciona tu Propiedad</label>
                    <div class="el-map-box">
                      <el-map [markers]="propertyMarkers()" height="300px" (markerClick)="onMarkerClick($event)" />
                    </div>
                    <p-select [(ngModel)]="selectedProperty" [options]="assetsStore.properties()" optionLabel="address" placeholder="Elige tu propiedad guardada..." styleClass="el-sel-dark">
                      <ng-template pTemplate="selectedItem" let-prop>
                        <div class="el-sel-item" *ngIf="prop">
                          <i class="pi pi-home el-amber"></i>
                          <span>{{ prop.address }} ({{ prop.district }})</span>
                        </div>
                      </ng-template>
                      <ng-template pTemplate="item" let-prop>
                        <div class="el-sel-dropdown-item">
                          <i class="pi pi-home"></i>
                          <div>
                            <div class="el-dropdown-name">{{ prop.address }}</div>
                            <div class="el-dropdown-sub">{{ prop.district }}, {{ prop.region }}</div>
                          </div>
                        </div>
                      </ng-template>
                    </p-select>
                    <button class="el-link-btn" (click)="goToNewProperty()"><i class="pi pi-plus-circle"></i> Registrar nueva propiedad</button>
                  </div>

                  <div class="el-col">
                    <label class="el-col-label"><i class="pi pi-bolt el-amber"></i> Servicio Disponible en Zona</label>

                    <div *ngIf="sdpStore.loading()" class="el-loading-state">
                      <i class="pi pi-spin pi-spinner el-spinner"></i>
                      <span>Cargando catálogo de servicios...</span>
                    </div>

                    <div *ngIf="!sdpStore.loading()" class="el-services-list">
                      <div *ngFor="let svc of sdpStore.services()" class="el-svc-card" [class.el-svc-selected]="selectedService()?.id === svc.id" [class.el-svc-default]="selectedService()?.id !== svc.id" (click)="selectedService.set(svc)">
                        <div>
                          <div class="el-svc-header">
                            <h4 class="el-svc-name">{{ svc.name }}</h4>
                            <span class="el-svc-price">S/ {{ svc.basePrice }}</span>
                          </div>
                          <p class="el-svc-desc">{{ svc.description }}</p>
                        </div>
                        <div class="el-svc-footer">
                          <span class="el-svc-cat"><i class="pi pi-tag"></i> {{ svc.category }}</span>
                          <span class="el-svc-avail"><i class="pi pi-clock"></i> Disp. Inmediata</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="el-step-footer-between">
                  <p-button label="Paso Anterior" icon="pi pi-arrow-left" severity="secondary" styleClass="el-btn-ghost" (onClick)="activeStep.set(1)" />
                  <p-button label="Continuar a Detalles" icon="pi pi-arrow-right" iconPos="right" styleClass="el-btn-amber" [disabled]="!selectedProperty() || !selectedService()" (onClick)="activeStep.set(3)" />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

          <p-step-panel [value]="3">
            <ng-template #content>
              <div class="el-step-card">
                <h2 class="el-step-title">Especificaciones del Trabajo</h2>
                <p class="el-step-desc">Ingresa los detalles técnicos para preparar la visita</p>

                <div class="el-wiz-form">
                  <div class="el-field">
                    <label class="el-col-label"><i class="pi pi-align-left el-amber"></i> Descripción del Problema</label>
                    <textarea pTextarea [(ngModel)]="description" rows="4" styleClass="el-textarea-dark" placeholder="Detalla los síntomas, ubicación del tablero o cualquier información relevante para el técnico..."></textarea>
                  </div>

                  <div class="el-field">
                    <label class="el-col-label"><i class="pi pi-file el-amber"></i> Consumo y Facturación Eléctrica (Opcional)</label>
                    <div class="el-two-col">
                      <p-inputnumber [(ngModel)]="receiptConsumption" prefix="kWh " placeholder="Consumo mensual (kWh)" styleClass="el-input-dark" inputStyleClass="el-input-dark-inner" />
                      <p-inputnumber [(ngModel)]="receiptAmount" prefix="S/ " placeholder="Monto del recibo (S/)" mode="currency" currency="PEN" styleClass="el-input-dark" inputStyleClass="el-input-dark-inner" />
                    </div>
                    <p-fileupload mode="basic" accept="image/*,application/pdf" chooseLabel="Adjuntar foto de recibo o cuadro eléctrico" styleClass="el-upload-dark" />
                  </div>

                  <div *ngIf="isPremium()" class="el-premium-card">
                    <div class="el-premium-card-left">
                      <span class="el-premium-icon"><i class="pi pi-bolt"></i></span>
                      <div>
                        <h4 class="el-premium-card-title">Atención Prioritaria Premium</h4>
                        <p class="el-premium-card-desc">Asignación inmediata en el top de la cola de servicio</p>
                      </div>
                    </div>
                    <p-togglebutton [(ngModel)]="isPriorityRequest" onIcon="pi pi-check" offIcon="pi pi-times" onLabel="Activada" offLabel="Activar" styleClass="el-toggle-premium" />
                  </div>
                </div>

                <div class="el-step-footer-between">
                  <p-button label="Paso Anterior" icon="pi pi-arrow-left" severity="secondary" styleClass="el-btn-ghost" (onClick)="activeStep.set(2)" />
                  <p-button label="Revisar Solicitud" icon="pi pi-arrow-right" iconPos="right" styleClass="el-btn-amber" (onClick)="activeStep.set(4)" />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

          <p-step-panel [value]="4">
            <ng-template #content>
              <div class="el-step-card">
                <h2 class="el-step-title">Resumen y Confirmación</h2>
                <p class="el-step-desc">Verifica que todos los datos sean correctos antes de enviar</p>

                <p-card styleClass="el-summary-card">
                  <div class="el-summary-list">
                    <div class="el-summary-row"><span class="el-summary-label">Propiedad de Servicio</span><span class="el-summary-value">{{ selectedProperty()?.address || 'No seleccionada' }}</span></div>
                    <div class="el-summary-row"><span class="el-summary-label">Servicio Contratado</span><span class="el-summary-value el-amber-text">{{ selectedService()?.name || 'No seleccionado' }}</span></div>
                    <div class="el-summary-row"><span class="el-summary-label">Tarifa Base Estimada</span><span class="el-summary-value-bold">S/ {{ selectedService()?.basePrice || '0.00' }}</span></div>
                    <div class="el-summary-row" *ngIf="description()"><span class="el-summary-label">Descripción</span><span class="el-summary-value-trunc">{{ description() }}</span></div>
                    <div class="el-summary-row" *ngIf="isPriorityRequest()"><span class="el-summary-label">Modo de Atención</span><p-tag value="PRIORIDAD ALTA" severity="warn" icon="pi pi-bolt" styleClass="el-tag-alta" /></div>
                  </div>
                </p-card>

                <p-message severity="info" styleClass="el-info-msg">Al confirmar, el sistema de ElectroLink notificará instantáneamente a los técnicos certificados en un radio de 10 km.</p-message>

                <div class="el-step-footer-between">
                  <p-button label="Modificar Datos" icon="pi pi-arrow-left" severity="secondary" styleClass="el-btn-ghost" (onClick)="activeStep.set(3)" />
                  <p-button label="Confirmar y Asignar Técnico" icon="pi pi-check-circle" styleClass="el-btn-emerald" [loading]="isSubmitting()" (onClick)="submitRequest()" />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

          <p-step-panel [value]="5">
            <ng-template #content>
              <div class="el-step-card el-step-success">
                <div class="el-success-icon" [class.el-success-done]="isMatched()" [class.el-success-pending]="!isMatched()">
                  <i class="pi" [ngClass]="isMatched() ? 'pi-check' : 'pi-spin pi-spinner'"></i>
                </div>
                <h2 class="el-step-title">{{ isMatched() ? '¡Técnico Asignado Exitosamente!' : 'Buscando al mejor técnico cercano...' }}</h2>
                <p class="el-step-desc el-step-desc-center">
                  {{ isMatched() ? 'Nuestro sistema inteligente ha enlazado a un especialista certificado para tu solicitud.' : 'Transmitiendo la solicitud a la red de técnicos de ElectroLink en tu zona geográfica...' }}
                </p>

                <div *ngIf="isMatched()" class="el-tech-card">
                  <div class="el-tech-avatar">👨‍🔧</div>
                  <div class="el-tech-info">
                    <div class="el-tech-header"><h3 class="el-tech-name">Luis Torres</h3><span class="el-tech-status">Asignado</span></div>
                    <span class="el-tech-rating">⭐ 4.9 (124 servicios exitosos)</span>
                    <p class="el-tech-license">Licencia SEC #88492-A</p>
                  </div>
                </div>

                <p-button label="Volver al Catálogo de Servicios" icon="pi pi-home" styleClass="el-btn-amber" (onClick)="goToCatalog()" />
              </div>
            </ng-template>
          </p-step-panel>
        </p-step-panels>
      </p-stepper>

      <p-dialog [(visible)]="showUpgradeDialogVisible" header="Actualiza a ElectroLink Premium" [modal]="true" [style]="{ width: '450px' }" styleClass="el-upgrade-dialog">
        <div class="el-upgrade-body">
          <p class="el-upgrade-desc">Desbloquea solicitudes de servicio ilimitadas, sin restricciones de cuota y con atención prioritaria garantizada 24/7.</p>
          <div class="el-upgrade-price">
            <p class="el-price-amount">S/ 39.90</p>
            <p class="el-price-label">Suscripción Mensual Premium</p>
          </div>
          <ul class="el-upgrade-features">
            <li><i class="pi pi-check-circle el-green"></i> Solicitudes y proyectos ilimitados</li>
            <li><i class="pi pi-check-circle el-green"></i> Asignación prioritaria top en cola de espera</li>
            <li><i class="pi pi-check-circle el-green"></i> Soporte técnico VIP dedicado 24/7</li>
          </ul>
        </div>
        <ng-template pTemplate="footer">
          <div class="el-upgrade-footer">
            <p-button label="Cancelar" severity="secondary" styleClass="el-btn-ghost" (onClick)="showUpgradeDialog.set(false)" />
            <p-button label="Actualizar a Premium" icon="pi pi-crown" styleClass="el-btn-amber-bold" (onClick)="goToPremium()" />
          </div>
        </ng-template>
      </p-dialog>

      <p-toast />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .el-wiz-page {
      padding: 32px;
      max-width: 1024px;
      margin: 0 auto;
      min-height: 100vh;
    }
    .el-wiz-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .el-wiz-title {
      font-family: 'Inter', sans-serif;
      font-size: 28px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.025em;
    }
    .el-wiz-icon-wrap {
      padding: 12px;
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border-radius: 16px;
      border: 1px solid rgba(245, 158, 11, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .el-wiz-desc {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #94a3b8;
      margin: 4px 0 0;
    }
    .el-wiz-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 14px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: color 0.15s;
    }
    .el-wiz-close:hover { color: #ffffff; }

    .el-wiz-limit-banner { margin-bottom: 24px; width: 100%; border-radius: 16px; }
    .el-wiz-limit-msg { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; flex-wrap: wrap; padding: 4px 0; }
    .el-wiz-limit-left { display: flex; align-items: center; gap: 12px; }
    .el-warn-icon { font-size: 20px; color: #d97706; }
    .el-warn-text { font-size: 14px; font-weight: 600; color: #78350f; font-family: 'Inter', sans-serif; }
    .el-btn-premium-sm { font-weight: 700 !important; border-radius: 12px !important; }

    .el-wiz-stepper :global(.p-stepper-nav) {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 16px 32px;
      margin-bottom: 32px;
    }

    .el-step-card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(30, 41, 59, 0.5);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      margin: 24px 0;
    }
    .el-step-title {
      font-family: 'Inter', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px;
    }
    .el-step-desc {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 24px;
    }
    .el-step-desc-center { text-align: center; max-width: 448px; margin: 0 auto 32px !important; line-height: 1.625; }

    .el-plan-badge {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 32px;
      transition: all 0.2s;
    }
    .el-plan-premium {
      border: 1px solid rgba(245, 158, 11, 0.4);
      background: rgba(245, 158, 11, 0.1);
    }
    .el-plan-basic {
      border: 1px solid rgba(59, 130, 246, 0.3);
      background: rgba(59, 130, 246, 0.1);
    }
    .el-plan-icon-wrap {
      padding: 12px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    .el-plan-icon-premium { background: rgba(245,158,11,0.2); color: #f59e0b; }
    .el-plan-icon-basic { background: rgba(59,130,246,0.2); color: #3b82f6; }
    .el-plan-info { flex: 1; }
    .el-plan-name { font-weight: 800; font-size: 18px; display: flex; align-items: center; gap: 8px; margin: 0; }
    .el-plan-premium .el-plan-name { color: #fef3c7; }
    .el-plan-basic .el-plan-name { color: #dbeafe; }
    .el-tag-premium { font-weight: 700 !important; font-size: 11px !important; letter-spacing: 0.05em !important; }
    .el-plan-detail { font-size: 13px; color: #94a3b8; margin: 4px 0 0; }
    .el-plan-detail strong { color: #ffffff; }
    .el-plan-detail-premium { font-size: 13px; color: rgba(253, 230, 138, 0.8); margin: 4px 0 0; }

    .el-progress-card {
      background: rgba(30, 41, 59, 0.5);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(51, 65, 85, 0.5);
      margin-bottom: 32px;
    }
    .el-progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .el-step-footer { display: flex; justify-content: flex-end; padding-top: 16px; border-top: 1px solid rgba(30, 41, 59, 0.5); }
    .el-step-footer-between { display: flex; justify-content: space-between; padding-top: 24px; border-top: 1px solid rgba(30, 41, 59, 0.5); }
    .el-btn-amber {
      background: linear-gradient(to right, #f59e0b, #d97706) !important;
      border: none !important;
      font-weight: 700 !important;
      color: #0f172a !important;
      border-radius: 12px !important;
    }
    .el-btn-ghost { border-radius: 12px !important; font-weight: 600 !important; }
    .el-btn-emerald {
      background: linear-gradient(to right, #10b981, #059669) !important;
      border: none !important;
      font-weight: 800 !important;
      color: #0f172a !important;
      border-radius: 12px !important;
    }

    .el-wiz-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    @media (max-width: 768px) { .el-wiz-two-col { grid-template-columns: 1fr; } }
    .el-col { display: flex; flex-direction: column; gap: 16px; }
    .el-col-label {
      font-size: 14px;
      font-weight: 700;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .el-amber { color: #f59e0b; }
    .el-map-box { border: 1px solid rgba(51, 65, 85, 0.5); border-radius: 16px; overflow: hidden; }
    .el-sel-dark { width: 100%; }
    .el-sel-item { display: flex; align-items: center; gap: 12px; }
    .el-sel-dropdown-item { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
    .el-dropdown-name { font-weight: 600; font-size: 14px; }
    .el-dropdown-sub { font-size: 12px; color: #94a3b8; }
    .el-link-btn {
      background: none;
      border: none;
      color: #fbbf24;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      align-self: flex-start;
      font-family: 'Inter', sans-serif;
    }
    .el-link-btn:hover { color: #fcd34d; }

    .el-loading-state {
      padding: 48px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #94a3b8;
    }
    .el-spinner { font-size: 32px; color: #f59e0b; }

    .el-services-list { display: flex; flex-direction: column; gap: 12px; max-height: 360px; overflow-y: auto; padding-right: 8px; }
    .el-svc-card {
      padding: 16px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .el-svc-selected {
      border: 1px solid rgba(245, 158, 11, 0.8);
      background: rgba(245, 158, 11, 0.1);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
    }
    .el-svc-selected .el-svc-name { color: #ffffff; }
    .el-svc-default {
      border: 1px solid rgba(51, 65, 85, 0.5);
      background: rgba(51, 65, 85, 0.4);
    }
    .el-svc-default:hover { border-color: #475569; background: rgba(51, 65, 85, 0.8); }
    .el-svc-default .el-svc-name { color: #cbd5e1; }
    .el-svc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
    .el-svc-name { font-weight: 700; font-size: 16px; margin: 0; }
    .el-svc-price {
      font-size: 12px;
      font-weight: 800;
      padding: 4px 10px;
      background: rgba(245,158,11,0.2);
      color: #fbbf24;
      border-radius: 8px;
      border: 1px solid rgba(245,158,11,0.3);
      white-space: nowrap;
    }
    .el-svc-desc { font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5; }
    .el-svc-footer { display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid rgba(51,65,85,0.5); font-size: 12px; margin-top: 8px; }
    .el-svc-cat { color: #64748b; display: flex; align-items: center; gap: 4px; }
    .el-svc-avail { color: #34d399; font-weight: 600; display: flex; align-items: center; gap: 4px; }

    .el-wiz-form { display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px; }
    .el-field { display: flex; flex-direction: column; gap: 8px; }
    .el-textarea-dark { width: 100% !important; background: rgba(30,41,59,0.8) !important; border: 1px solid rgba(51,65,85,0.5) !important; color: #ffffff !important; border-radius: 16px !important; padding: 16px !important; }
    .el-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .el-input-dark { width: 100%; }
    .el-input-dark-inner { width: 100% !important; background: rgba(30,41,59,0.8) !important; border: 1px solid rgba(51,65,85,0.5) !important; color: #ffffff !important; border-radius: 12px !important; }
    .el-upload-dark { margin-top: 8px; width: 100%; }

    .el-premium-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(245,158,11,0.4);
      background: linear-gradient(to right, rgba(245,158,11,0.2), rgba(217,119,6,0.1));
    }
    .el-premium-card-left { display: flex; align-items: center; gap: 16px; }
    .el-premium-icon {
      padding: 12px;
      background: rgba(245,158,11,0.2);
      color: #fbbf24;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: 1px solid rgba(245,158,11,0.3);
    }
    .el-premium-card-title { font-weight: 800; color: #ffffff; font-size: 16px; margin: 0 0 2px; }
    .el-premium-card-desc { font-size: 13px; color: rgba(253,230,138,0.8); margin: 0; }

    .el-summary-card { background: rgba(51,65,85,0.5) !important; border: 1px solid rgba(71,85,105,0.6) !important; border-radius: 16px !important; margin-bottom: 32px; }
    .el-summary-list { display: flex; flex-direction: column; gap: 4px; }
    .el-summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(71,85,105,0.5);
      font-size: 14px;
    }
    .el-summary-row:last-child { border-bottom: none; }
    .el-summary-label { color: #94a3b8; }
    .el-summary-value { color: #ffffff; font-weight: 700; }
    .el-summary-value-bold { color: #ffffff; font-weight: 800; font-size: 16px; }
    .el-amber-text { color: #fbbf24; }
    .el-summary-value-trunc { color: #cbd5e1; max-width: 280px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .el-info-msg { margin-bottom: 32px !important; border-radius: 12px !important; border: 1px solid rgba(59,130,246,0.2) !important; }

    .el-step-success { text-align: center; padding: 48px; }
    .el-success-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 0 auto 24px;
    }
    .el-success-done { background: rgba(16,185,129,0.2); color: #34d399; border: 2px solid #10b981; }
    .el-success-pending { background: rgba(245,158,11,0.2); color: #f59e0b; border: 2px solid #f59e0b; }

    .el-tech-card {
      max-width: 448px;
      margin: 0 auto 32px;
      background: rgba(51,65,85,0.8);
      border: 1px solid rgba(71,85,105,0.5);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      text-align: left;
    }
    .el-tech-avatar {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: rgba(245,158,11,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      border: 1px solid rgba(245,158,11,0.3);
      flex-shrink: 0;
    }
    .el-tech-info { flex: 1; }
    .el-tech-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .el-tech-name { font-weight: 700; color: #ffffff; font-size: 18px; margin: 0; }
    .el-tech-status {
      font-size: 12px;
      padding: 4px 10px;
      background: rgba(16,185,129,0.2);
      color: #34d399;
      border-radius: 8px;
      font-weight: 700;
      border: 1px solid rgba(16,185,129,0.3);
    }
    .el-tech-rating { font-size: 13px; color: #fbbf24; font-weight: 600; display: block; margin-bottom: 4px; }
    .el-tech-license { font-size: 13px; color: #94a3b8; margin: 0; }

    .el-upgrade-dialog { background: rgba(15,23,42,0.9) !important; border: 1px solid rgba(51,65,85,0.5) !important; border-radius: 24px !important; }
    .el-upgrade-body { display: flex; flex-direction: column; gap: 24px; padding: 16px 0; color: #cbd5e1; }
    .el-upgrade-desc { font-size: 14px; line-height: 1.625; margin: 0; }
    .el-upgrade-price {
      padding: 24px;
      border-radius: 16px;
      text-align: center;
      background: linear-gradient(to right, #f59e0b, #d97706);
    }
    .el-price-amount { font-size: 36px; font-weight: 800; color: #0f172a; margin: 0; }
    .el-price-label { font-size: 12px; font-weight: 700; color: rgba(15,23,42,0.8); margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .el-upgrade-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .el-upgrade-features li { display: flex; align-items: center; gap: 12px; font-size: 14px; }
    .el-green { color: #34d399; font-size: 18px; }
    .el-upgrade-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(51,65,85,0.5); }
    .el-btn-amber-bold {
      background: #f59e0b !important;
      border: none !important;
      font-weight: 700 !important;
      color: #0f172a !important;
      border-radius: 12px !important;
    }

    .el-tag-alta { font-weight: 700 !important; letter-spacing: 0.05em !important; }
  `]
})
export class RequestFormComponent implements OnInit {
  sdpStore = inject(SdpStoreService);
  assetsStore = inject(AssetsStoreService);
  subscriptionStore = inject(SubscriptionStore);
  authStore = inject(AuthStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  activeStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  showUpgradeDialog = signal<boolean>(false);
  selectedProperty = signal<Property | null>(null);
  selectedService = signal<ServiceEntity | null>(null);
  isPriorityRequest = signal<boolean>(false);
  description = signal<string>('');
  receiptConsumption = signal<number | null>(null);
  receiptAmount = signal<number | null>(null);

  isPremium = this.authStore.isPremium;
  hasReachedLimit = this.subscriptionStore.hasReachedLimit;
  monthlyCount = this.subscriptionStore.monthlyRequestCount;

  get showUpgradeDialogVisible(): boolean {
    return this.showUpgradeDialog();
  }
  set showUpgradeDialogVisible(val: boolean) {
    this.showUpgradeDialog.set(val);
  }

  propertyMarkers = computed<MapMarker[]>(() =>
    this.assetsStore.properties().map((p, idx) => ({
      lat: -12.046374 + (idx * 0.01),
      lng: -77.042793 + (idx * 0.01),
      popup: `${p.address} (${p.district})`,
      type: 'property' as const,
      propertyData: p
    }))
  );

  ngOnInit(): void {
    this.assetsStore.loadProperties().subscribe();
    this.sdpStore.loadServices().subscribe();

    this.route.queryParams.subscribe(params => {
      if (params['serviceId']) {
        const id = Number(params['serviceId']);
        const found = this.sdpStore.services().find(s => s.id === id);
        if (found) this.selectedService.set(found);
      }
    });
  }

  onMarkerClick(marker: any): void {
    if (marker && marker.propertyData) {
      this.selectedProperty.set(marker.propertyData);
    }
  }

  submitRequest(): void {
    this.isSubmitting.set(true);

    const formData = {
      homeownerId: 1,
      propertyId: this.selectedProperty()?.id || 1,
      serviceId: this.selectedService()?.id || 1,
      description: this.description() || 'Revisión y mantenimiento eléctrico',
      requiresBill: false,
      priority: this.isPriorityRequest() ? 'HIGH' : 'LOW',
      status: 'PENDING'
    };

    this.sdpStore.createRequest(formData).subscribe({
      next: () => {
        this.subscriptionStore.incrementRequests().subscribe();
        this.isSubmitting.set(false);
        this.activeStep.set(5);
        this.messageService.add({
          severity: 'success', summary: '¡Solicitud enviada con éxito!',
          detail: 'Nuestro sistema inteligente está asignando el técnico adecuado.',
          life: 4000
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: 'No se pudo generar la solicitud. Intente de nuevo.'
        });
      }
    });
  }

  isMatched(): boolean {
    const requests = this.sdpStore.myRequests();
    if (requests.length === 0) return false;
    const latest = requests[requests.length - 1];
    return latest.status === 'MATCHED';
  }

  cancelWizard(): void {
    this.router.navigate(['/sdp/catalog']);
  }

  goToNewProperty(): void {
    this.router.navigate(['/assets/new']);
  }

  goToCatalog(): void {
    this.router.navigate(['/sdp/catalog']);
  }

  goToPremium(): void {
    this.router.navigate(['/subscription']);
  }
}
