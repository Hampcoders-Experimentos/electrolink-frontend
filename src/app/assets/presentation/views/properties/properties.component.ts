import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AssetsStoreService } from '../../../application/assets-store.service';
import { Property } from '../../../domain/model/property.entity';
import { ElectroMapComponent, MapMarker } from '../../../../shared/presentation/components/electro-map/electro-map.component';


@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, SplitterModule, TableModule,
    ButtonModule, DialogModule, DrawerModule, InputTextModule,
    TagModule, ToastModule, ElectroMapComponent
  ],
  providers: [MessageService],
  template: `
    <div class="properties-container p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <i class="pi pi-map-marker text-blue-600"></i>
            Gestión de Propiedades y Geolocalización
          </h1>
          <p class="text-gray-600 text-sm">Explora tus propiedades en el mapa interactivo y administra su información</p>
        </div>
        <p-button label="Agregar Propiedad" icon="pi pi-plus" (onClick)="openAddDialog()" styleClass="p-button-primary font-bold shadow-md"></p-button>
      </div>

      <!-- Splitter Layout -->
      <p-splitter [style]="{ height: '650px' }" [panelSizes]="[50, 50]" [minSizes]="[30, 30]" styleClass="border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-white">
        <!-- Left Panel: Map -->
        <ng-template pTemplate>
          <div class="w-full h-full flex flex-col p-4 bg-gray-50/50">
            <div class="mb-3 flex justify-between items-center">
              <span class="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-map text-blue-500"></i> Mapa de Activos
              </span>
              <p-tag [value]="store.properties().length + ' Propiedades'" severity="info"></p-tag>
            </div>
            <div class="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-white">
              <el-map
                [markers]="propertyMarkers()"
                height="100%"
                (markerClick)="onMarkerClick($event)"
              />
            </div>
          </div>
        </ng-template>

        <!-- Right Panel: Property List Table -->
        <ng-template pTemplate>
          <div class="w-full h-full flex flex-col p-4 overflow-auto bg-white">
            <div class="mb-3 flex justify-between items-center">
              <span class="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-list text-indigo-500"></i> Lista de Propiedades
              </span>
            </div>
            
            <p-table
              [value]="store.properties()"
              [loading]="store.loading()"
              [paginator]="true"
              [rows]="8"
              dataKey="id"
              responsiveLayout="scroll"
              styleClass="p-datatable-sm w-full"
            >
              <ng-template pTemplate="header">
                <tr class="bg-gray-50">
                  <th pSortableColumn="address" class="text-xs font-bold text-gray-600 uppercase">Dirección <p-sortIcon field="address"></p-sortIcon></th>
                  <th pSortableColumn="region" class="text-xs font-bold text-gray-600 uppercase">Región <p-sortIcon field="region"></p-sortIcon></th>
                  <th pSortableColumn="district" class="text-xs font-bold text-gray-600 uppercase">Distrito <p-sortIcon field="district"></p-sortIcon></th>
                  <th class="text-xs font-bold text-gray-600 uppercase text-center">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-property>
                <tr class="hover:bg-gray-50/80 transition-colors">
                  <td class="font-medium text-gray-900">{{ property.address }}</td>
                  <td><p-tag [value]="property.region" severity="secondary"></p-tag></td>
                  <td class="text-gray-700">{{ property.district }}</td>
                  <td class="text-center">
                    <div class="flex justify-center gap-1">
                      <p-button icon="pi pi-pencil" [text]="true" size="small" severity="info" pTooltip="Editar" (onClick)="openEditDrawer(property)"></p-button>
                      <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger" pTooltip="Eliminar" (onClick)="deleteProperty(property)"></p-button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="4" class="text-center p-8 text-gray-500">
                    No se encontraron propiedades registradas.
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </ng-template>
      </p-splitter>

      <!-- Edit Property Drawer -->
      <p-drawer [(visible)]="isDrawerVisible" [position]="'right'" [style]="{ width: '450px' }" styleClass="bg-white">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-2 font-bold text-lg text-gray-900">
            <i class="pi pi-home text-blue-600"></i> Editar Propiedad
          </div>
        </ng-template>
        
        <div class="p-4 flex flex-col gap-6" *ngIf="selectedProperty">
          <form [formGroup]="editForm" (ngSubmit)="savePropertyEdit()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-600 uppercase">Dirección Completa</label>
              <input pInputText formControlName="address" class="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-600 uppercase">Región</label>
              <input pInputText formControlName="region" class="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-600 uppercase">Distrito</label>
              <input pInputText formControlName="district" class="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-600 uppercase">ID de Propietario</label>
              <input type="number" pInputText formControlName="ownerId" class="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="isDrawerVisible = false"></p-button>
              <p-button label="Guardar Cambios" type="submit" [disabled]="editForm.invalid" styleClass="p-button-primary font-bold"></p-button>
            </div>
          </form>
        </div>
      </p-drawer>

      <!-- Add Property Dialog with Mini Map -->
      <p-dialog [(visible)]="isDialogVisible" [modal]="true" [header]="'Agregar Nueva Propiedad'" [style]="{ width: '600px' }" styleClass="bg-white rounded-2xl shadow-2xl">
        <div class="p-2 flex flex-col gap-4">
          <p class="text-sm text-gray-600">Completa los datos de la propiedad y selecciona su ubicación aproximada en el mapa mini.</p>
          
          <form [formGroup]="addForm" (ngSubmit)="saveNewProperty()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-600 uppercase">Dirección Completa</label>
              <input pInputText formControlName="address" placeholder="Av. Los Laureles 320" class="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-gray-600 uppercase">Región</label>
                <input pInputText formControlName="region" placeholder="Lima" class="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-gray-600 uppercase">Distrito</label>
                <input pInputText formControlName="district" placeholder="San Isidro" class="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-600 uppercase">ID Propietario</label>
              <input type="number" pInputText formControlName="ownerId" class="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <!-- Mini Map -->
            <div class="flex flex-col gap-1 mt-2">
              <label class="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
                <i class="pi pi-map-marker"></i> Ubicación en Mapa (Mini Map)
              </label>
              <div class="rounded-xl overflow-hidden border border-gray-200 shadow-sm h-48">
                <el-map
                  height="100%"
                  [zoom]="13"
                />
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="isDialogVisible = false"></p-button>
              <p-button label="Registrar Propiedad" type="submit" [disabled]="addForm.invalid" styleClass="p-button-primary font-bold"></p-button>
            </div>
          </form>
        </div>
      </p-dialog>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .properties-container {
      min-height: 100vh;
      background-color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
  `]
})
export class PropertiesComponent implements OnInit {
  store = inject(AssetsStoreService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  // UI state
  isDrawerVisible = false;
  isDialogVisible = false;
  selectedProperty: Property | null = null;

  // Forms
  editForm!: FormGroup;
  addForm!: FormGroup;

  // Map Markers computed
  propertyMarkers = computed<MapMarker[]>(() =>
    this.store.properties().map(p => ({
      lat: -12.046374 + (Math.random() - 0.5) * 0.05, // Simulated offset around Lima
      lng: -77.042793 + (Math.random() - 0.5) * 0.05,
      popup: `${p.address} (${p.district})`,
      type: 'property' as const
    }))
  );

  ngOnInit(): void {
    this.store.loadProperties().subscribe();
    this.initForms();
  }

  private initForms(): void {
    this.editForm = this.fb.group({
      address: ['', [Validators.required, Validators.maxLength(150)]],
      region: ['', [Validators.required, Validators.maxLength(50)]],
      district: ['', [Validators.required, Validators.maxLength(50)]],
      ownerId: [1, [Validators.required, Validators.min(1)]]
    });

    this.addForm = this.fb.group({
      address: ['', [Validators.required, Validators.maxLength(150)]],
      region: ['', [Validators.required, Validators.maxLength(50)]],
      district: ['', [Validators.required, Validators.maxLength(50)]],
      ownerId: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onMarkerClick(marker: MapMarker): void {
    const found = this.store.properties().find(p => p.address === marker.popup?.split(' (')[0]);
    if (found) {
      this.openEditDrawer(found);
    }
  }

  openEditDrawer(property: Property): void {
    this.selectedProperty = property;
    this.editForm.patchValue({
      address: property.address,
      region: property.region,
      district: property.district,
      ownerId: property.ownerId
    });
    this.isDrawerVisible = true;
  }

  openAddDialog(): void {
    this.addForm.reset({ ownerId: 1 });
    this.isDialogVisible = true;
  }

  savePropertyEdit(): void {
    if (this.editForm.invalid || !this.selectedProperty) return;

    const resource = { ...this.editForm.value, photos: [] };
    this.store.updateProperty(resource, this.selectedProperty.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Propiedad Actualizada', detail: 'Los datos se guardaron correctamente.' });
        this.isDrawerVisible = false;
      }
    });
  }

  saveNewProperty(): void {
    if (this.addForm.invalid) return;

    const resource = { ...this.addForm.value, photos: [] };
    this.store.addProperty(resource).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Propiedad Creada', detail: 'La propiedad ha sido registrada en el sistema.' });
        this.isDialogVisible = false;
      }
    });
  }

  deleteProperty(property: Property): void {
    this.store.deleteProperty(property.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Propiedad Eliminada', detail: 'Se eliminó la propiedad del inventario.' });
      }
    });
  }
}
