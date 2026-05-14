import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { SdpStoreService } from '../../../application/sdp-store.service';
import { AssetsStoreService } from '../../../../assets/application/assets-store.service';
import { ServiceEntity } from '../../../domain/model/service.entity';
import { AuthStore } from '../../../../shared/infrastructure/stores/auth.store';

@Component({
  selector: 'app-service-catalog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, ButtonModule,
    TagModule, DialogModule, SelectModule, InputNumberModule,
    InputTextModule, TextareaModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="catalog-container p-6 max-w-7xl mx-auto min-h-screen text-slate-100">
      <!-- Header -->
      <div class="catalog-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
        <div class="flex items-center gap-4">
          <span class="p-4 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
            <i class="pi pi-bolt font-bold"></i>
          </span>
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Catálogo de Servicios Eléctricos</h1>
            <p class="text-sm text-slate-400 mt-1">Gestión técnica y portafolio de servicios de instalación y mantenimiento</p>
          </div>
        </div>
        <div class="flex items-center gap-4 self-start md:self-auto">
          <p-button
            *ngIf="isTechnician() || isOwner()"
            label="Nuevo Servicio"
            icon="pi pi-plus"
            styleClass="bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold border-none px-5 py-3 rounded-xl shadow-lg"
            (onClick)="openNewServiceModal()"
          />
          <p-button
            label="Asistente de Solicitud"
            icon="pi pi-arrow-right"
            iconPos="right"
            severity="info"
            styleClass="bg-blue-600 hover:bg-blue-500 text-white font-bold border-none px-5 py-3 rounded-xl shadow-lg"
            (onClick)="goToWizard()"
          />
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="filter-bar flex flex-wrap gap-2 mb-8 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <button
          *ngFor="let cat of categories"
          class="filter-tab px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          [ngClass]="selectedCategory() === cat.id
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
          (click)="selectCategory(cat.id)"
        >
          <i class="pi" [ngClass]="cat.icon"></i>
          <span>{{ cat.label }}</span>
          <span *ngIf="cat.id === 'ALL'" class="px-2 py-0.5 text-xs bg-slate-800 rounded-full text-slate-300 border border-slate-700">
            {{ store.services().length }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="store.loading()" class="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
        <i class="pi pi-spin pi-spinner text-4xl text-amber-500"></i>
        <span class="text-base font-medium">Cargando portafolio de servicios...</span>
      </div>

      <!-- Tabla Principal (p-table) -->
      <div *ngIf="!store.loading()" class="table-card bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <p-table
          #dt
          [value]="filteredServices()"
          [paginator]="true"
          [rows]="10"
          [rowHover]="true"
          dataKey="id"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm custom-dark-table"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name" class="bg-slate-950 text-slate-400 py-4 px-6 text-xs font-bold uppercase tracking-wider rounded-l-2xl">
                Servicio <p-sortIcon field="name" />
              </th>
              <th pSortableColumn="category" class="bg-slate-950 text-slate-400 py-4 px-6 text-xs font-bold uppercase tracking-wider">
                Categoría <p-sortIcon field="category" />
              </th>
              <th pSortableColumn="basePrice" class="bg-slate-950 text-slate-400 py-4 px-6 text-xs font-bold uppercase tracking-wider">
                Tarifa Base <p-sortIcon field="basePrice" />
              </th>
              <th class="bg-slate-950 text-slate-400 py-4 px-6 text-xs font-bold uppercase tracking-wider">
                Tiempo Estimado
              </th>
              <th class="bg-slate-950 text-slate-400 py-4 px-6 text-xs font-bold uppercase tracking-wider">
                Estado
              </th>
              <th class="bg-slate-950 text-slate-400 py-4 px-6 text-xs font-bold uppercase tracking-wider text-right rounded-r-2xl">
                Acciones
              </th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-service>
            <tr class="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <span class="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 flex items-center justify-center text-lg">
                    {{ getServiceCategoryEmoji(service.category) }}
                  </span>
                  <div>
                    <div class="font-bold text-white text-base">{{ service.name }}</div>
                    <div class="text-xs text-slate-400 line-clamp-1 max-w-md">{{ service.description }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <p-tag [value]="service.category" severity="info" styleClass="bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-lg border border-blue-500/30" />
              </td>
              <td class="py-4 px-6">
                <span class="text-amber-400 font-extrabold text-base">S/ {{ service.basePrice }}</span>
              </td>
              <td class="py-4 px-6 text-slate-300 font-medium">
                <i class="pi pi-clock mr-1 text-slate-500"></i> {{ getEstimatedTime(service.category) }}
              </td>
              <td class="py-4 px-6">
                <p-tag value="VISIBLE" severity="success" styleClass="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-lg border border-emerald-500/30" />
              </td>
              <td class="py-4 px-6 text-right">
                <p-button
                  label="Solicitar"
                  icon="pi pi-bolt"
                  styleClass="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 font-bold rounded-xl px-4 py-2"
                  (onClick)="goToWizardWithService(service.id)"
                />
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="py-12 text-center text-slate-500 font-medium">
                No se encontraron servicios en esta categoría.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Modal de Nuevo Servicio -->
      <p-dialog
        [(visible)]="showAddDialogVisible"
        header="Registrar Nuevo Servicio Técnico"
        [modal]="true"
        [style]="{ width: '560px' }"
        styleClass="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <form [formGroup]="newServiceForm" (ngSubmit)="onSubmitNewService()" class="flex flex-col gap-6 py-4">
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Nombre del Servicio</label>
            <input
              pInputText
              formControlName="name"
              class="bg-slate-800 border-slate-700 text-white rounded-xl px-4 py-3 shadow-inner w-full focus:border-amber-500"
              placeholder="Ej: Instalación de Pozo a Tierra..."
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Categoría</label>
              <p-select
                formControlName="category"
                [options]="categoryOptions"
                placeholder="Seleccione..."
                styleClass="w-full bg-slate-800 border-slate-700 text-white rounded-xl py-1"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Tarifa Base (S/)</label>
              <p-inputnumber
                formControlName="basePrice"
                mode="currency"
                currency="PEN"
                styleClass="w-full"
                inputStyleClass="w-full bg-slate-800 border-slate-700 text-white rounded-xl py-3 focus:border-amber-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Tiempo Estimado</label>
              <input
                pInputText
                formControlName="estimatedTime"
                class="bg-slate-800 border-slate-700 text-white rounded-xl px-4 py-3 shadow-inner w-full focus:border-amber-500"
                placeholder="Ej: 3 horas"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Estado en Catálogo</label>
              <p-select
                formControlName="status"
                [options]="statusOptions"
                placeholder="Seleccione..."
                styleClass="w-full bg-slate-800 border-slate-700 text-white rounded-xl py-1"
              />
            </div>
          </div>

          <!-- Componentes Requeridos -->
          <div class="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <label class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-box text-amber-500"></i> Receta de Componentes Requeridos
            </label>
            <div class="grid grid-cols-3 gap-3 items-center mt-1">
              <div class="col-span-2">
                <p-select
                  [options]="assetsStore.inventory()"
                  optionLabel="name"
                  placeholder="Seleccione componente..."
                  styleClass="w-full bg-slate-800 border-slate-700 text-white rounded-xl py-1 text-xs"
                />
              </div>
              <div>
                <p-inputnumber placeholder="Cant." styleClass="w-full" inputStyleClass="w-full bg-slate-800 border-slate-700 text-white rounded-xl py-2.5 text-xs text-center" />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Descripción Detallada</label>
            <textarea
              pTextarea
              formControlName="description"
              rows="3"
              class="w-full bg-slate-800 border-slate-700 text-white rounded-xl p-4 shadow-inner placeholder:text-slate-500 focus:border-amber-500"
              placeholder="Especificaciones, alcance del trabajo y condiciones del servicio..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-slate-800">
            <p-button label="Cancelar" severity="secondary" styleClass="rounded-xl px-5 py-2.5 font-semibold" (onClick)="showAddDialog.set(false)" />
            <p-button label="Guardar Servicio" icon="pi pi-save" styleClass="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold border-none rounded-xl px-6 py-2.5 shadow-md" type="submit" [disabled]="newServiceForm.invalid" />
          </div>
        </form>
      </p-dialog>

      <p-toast />
    </div>
  `,
  styles: [`
    :host ::ng-deep .custom-dark-table .p-datatable-tbody > tr > td {
      border-color: rgba(30, 41, 59, 0.6) !important;
      background: transparent !important;
    }
    :host ::ng-deep .custom-dark-table .p-paginator {
      background: transparent !important;
      border: none !important;
      padding-top: 1.5rem;
    }
    :host ::ng-deep .custom-dark-table .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
      color: #f59e0b;
    }
  `]
})
export class ServiceCatalogComponent implements OnInit {
  store = inject(SdpStoreService);
  assetsStore = inject(AssetsStoreService);
  authStore = inject(AuthStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  selectedCategory = signal<string>('ALL');
  showAddDialog = signal<boolean>(false);
  newServiceForm!: FormGroup;

  isTechnician = this.authStore.isTechnician;
  isOwner = this.authStore.isOwner;

  categories = [
    { id: 'ALL', label: 'Todos los Servicios', icon: 'pi-bolt' },
    { id: 'Instalación', label: 'Instalación', icon: 'pi-wrench' },
    { id: 'Mantenimiento', label: 'Mantenimiento', icon: 'pi-cog' },
    { id: 'Emergencia', label: 'Emergencia 24/7', icon: 'pi-exclamation-triangle' }
  ];

  categoryOptions = ['Instalación', 'Mantenimiento', 'Emergencia'];
  statusOptions = ['VISIBLE', 'OCULTO'];

  get showAddDialogVisible(): boolean {
    return this.showAddDialog();
  }
  set showAddDialogVisible(val: boolean) {
    this.showAddDialog.set(val);
  }

  ngOnInit(): void {
    this.store.loadServices().subscribe();
    this.assetsStore.loadInventory();

    this.newServiceForm = this.fb.group({
      name: ['', Validators.required],
      category: ['Instalación', Validators.required],
      basePrice: [50, [Validators.required, Validators.min(1)]],
      estimatedTime: ['2 horas', Validators.required],
      description: ['', Validators.required],
      status: ['VISIBLE']
    });
  }

  filteredServices(): ServiceEntity[] {
    const category = this.selectedCategory();
    const services = this.store.services();
    if (category === 'ALL') return services;
    return services.filter(s => s.category === category);
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  openNewServiceModal(): void {
    this.newServiceForm.reset({ category: 'Instalación', basePrice: 50, estimatedTime: '2 horas', status: 'VISIBLE' });
    this.showAddDialog.set(true);
  }

  onSubmitNewService(): void {
    if (this.newServiceForm.invalid) return;

    const values = this.newServiceForm.value;
    const newSvc = new ServiceEntity({
      id: `svc-${Date.now()}`,
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      category: values.category,
      imageUrl: ''
    });

    this.store.addService(newSvc).subscribe({
      next: () => {
        this.showAddDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'Servicio Creado', detail: 'El nuevo servicio ha sido agregado al catálogo exitosamente.' });
      }
    });
  }

  getServiceCategoryEmoji(category: string): string {
    switch (category) {
      case 'Instalación': return '🛠️';
      case 'Mantenimiento': return '⚙️';
      case 'Emergencia': return '🚨';
      default: return '⚡';
    }
  }

  getEstimatedTime(category: string): string {
    switch (category) {
      case 'Instalación': return '3 - 5 horas';
      case 'Mantenimiento': return '2 - 3 horas';
      case 'Emergencia': return 'Inmediato (1 hora)';
      default: return '2 horas';
    }
  }

  goToWizard(): void {
    this.router.navigate(['/sdp/request']);
  }

  goToWizardWithService(serviceId: string | number): void {
    this.router.navigate(['/sdp/request'], { queryParams: { serviceId } });
  }
}
