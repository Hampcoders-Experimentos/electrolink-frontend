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
import { DividerModule } from 'primeng/divider';
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
    DividerModule, DialogModule, SelectModule, TextareaModule,
    InputNumberModule, FileUploadModule, ToggleButtonModule,
    ToastModule, ElectroMapComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="wizard-container p-6 max-w-5xl mx-auto">
      <div class="header-banner flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-white">
            <span class="p-3 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-500/30 flex items-center justify-center">
              <i class="pi pi-bolt text-2xl"></i>
            </span>
            Asistente de Solicitud de Servicio
          </h1>
          <p class="text-sm text-gray-400 mt-1">Sigue los pasos para programar la visita de un técnico certificado</p>
        </div>
        <button class="btn-cancel text-sm text-gray-400 hover:text-white transition" (click)="cancelWizard()">
          <i class="pi pi-times mr-1"></i> Cerrar Asistente
        </button>
      </div>

      <!-- Banner límite alcanzado -->
      <p-message
        *ngIf="hasReachedLimit() && !isPremium()"
        severity="warn"
        styleClass="mb-6 w-full rounded-2xl border border-amber-500/30 shadow-lg"
      >
        <div class="flex items-center justify-between py-1 w-full gap-4 flex-wrap">
          <div class="flex items-center gap-3">
            <i class="pi pi-exclamation-triangle text-xl text-amber-600"></i>
            <span class="text-sm font-semibold text-amber-900">Has alcanzado tu límite mensual de solicitudes del Plan Básico.</span>
          </div>
          <p-button
            label="Actualizar a Premium"
            severity="warn"
            size="small"
            styleClass="font-bold shadow-md rounded-xl"
            (onClick)="showUpgradeDialog.set(true)"
          />
        </div>
      </p-message>

      <!-- Stepper Principal (PrimeNG v21 API) -->
      <p-stepper [(value)]="activeStep" [linear]="true" styleClass="wizard-stepper">
        <p-step-list>
          <p-step [value]="1">Plan y Cuota</p-step>
          <p-step [value]="2">Propiedad y Servicio</p-step>
          <p-step [value]="3">Detalles Técnicos</p-step>
          <p-step [value]="4">Confirmación</p-step>
          <p-step [value]="5">Asignación</p-step>
        </p-step-list>

        <p-step-panels>
          <!-- PASO 1: Verificación de Plan -->
          <p-step-panel [value]="1">
            <ng-template #content let-activateCallback="activateCallback">
              <div class="step-card bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl my-6">
                <h2 class="text-xl font-bold text-white mb-2">Verificación de Cuenta</h2>
                <p class="text-sm text-slate-400 mb-6">Revisión de cuota disponible de solicitudes de servicio técnico</p>

                <div
                  class="flex items-center gap-4 p-6 rounded-2xl border mb-8 transition-all shadow-md"
                  [ngClass]="isPremium()
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-100'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-100'"
                >
                  <span class="p-3 rounded-xl flex items-center justify-center text-2xl"
                    [ngClass]="isPremium() ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
                    <i class="pi" [ngClass]="isPremium() ? 'pi-star-fill' : 'pi-shield'"></i>
                  </span>
                  <div class="flex-1">
                    <p class="font-extrabold text-lg flex items-center gap-2">
                      {{ isPremium() ? 'Plan Premium Activo' : 'Plan Básico (Gratis)' }}
                      <p-tag *ngIf="isPremium()" value="PREMIUM" severity="warn" styleClass="font-bold text-xs tracking-wider" />
                    </p>
                    <p *ngIf="!isPremium()" class="text-xs text-slate-400 mt-1">
                      Solicitudes consumidas este mes: <strong class="text-white">{{ monthlyCount() }} / 2</strong>
                    </p>
                    <p *ngIf="isPremium()" class="text-xs text-amber-200/80 mt-1">
                      Disfrutas de solicitudes ilimitadas y atención prioritaria en todas tus visitas.
                    </p>
                  </div>
                </div>

                <div *ngIf="!isPremium()" class="mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                  <div class="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
                    <span>Capacidad Mensual</span>
                    <span>{{ (monthlyCount() / 2) * 100 }}% Consumido</span>
                  </div>
                  <p-progressbar
                    [value]="(monthlyCount() / 2) * 100"
                    [showValue]="false"
                    [style]="{ height: '8px' }"
                    [ngClass]="monthlyCount() >= 2 ? 'p-progressbar-danger' : ''"
                  />
                </div>

                <div class="flex justify-end pt-4 border-t border-slate-800">
                  <p-button
                    label="Continuar a Propiedad"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    styleClass="bg-gradient-to-r from-amber-500 to-amber-600 border-none font-bold text-slate-900 rounded-xl px-6 py-3 shadow-lg hover:from-amber-400 hover:to-amber-500"
                    [disabled]="hasReachedLimit() && !isPremium()"
                    (onClick)="activeStep.set(2)"
                  />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

          <!-- PASO 2: Propiedad y Servicio -->
          <p-step-panel [value]="2">
            <ng-template #content let-activateCallback="activateCallback">
              <div class="step-card bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl my-6">
                <h2 class="text-xl font-bold text-white mb-2">Ubicación y Cobertura</h2>
                <p class="text-sm text-slate-400 mb-8">Selecciona la propiedad y el servicio eléctrico que requieres</p>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <!-- Selección de Propiedad -->
                  <div class="flex flex-col gap-4">
                    <label class="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                      <i class="pi pi-home text-amber-500"></i> Selecciona tu Propiedad
                    </label>

                    <!-- Mapa Leaflet -->
                    <div class="map-wrapper border border-slate-700 rounded-2xl overflow-hidden shadow-inner">
                      <el-map
                        [markers]="propertyMarkers()"
                        height="300px"
                        (markerClick)="onMarkerClick($event)"
                      />
                    </div>

                    <p-select
                      [(ngModel)]="selectedProperty"
                      [options]="assetsStore.properties()"
                      optionLabel="address"
                      placeholder="Elige tu propiedad guardada..."
                      styleClass="w-full bg-slate-800 border-slate-700 text-white rounded-xl py-1 shadow-md"
                    >
                      <ng-template pTemplate="selectedItem" let-prop>
                        <div class="flex items-center gap-3" *ngIf="prop">
                          <i class="pi pi-home text-amber-500"></i>
                          <span class="font-semibold">{{ prop.address }} ({{ prop.district }})</span>
                        </div>
                      </ng-template>
                      <ng-template pTemplate="item" let-prop>
                        <div class="flex items-center gap-3 py-1">
                          <i class="pi pi-home text-slate-400"></i>
                          <div>
                            <div class="font-semibold">{{ prop.address }}</div>
                            <div class="text-xs text-slate-400">{{ prop.district }}, {{ prop.region }}</div>
                          </div>
                        </div>
                      </ng-template>
                    </p-select>

                    <button class="btn-new-prop text-xs font-semibold text-amber-400 hover:text-amber-300 self-start flex items-center gap-1 mt-1" (click)="goToNewProperty()">
                      <i class="pi pi-plus-circle"></i> + Registrar nueva propiedad
                    </button>
                  </div>

                  <!-- Selección de Servicio -->
                  <div class="flex flex-col gap-4">
                    <label class="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                      <i class="pi pi-bolt text-amber-500"></i> Servicio Disponible en Zona
                    </label>

                    <div *ngIf="sdpStore.loading()" class="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                      <i class="pi pi-spin pi-spinner text-3xl text-amber-500"></i>
                      <span>Cargando catálogo de servicios...</span>
                    </div>

                    <div *ngIf="!sdpStore.loading()" class="services-list flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-2">
                      <div
                        *ngFor="let svc of sdpStore.services()"
                        class="p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-3 shadow-md"
                        [ngClass]="selectedService()?.id === svc.id
                          ? 'border-amber-500/80 bg-amber-500/10 text-white shadow-amber-500/10 shadow-lg'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'"
                        (click)="selectedService.set(svc)"
                      >
                        <div>
                          <div class="flex items-start justify-between gap-2 mb-1">
                            <h4 class="font-bold text-base text-white leading-tight">{{ svc.name }}</h4>
                            <span class="text-xs font-extrabold px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 whitespace-nowrap">
                              S/ {{ svc.basePrice }}
                            </span>
                          </div>
                          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">{{ svc.description }}</p>
                        </div>

                        <div class="flex items-center justify-between pt-2 border-t border-slate-700/50 text-xs">
                          <span class="text-slate-500 flex items-center gap-1">
                            <i class="pi pi-tag text-xs"></i> {{ svc.category }}
                          </span>
                          <span class="text-emerald-400 font-semibold flex items-center gap-1">
                            <i class="pi pi-clock text-xs"></i> Disp. Inmediata
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-between pt-6 border-t border-slate-800">
                  <p-button label="Paso Anterior" icon="pi pi-arrow-left" severity="secondary" styleClass="rounded-xl px-5 py-3 font-semibold" (onClick)="activeStep.set(1)" />
                  <p-button
                    label="Continuar a Detalles"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    styleClass="bg-gradient-to-r from-amber-500 to-amber-600 border-none font-bold text-slate-900 rounded-xl px-6 py-3 shadow-lg hover:from-amber-400 hover:to-amber-500"
                    [disabled]="!selectedProperty() || !selectedService()"
                    (onClick)="activeStep.set(3)"
                  />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

          <!-- PASO 3: Detalles y Prioridad -->
          <p-step-panel [value]="3">
            <ng-template #content let-activateCallback="activateCallback">
              <div class="step-card bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl my-6">
                <h2 class="text-xl font-bold text-white mb-2">Especificaciones del Trabajo</h2>
                <p class="text-sm text-slate-400 mb-8">Ingresa los detalles técnicos para preparar la visita</p>

                <div class="flex flex-col gap-6 mb-8">
                  <!-- Descripción -->
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                      <i class="pi pi-align-left text-amber-500"></i> Descripción del Problema
                    </label>
                    <textarea
                      pTextarea
                      [(ngModel)]="description"
                      rows="4"
                      styleClass="w-full bg-slate-800 border-slate-700 text-white rounded-2xl p-4 shadow-inner placeholder:text-slate-500"
                      placeholder="Detalla los síntomas, ubicación del tablero o cualquier información relevante para el técnico..."
                    ></textarea>
                  </div>

                  <!-- Recibo Eléctrico -->
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                      <i class="pi pi-file text-amber-500"></i> Consumo y Facturación Eléctrica (Opcional)
                    </label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p-inputnumber [(ngModel)]="receiptConsumption" prefix="kWh " placeholder="Consumo mensual (kWh)" styleClass="w-full" inputStyleClass="w-full bg-slate-800 border-slate-700 text-white rounded-xl py-3" />
                      <p-inputnumber [(ngModel)]="receiptAmount" prefix="S/ " placeholder="Monto del recibo (S/)" mode="currency" currency="PEN" styleClass="w-full" inputStyleClass="w-full bg-slate-800 border-slate-700 text-white rounded-xl py-3" />
                    </div>
                    <p-fileupload
                      mode="basic"
                      accept="image/*,application/pdf"
                      chooseLabel="Adjuntar foto de recibo o cuadro eléctrico"
                      styleClass="mt-2 w-full p-button-outlined p-button-secondary rounded-xl"
                    />
                  </div>

                  <!-- Solicitud Prioritaria (Premium) -->
                  <div
                    *ngIf="isPremium()"
                    class="flex items-center justify-between gap-4 p-6 rounded-2xl border bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/40 shadow-lg mt-4"
                  >
                    <div class="flex items-center gap-4">
                      <span class="p-3 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center text-2xl border border-amber-500/30 shadow-inner">
                        <i class="pi pi-bolt font-bold"></i>
                      </span>
                      <div>
                        <h4 class="font-extrabold text-white text-base">Atención Prioritaria Premium</h4>
                        <p class="text-xs text-amber-200/80 mt-0.5">Asignación inmediata en el top de la cola de servicio</p>
                      </div>
                    </div>
                    <p-togglebutton
                      [(ngModel)]="isPriorityRequest"
                      onIcon="pi pi-check"
                      offIcon="pi pi-times"
                      onLabel="Activada"
                      offLabel="Activar"
                      styleClass="rounded-xl font-bold shadow-md"
                    />
                  </div>
                </div>

                <div class="flex justify-between pt-6 border-t border-slate-800">
                  <p-button label="Paso Anterior" icon="pi pi-arrow-left" severity="secondary" styleClass="rounded-xl px-5 py-3 font-semibold" (onClick)="activeStep.set(2)" />
                  <p-button label="Revisar Solicitud" icon="pi pi-arrow-right" iconPos="right" styleClass="bg-gradient-to-r from-amber-500 to-amber-600 border-none font-bold text-slate-900 rounded-xl px-6 py-3 shadow-lg hover:from-amber-400 hover:to-amber-500" (onClick)="activeStep.set(4)" />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

          <!-- PASO 4: Confirmación y Resumen -->
          <p-step-panel [value]="4">
            <ng-template #content let-activateCallback="activateCallback">
              <div class="step-card bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl my-6">
                <h2 class="text-xl font-bold text-white mb-2">Resumen y Confirmación</h2>
                <p class="text-sm text-slate-400 mb-8">Verifica que todos los datos sean correctos antes de enviar</p>

                <p-card styleClass="bg-slate-800/50 border border-slate-700/60 rounded-2xl shadow-xl mb-8">
                  <div class="flex flex-col gap-4 text-sm">
                    <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span class="text-slate-400">Propiedad de Servicio</span>
                      <span class="font-bold text-white">{{ selectedProperty()?.address || 'No seleccionada' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span class="text-slate-400">Servicio Contratado</span>
                      <span class="font-bold text-amber-400">{{ selectedService()?.name || 'No seleccionado' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span class="text-slate-400">Tarifa Base Estimada</span>
                      <span class="font-extrabold text-base text-white">S/ {{ selectedService()?.basePrice || '0.00' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-slate-700/50" *ngIf="description()">
                      <span class="text-slate-400">Descripción</span>
                      <span class="text-slate-300 max-w-xs text-right truncate">{{ description() }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2" *ngIf="isPriorityRequest()">
                      <span class="text-slate-400">Modo de Atención</span>
                      <p-tag value="PRIORIDAD ALTA" severity="warn" icon="pi pi-bolt" styleClass="font-bold tracking-wider" />
                    </div>
                  </div>
                </p-card>

                <p-message severity="info" styleClass="mb-8 rounded-xl border border-blue-500/20 shadow-md">
                  Al confirmar, el sistema de ElectroLink notificará instantáneamente a los técnicos certificados en un radio de 10 km.
                </p-message>

                <div class="flex justify-between pt-6 border-t border-slate-800">
                  <p-button label="Modificar Datos" icon="pi pi-arrow-left" severity="secondary" styleClass="rounded-xl px-5 py-3 font-semibold" (onClick)="activeStep.set(3)" />
                  <p-button
                    label="Confirmar y Asignar Técnico"
                    icon="pi pi-check-circle"
                    styleClass="bg-gradient-to-r from-emerald-500 to-emerald-600 border-none font-extrabold text-slate-900 rounded-xl px-8 py-4 shadow-xl hover:from-emerald-400 hover:to-emerald-500 tracking-wide text-base"
                    [loading]="isSubmitting()"
                    (onClick)="submitRequest()"
                  />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

          <!-- PASO 5: Éxito / Polling -->
          <p-step-panel [value]="5">
            <ng-template #content let-activateCallback="activateCallback">
              <div class="step-card bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 shadow-2xl my-6 text-center">
                <div class="pulse-icon w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                  <i class="pi" [ngClass]="isMatched() ? 'pi-check' : 'pi-spin pi-spinner'"></i>
                </div>

                <h2 class="text-2xl font-extrabold text-white mb-3">
                  {{ isMatched() ? '¡Técnico Asignado Exitosamente!' : 'Buscando al mejor técnico cercano...' }}
                </h2>
                <p class="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                  {{ isMatched()
                    ? 'Nuestro sistema inteligente ha enlazado a un especialista certificado para tu solicitud.'
                    : 'Transmitiendo la solicitud a la red de técnicos de ElectroLink en tu zona geográfica...' }}
                </p>

                <!-- Tarjeta del Técnico Asignado -->
                <div *ngIf="isMatched()" class="max-w-md mx-auto bg-slate-800/80 border border-slate-700 p-6 rounded-2xl flex items-center gap-5 text-left shadow-xl mb-8">
                  <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl border border-amber-500/30 flex-shrink-0 shadow-inner">
                    👨‍🔧
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <h3 class="font-bold text-white text-lg">Luis Torres</h3>
                      <span class="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold border border-emerald-500/30">Asignado</span>
                    </div>
                    <span class="text-xs text-amber-400 font-semibold block mb-1">⭐ 4.9 (124 servicios exitosos)</span>
                    <p class="text-xs text-slate-400">Licencia SEC #88492-A</p>
                  </div>
                </div>

                <div class="flex justify-center">
                  <p-button
                    label="Volver al Catálogo de Servicios"
                    icon="pi pi-home"
                    styleClass="bg-gradient-to-r from-amber-500 to-amber-600 border-none font-bold text-slate-900 rounded-xl px-8 py-3.5 shadow-lg hover:from-amber-400 hover:to-amber-500 text-base"
                    (onClick)="goToCatalog()"
                  />
                </div>
              </div>
            </ng-template>
          </p-step-panel>

        </p-step-panels>
      </p-stepper>

      <!-- Dialog Upgrade Premium -->
      <p-dialog
        [(visible)]="showUpgradeDialogVisible"
        header="Actualiza a ElectroLink Premium"
        [modal]="true"
        [style]="{ width: '450px' }"
        styleClass="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div class="flex flex-col gap-6 py-4 text-slate-300">
          <p class="text-sm leading-relaxed">
            Desbloquea solicitudes de servicio ilimitadas, sin restricciones de cuota y con atención prioritaria garantizada 24/7.
          </p>

          <div class="p-6 rounded-2xl text-white text-center bg-gradient-to-r from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20">
            <p class="text-4xl font-extrabold text-slate-900">S/ 39.90</p>
            <p class="text-xs font-bold text-slate-900/80 mt-1 uppercase tracking-wider">Suscripción Mensual Premium</p>
          </div>

          <ul class="flex flex-col gap-3 text-sm">
            <li class="flex items-center gap-3">
              <i class="pi pi-check-circle text-emerald-400 text-lg"></i>
              <span>Solicitudes y proyectos ilimitados</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="pi pi-check-circle text-emerald-400 text-lg"></i>
              <span>Asignación prioritaria top en cola de espera</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="pi pi-check-circle text-emerald-400 text-lg"></i>
              <span>Soporte técnico VIP dedicado 24/7</span>
            </li>
          </ul>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <p-button label="Cancelar" severity="secondary" styleClass="rounded-xl px-5 py-2.5 font-semibold" (onClick)="showUpgradeDialog.set(false)" />
            <p-button label="Actualizar a Premium" icon="pi pi-crown" styleClass="bg-amber-500 text-slate-900 font-bold border-none rounded-xl px-6 py-2.5 shadow-md hover:bg-amber-400" (onClick)="goToPremium()" />
          </div>
        </ng-template>
      </p-dialog>

      <p-toast />
    </div>
  `,
  styles: [`
    :host ::ng-deep .wizard-stepper .p-stepper-nav {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.5rem;
      padding: 1rem 2rem;
      margin-bottom: 2rem;
    }
    :host ::ng-deep .wizard-stepper .p-stepper-action {
      color: #94a3b8;
    }
    :host ::ng-deep .wizard-stepper .p-stepper-action:hover {
      color: #f8fafc;
    }
    :host ::ng-deep .wizard-stepper .p-stepper-step.p-stepper-step-active .p-stepper-action {
      color: #f59e0b;
      font-weight: 700;
    }
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

  // State signals (PrimeNG v21 Stepper usa valores 1-basados por defecto o coincidentes con [value])
  activeStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  showUpgradeDialog = signal<boolean>(false);
  selectedProperty = signal<Property | null>(null);
  selectedService = signal<ServiceEntity | null>(null);
  isPriorityRequest = signal<boolean>(false);
  description = signal<string>('');
  receiptConsumption = signal<number | null>(null);
  receiptAmount = signal<number | null>(null);

  // Computed from stores
  isPremium = this.authStore.isPremium;
  hasReachedLimit = this.subscriptionStore.hasReachedLimit;
  monthlyCount = this.subscriptionStore.monthlyRequestCount;

  // Dialog visibility getter/setter binding
  get showUpgradeDialogVisible(): boolean {
    return this.showUpgradeDialog();
  }
  set showUpgradeDialogVisible(val: boolean) {
    this.showUpgradeDialog.set(val);
  }

  // Markers computed
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
        this.activeStep.set(5); // Pantalla de éxito / asignación (Paso 5)
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
