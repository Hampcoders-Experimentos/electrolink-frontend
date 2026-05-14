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
    <div class="inventory-container p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <i class="pi pi-box text-blue-600"></i>
            Inventario Técnico de Componentes
          </h1>
          <p class="text-gray-600 text-sm">Gestiona el stock, costos y alertas de reposición de tus insumos eléctricos</p>
        </div>
        <p-button label="Agregar Componente" icon="pi pi-plus" (onClick)="openAddDialog()" styleClass="p-button-primary font-bold shadow-md"></p-button>
      </div>

      <!-- Inventory Table Card -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-4">
        <p-table
          #dt
          [value]="store.inventory()"
          [loading]="store.loading()"
          [paginator]="true"
          [rows]="10"
          [globalFilterFields]="['name', 'category']"
          dataKey="id"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm w-full"
        >
          <ng-template pTemplate="header">
            <div class="flex justify-between items-center pb-4 flex-wrap gap-4 border-b border-gray-100 mb-4">
              <p-iconfield iconPosition="left" class="w-full sm:w-72">
                <p-inputicon class="pi pi-search"></p-inputicon>
                <input
                  pInputText
                  type="text"
                  placeholder="Buscar por nombre o categoría..."
                  (input)="onSearch($event)"
                  class="w-full p-2 pl-10 border border-gray-300 rounded-lg text-sm"
                />
              </p-iconfield>
              <p-button icon="pi pi-file-excel" label="Exportar CSV" severity="secondary" (onClick)="exportCSV()" styleClass="p-button-outlined text-sm font-semibold"></p-button>
            </div>
            <tr class="bg-gray-50">
              <th pSortableColumn="name" class="text-xs font-bold text-gray-600 uppercase py-3">Componente <p-sortIcon field="name"></p-sortIcon></th>
              <th pSortableColumn="category" class="text-xs font-bold text-gray-600 uppercase py-3">Categoría <p-sortIcon field="category"></p-sortIcon></th>
              <th pSortableColumn="stock" class="text-xs font-bold text-gray-600 uppercase py-3">Stock <p-sortIcon field="stock"></p-sortIcon></th>
              <th class="text-xs font-bold text-gray-600 uppercase py-3">Umbral Mínimo</th>
              <th pSortableColumn="unitCost" class="text-xs font-bold text-gray-600 uppercase py-3">Costo Unitario <p-sortIcon field="unitCost"></p-sortIcon></th>
              <th class="text-xs font-bold text-gray-600 uppercase py-3 text-center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-item>
            <tr class="hover:bg-gray-50/80 transition-colors border-b border-gray-100">
              <td class="py-3">
                <div class="flex items-center gap-2">
                  <i class="pi pi-bolt text-amber-500 font-bold"></i>
                  <span class="font-semibold text-gray-900">{{ item.name }}</span>
                </div>
              </td>
              <td class="py-3">
                <p-tag [value]="item.category" severity="info" styleClass="font-semibold"></p-tag>
              </td>
              <td class="py-3">
                <div class="flex items-center gap-2">
                  <span [ngClass]="item.stock <= item.minStock ? 'text-red-500 font-bold text-base' : 'text-gray-800 font-medium'">
                    {{ item.stock }} {{ item.unit }}
                  </span>
                  <p-badge *ngIf="item.stock <= item.minStock" value="!" severity="danger" pTooltip="Stock por debajo del umbral"></p-badge>
                </div>
              </td>
              <td class="py-3 text-gray-600 font-medium">{{ item.minStock }} {{ item.unit }}</td>
              <td class="py-3 font-semibold text-gray-900">S/ {{ item.unitCost | number:'1.2-2' }}</td>
              <td class="py-3 text-center">
                <div class="flex justify-center gap-1">
                  <p-button icon="pi pi-pencil" [text]="true" size="small" severity="info" pTooltip="Editar" (onClick)="openEditDialog(item)"></p-button>
                  <p-button icon="pi pi-trash" [text]="true" size="small" severity="danger" pTooltip="Eliminar" (onClick)="deleteItem(item)"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center p-8 text-gray-500">
                No se encontraron componentes en el inventario.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Add / Edit Component Dialog -->
      <p-dialog [(visible)]="isDialogVisible" [modal]="true" [header]="isEditMode ? 'Editar Componente' : 'Agregar Componente'" [style]="{ width: '500px' }" styleClass="bg-white rounded-2xl shadow-2xl">
        <div class="p-2 flex flex-col gap-4">
          <p class="text-sm text-gray-600">
            {{ isEditMode ? 'Actualiza los datos de stock y costos del insumo.' : 'Registra un nuevo componente en el catálogo del inventario.' }}
          </p>

          <form [formGroup]="itemForm" (ngSubmit)="saveItem()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-600 uppercase">Nombre del Componente</label>
              <input pInputText formControlName="name" placeholder="Ej. Tomacorriente Triple" class="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-600 uppercase">Categoría</label>
              <input pInputText formControlName="category" placeholder="Ej. Accesorios" class="w-full p-2 border border-gray-300 rounded-lg" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-gray-600 uppercase">Stock Actual</label>
                <input type="number" pInputText formControlName="stock" class="w-full p-2 border border-gray-300 rounded-lg" />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-gray-600 uppercase">Umbral Mínimo</label>
                <input type="number" pInputText formControlName="minStock" class="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-gray-600 uppercase">Unidad de Medida</label>
                <input pInputText formControlName="unit" placeholder="und / m" class="w-full p-2 border border-gray-300 rounded-lg" />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-gray-600 uppercase">Costo Unitario (S/)</label>
                <input type="number" step="0.1" pInputText formControlName="unitCost" class="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="isDialogVisible = false"></p-button>
              <p-button [label]="isEditMode ? 'Guardar Cambios' : 'Registrar Componente'" type="submit" [disabled]="itemForm.invalid" styleClass="p-button-primary font-bold"></p-button>
            </div>
          </form>
        </div>
      </p-dialog>

      <p-confirmDialog [style]="{ width: '400px' }"></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .inventory-container {
      min-height: 100vh;
      background-color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
  `]
})
export class InventoryComponent implements OnInit {
  store = inject(AssetsStoreService);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  @ViewChild('dt') dt!: Table;

  // State
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

