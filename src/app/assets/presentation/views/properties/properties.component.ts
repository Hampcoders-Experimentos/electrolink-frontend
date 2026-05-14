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
    <div class="el-prop-page">
      <div class="el-prop-header">
        <div>
          <h1 class="el-prop-title">
            <i class="pi pi-map-marker el-title-icon"></i>
            Gestión de Propiedades
          </h1>
          <p class="el-prop-desc">Explora tus propiedades en el mapa interactivo y administra su información</p>
        </div>
        <p-button label="Agregar Propiedad" icon="pi pi-plus" (onClick)="openAddDialog()" styleClass="el-btn-primary"></p-button>
      </div>

      <p-splitter [style]="{ height: '650px' }" [panelSizes]="[50, 50]" [minSizes]="[30, 30]" styleClass="el-splitter">
        <ng-template pTemplate>
          <div class="el-map-panel">
            <div class="el-map-header">
              <span class="el-map-label"><i class="pi pi-map el-map-icon"></i> Mapa de Activos</span>
              <p-tag [value]="store.properties().length + ' Propiedades'" severity="info"></p-tag>
            </div>
            <div class="el-map-container">
              <el-map
                [markers]="propertyMarkers()"
                height="100%"
                (markerClick)="onMarkerClick($event)"
              />
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate>
          <div class="el-table-panel">
            <div class="el-table-header">
              <span class="el-table-label"><i class="pi pi-list el-list-icon"></i> Lista de Propiedades</span>
            </div>
            
            <p-table
              [value]="store.properties()"
              [loading]="store.loading()"
              [paginator]="true"
              [rows]="8"
              dataKey="id"
              responsiveLayout="scroll"
              styleClass="el-p-table"
            >
              <ng-template pTemplate="header">
                <tr class="el-table-head-row">
                  <th pSortableColumn="address">Dirección <p-sortIcon field="address"></p-sortIcon></th>
                  <th pSortableColumn="region">Región <p-sortIcon field="region"></p-sortIcon></th>
                  <th pSortableColumn="district">Distrito <p-sortIcon field="district"></p-sortIcon></th>
                  <th class="el-th-center">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-property>
                <tr class="el-table-body-row">
                  <td class="el-cell-address">{{ property.address }}</td>
                  <td><p-tag [value]="property.region" severity="secondary"></p-tag></td>
                  <td class="el-cell-district">{{ property.district }}</td>
                  <td class="el-cell-actions">
                    <p-button icon="pi pi-pencil" [text]="true" size="small" severity="info" (onClick)="openEditDrawer(property)"></p-button>
                    <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger" (onClick)="deleteProperty(property)"></p-button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="4" class="el-empty-msg">No se encontraron propiedades registradas.</td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </ng-template>
      </p-splitter>

      <p-drawer [(visible)]="isDrawerVisible" [position]="'right'" [style]="{ width: '450px' }">
        <ng-template pTemplate="header">
          <div class="el-drawer-header">
            <i class="pi pi-home el-drawer-icon"></i> Editar Propiedad
          </div>
        </ng-template>
        
        <div class="el-drawer-body" *ngIf="selectedProperty">
          <form [formGroup]="editForm" (ngSubmit)="savePropertyEdit()" class="el-form">
            <div class="el-form-field">
              <label class="el-form-label">Dirección Completa</label>
              <input pInputText formControlName="address" class="el-form-input" />
            </div>
            <div class="el-form-field">
              <label class="el-form-label">Región</label>
              <input pInputText formControlName="region" class="el-form-input" />
            </div>
            <div class="el-form-field">
              <label class="el-form-label">Distrito</label>
              <input pInputText formControlName="district" class="el-form-input" />
            </div>
            <div class="el-form-field">
              <label class="el-form-label">ID de Propietario</label>
              <input type="number" pInputText formControlName="ownerId" class="el-form-input" />
            </div>
            <div class="el-form-actions">
              <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="isDrawerVisible = false"></p-button>
              <p-button label="Guardar Cambios" type="submit" [disabled]="editForm.invalid" styleClass="el-btn-primary"></p-button>
            </div>
          </form>
        </div>
      </p-drawer>

      <p-dialog [(visible)]="isDialogVisible" [modal]="true" [header]="'Agregar Nueva Propiedad'" [style]="{ width: '600px' }">
        <div class="el-dialog-body">
          <p class="el-dialog-desc">Completa los datos de la propiedad y selecciona su ubicación aproximada en el mapa.</p>
          
          <form [formGroup]="addForm" (ngSubmit)="saveNewProperty()" class="el-form">
            <div class="el-form-field">
              <label class="el-form-label">Dirección Completa</label>
              <input pInputText formControlName="address" placeholder="Av. Los Laureles 320" class="el-form-input" />
            </div>
            <div class="el-form-grid">
              <div class="el-form-field">
                <label class="el-form-label">Región</label>
                <input pInputText formControlName="region" placeholder="Lima" class="el-form-input" />
              </div>
              <div class="el-form-field">
                <label class="el-form-label">Distrito</label>
                <input pInputText formControlName="district" placeholder="San Isidro" class="el-form-input" />
              </div>
            </div>
            <div class="el-form-field">
              <label class="el-form-label">ID Propietario</label>
              <input type="number" pInputText formControlName="ownerId" class="el-form-input" />
            </div>
            <div class="el-form-field">
              <label class="el-form-label el-map-label-text"><i class="pi pi-map-marker"></i> Ubicación en Mapa</label>
              <div class="el-mini-map">
                <el-map height="100%" [zoom]="13" />
              </div>
            </div>
            <div class="el-form-actions">
              <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="isDialogVisible = false"></p-button>
              <p-button label="Registrar Propiedad" type="submit" [disabled]="addForm.invalid" styleClass="el-btn-primary"></p-button>
            </div>
          </form>
        </div>
      </p-dialog>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .el-prop-page {
      padding: 32px;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }

    .el-prop-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .el-prop-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-primary, #2e3a59);
      margin: 0 0 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .el-title-icon { color: #3b82f6; font-size: 22px; }
    .el-prop-desc {
      font-size: 14px;
      color: var(--el-warm-gray, #a9b1ba);
      margin: 0;
    }
    .el-btn-primary {
      background: var(--el-primary, #2e3a59) !important;
      border: none !important;
      font-weight: 700 !important;
    }

    .el-splitter {
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      overflow: hidden;
    }

    .el-map-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 16px;
      background: #f8fafc;
    }
    .el-map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .el-map-label {
      font-weight: 700;
      font-size: 13px;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .el-map-icon { color: #3b82f6; }
    .el-map-container {
      flex: 1;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      background: #ffffff;
    }

    .el-table-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 16px;
      overflow: auto;
      background: #ffffff;
    }
    .el-table-header {
      margin-bottom: 12px;
    }
    .el-table-label {
      font-weight: 700;
      font-size: 13px;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .el-list-icon { color: #6366f1; }

    .el-p-table :global(.p-datatable-table) { width: 100%; }
    .el-table-head-row th {
      font-size: 12px;
      font-weight: 700;
      color: #4b5563;
      text-transform: uppercase;
      background: #f9fafb;
      padding: 12px 16px;
    }
    .el-th-center { text-align: center; }
    .el-table-body-row td {
      padding: 12px 16px;
      font-size: 14px;
    }
    .el-table-body-row:hover { background: #f9fafb; }
    .el-cell-address {
      font-weight: 500;
      color: #111827;
    }
    .el-cell-district { color: #374151; }
    .el-cell-actions {
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 4px;
    }
    .el-empty-msg {
      text-align: center;
      padding: 32px;
      color: #6b7280;
      font-size: 14px;
    }

    .el-drawer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 18px;
      color: #111827;
    }
    .el-drawer-icon { color: #3b82f6; }
    .el-drawer-body {
      padding: 16px;
    }

    .el-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .el-form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .el-form-label {
      font-size: 12px;
      font-weight: 700;
      color: #4b5563;
      text-transform: uppercase;
    }
    .el-form-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
    }
    .el-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .el-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    .el-map-label-text {
      color: #3b82f6;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .el-dialog-body {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .el-dialog-desc {
      font-size: 14px;
      color: #4b5563;
      margin: 0;
    }
    .el-mini-map {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      height: 192px;
    }
  `]
})
export class PropertiesComponent implements OnInit {
  store = inject(AssetsStoreService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  isDrawerVisible = false;
  isDialogVisible = false;
  selectedProperty: Property | null = null;

  editForm!: FormGroup;
  addForm!: FormGroup;

  propertyMarkers = computed<MapMarker[]>(() =>
    this.store.properties().map(p => ({
      lat: -12.046374 + (Math.random() - 0.5) * 0.05,
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
