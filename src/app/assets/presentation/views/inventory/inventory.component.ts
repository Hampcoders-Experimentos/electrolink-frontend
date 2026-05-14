import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { AssetsStoreService } from '../../../application/assets-store.service';
import { InventoryItem } from '../../../domain/model/inventory-item.entity';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TableModule,
    ButtonModule, BadgeModule, InputTextModule, IconFieldModule,
    InputIconModule, DialogModule, ConfirmDialogModule, ToastModule,
    TooltipModule, TagModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="el-inv-page">
      <div class="el-inv-header">
        <div>
          <h1 class="el-inv-title">
            <i class="pi pi-box el-inv-title-icon"></i>
            Inventario Técnico
          </h1>
          <p class="el-inv-desc">Gestiona el stock, costos y alertas de reposición de tus insumos eléctricos</p>
        </div>
        <p-button label="Agregar Componente" icon="pi pi-plus" (onClick)="openAddDialog()" styleClass="el-btn-primary"></p-button>
      </div>

      <div class="el-inv-card">
        <p-table
          #dt
          [value]="store.inventory()"
          [loading]="store.loading()"
          [paginator]="true"
          [rows]="10"
          [globalFilterFields]="['name', 'category']"
          dataKey="id"
          responsiveLayout="scroll"
          styleClass="el-p-table"
        >
          <ng-template pTemplate="header">
            <div class="el-inv-toolbar">
              <p-iconfield iconPosition="left" class="el-search-wrap">
                <p-inputicon class="pi pi-search"></p-inputicon>
                <input
                  pInputText
                  type="text"
                  placeholder="Buscar por nombre o categoría..."
                  (input)="onSearch($event)"
                  class="el-search-input"
                />
              </p-iconfield>
              <p-button icon="pi pi-file-excel" label="Exportar CSV" severity="secondary" (onClick)="exportCSV()" styleClass="p-button-outlined el-btn-export"></p-button>
            </div>
            <tr class="el-inv-head-row">
              <th pSortableColumn="name">Componente <p-sortIcon field="name"></p-sortIcon></th>
              <th pSortableColumn="category">Categoría <p-sortIcon field="category"></p-sortIcon></th>
              <th pSortableColumn="stock">Stock <p-sortIcon field="stock"></p-sortIcon></th>
              <th>Umbral Mínimo</th>
              <th pSortableColumn="unitCost">Costo Unitario <p-sortIcon field="unitCost"></p-sortIcon></th>
              <th class="el-th-center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-item>
            <tr class="el-inv-body-row">
              <td>
                <div class="el-cell-name">
                  <i class="pi pi-bolt el-bolt-icon"></i>
                  <span class="el-item-name">{{ item.name }}</span>
                </div>
              </td>
              <td>
                <p-tag [value]="item.category" severity="info"></p-tag>
              </td>
              <td>
                <div class="el-cell-stock">
                  <span [class.el-stock-low]="item.stock <= item.minStock" [class.el-stock-ok]="item.stock > item.minStock">
                    {{ item.stock }} {{ item.unit }}
                  </span>
                  <p-badge *ngIf="item.stock <= item.minStock" value="!" severity="danger" pTooltip="Stock por debajo del umbral"></p-badge>
                </div>
              </td>
              <td class="el-cell-minstock">{{ item.minStock }} {{ item.unit }}</td>
              <td class="el-cell-cost">S/ {{ item.unitCost | number:'1.2-2' }}</td>
              <td class="el-cell-actions">
                <p-button icon="pi pi-pencil" [text]="true" size="small" severity="info" pTooltip="Editar" (onClick)="openEditDialog(item)"></p-button>
                <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger" pTooltip="Eliminar" (onClick)="deleteItem(item)"></p-button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="el-empty-msg">No se encontraron componentes en el inventario.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <p-dialog [(visible)]="isDialogVisible" [modal]="true" [header]="isEditMode ? 'Editar Componente' : 'Agregar Componente'" [style]="{ width: '500px' }">
        <div class="el-dialog-body">
          <p class="el-dialog-desc">
            {{ isEditMode ? 'Actualiza los datos de stock y costos del insumo.' : 'Registra un nuevo componente en el catálogo del inventario.' }}
          </p>

          <form [formGroup]="itemForm" (ngSubmit)="saveItem()" class="el-form">
            <div class="el-form-field">
              <label class="el-form-label">Nombre del Componente</label>
              <input pInputText formControlName="name" placeholder="Ej. Tomacorriente Triple" class="el-form-input" />
            </div>
            <div class="el-form-field">
              <label class="el-form-label">Categoría</label>
              <input pInputText formControlName="category" placeholder="Ej. Accesorios" class="el-form-input" />
            </div>
            <div class="el-form-grid">
              <div class="el-form-field">
                <label class="el-form-label">Stock Actual</label>
                <input type="number" pInputText formControlName="stock" class="el-form-input" />
              </div>
              <div class="el-form-field">
                <label class="el-form-label">Umbral Mínimo</label>
                <input type="number" pInputText formControlName="minStock" class="el-form-input" />
              </div>
            </div>
            <div class="el-form-grid">
              <div class="el-form-field">
                <label class="el-form-label">Unidad de Medida</label>
                <input pInputText formControlName="unit" placeholder="und / m" class="el-form-input" />
              </div>
              <div class="el-form-field">
                <label class="el-form-label">Costo Unitario (S/)</label>
                <input type="number" step="0.1" pInputText formControlName="unitCost" class="el-form-input" />
              </div>
            </div>
            <div class="el-form-actions">
              <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="isDialogVisible = false"></p-button>
              <p-button [label]="isEditMode ? 'Guardar Cambios' : 'Registrar Componente'" type="submit" [disabled]="itemForm.invalid" styleClass="el-btn-primary"></p-button>
            </div>
          </form>
        </div>
      </p-dialog>

      <p-confirmDialog [style]="{ width: '400px' }"></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .el-inv-page {
      padding: 32px;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }

    .el-inv-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .el-inv-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-primary, #2e3a59);
      margin: 0 0 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .el-inv-title-icon { color: #3b82f6; font-size: 22px; }
    .el-inv-desc {
      font-size: 14px;
      color: var(--el-warm-gray, #a9b1ba);
      margin: 0;
    }
    .el-btn-primary {
      background: var(--el-primary, #2e3a59) !important;
      border: none !important;
      font-weight: 700 !important;
    }

    .el-inv-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      overflow: hidden;
      padding: 16px;
    }

    .el-inv-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      flex-wrap: wrap;
      gap: 16px;
      border-bottom: 1px solid #f3f4f6;
      margin-bottom: 16px;
    }
    .el-search-wrap {
      width: 100%;
      max-width: 288px;
    }
    .el-search-input {
      width: 100%;
      padding: 8px 12px 8px 40px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
    }
    .el-btn-export {
      font-size: 14px !important;
      font-weight: 600 !important;
    }

    .el-inv-head-row th {
      font-size: 12px;
      font-weight: 700;
      color: #4b5563;
      text-transform: uppercase;
      background: #f9fafb;
      padding: 12px 16px;
    }
    .el-th-center { text-align: center; }

    .el-inv-body-row td {
      padding: 12px 16px;
      font-size: 14px;
      border-bottom: 1px solid #f3f4f6;
    }
    .el-inv-body-row:hover { background: #f9fafb; }

    .el-cell-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .el-bolt-icon { color: #f59e0b; font-weight: 700; }
    .el-item-name {
      font-weight: 600;
      color: #111827;
    }

    .el-cell-stock {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .el-stock-low {
      color: #ef4444;
      font-weight: 700;
      font-size: 16px;
    }
    .el-stock-ok {
      color: #1f2937;
      font-weight: 500;
    }

    .el-cell-minstock {
      color: #4b5563;
      font-weight: 500;
    }
    .el-cell-cost {
      font-weight: 600;
      color: #111827;
    }
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
  `]
})
export class InventoryComponent implements OnInit {
  store = inject(AssetsStoreService);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  @ViewChild('dt') dt!: Table;

  isDialogVisible = false;
  isEditMode = false;
  selectedItem: InventoryItem | null = null;
  itemForm!: FormGroup;

  ngOnInit(): void {
    this.store.loadInventory();
    this.initForm();
  }

  private initForm(): void {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      unit: ['und', Validators.required],
      unitCost: [0, [Validators.required, Validators.min(0)]]
    });
  }

  openAddDialog(): void {
    this.isEditMode = false;
    this.selectedItem = null;
    this.itemForm.reset({ stock: 0, minStock: 5, unit: 'und', unitCost: 0 });
    this.isDialogVisible = true;
  }

  openEditDialog(item: InventoryItem): void {
    this.isEditMode = true;
    this.selectedItem = item;
    this.itemForm.patchValue(item);
    this.isDialogVisible = true;
  }

  saveItem(): void {
    if (this.itemForm.invalid) return;

    if (this.isEditMode && this.selectedItem) {
      const updatedItem: InventoryItem = {
        ...this.selectedItem,
        ...this.itemForm.value
      };
      this.store.updateInventoryItem(updatedItem);
      this.messageService.add({ severity: 'success', summary: 'Componente Actualizado', detail: 'El inventario ha sido actualizado con éxito.' });
    } else {
      this.store.addInventoryItem(this.itemForm.value);
      this.messageService.add({ severity: 'success', summary: 'Componente Creado', detail: 'Nuevo insumo registrado en el inventario.' });
    }

    this.isDialogVisible = false;
  }

  deleteItem(item: InventoryItem): void {
    this.confirmationService.confirm({
      header: 'Eliminar Componente',
      message: `¿Estás seguro de que deseas eliminar "${item.name}" del inventario?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.store.deleteInventoryItem(item.id);
        this.messageService.add({ severity: 'info', summary: 'Componente Eliminado', detail: 'Se eliminó el insumo del sistema.' });
      }
    });
  }

  exportCSV(): void {
    this.dt.exportCSV();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }
}
