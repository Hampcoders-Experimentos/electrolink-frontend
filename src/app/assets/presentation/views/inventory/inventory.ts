import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetsStoreService } from '../../../application/assets-store.service';
import { InventoryItem } from '../../../domain/model/inventory-item.entity';
import { NotificationsService } from '../../../../shared/application/notifications.service';
import { IconComponent } from '../../../../shared/presentation/components/icon/icon';

@Component({
  selector: 'app-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, DecimalPipe, IconComponent],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class InventoryComponent implements OnInit {
  store = inject(AssetsStoreService);
  private fb = inject(FormBuilder);
  private notifications = inject(NotificationsService);

  isDialogVisible = signal(false);
  isEditMode = signal(false);
  selectedItem: InventoryItem | null = null;
  itemForm!: FormGroup;
  search = signal('');

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.store.inventory();
    if (!q) return list;
    return list.filter(i => i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.store.loadInventory();
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
    this.isEditMode.set(false);
    this.selectedItem = null;
    this.itemForm.reset({ stock: 0, minStock: 5, unit: 'und', unitCost: 0 });
    this.isDialogVisible.set(true);
  }

  openEditDialog(item: InventoryItem): void {
    this.isEditMode.set(true);
    this.selectedItem = item;
    this.itemForm.patchValue(item);
    this.isDialogVisible.set(true);
  }

  saveItem(): void {
    if (this.itemForm.invalid) return;
    if (this.isEditMode() && this.selectedItem) {
      const updatedItem: InventoryItem = { ...this.selectedItem, ...this.itemForm.value };
      this.store.updateInventoryItem(updatedItem);
      this.notifications.showSuccess('Componente Actualizado', 'El inventario ha sido actualizado con éxito.');
    } else {
      this.store.addInventoryItem(this.itemForm.value);
      this.notifications.showSuccess('Componente Creado', 'Nuevo insumo registrado en el inventario.');
    }
    this.isDialogVisible.set(false);
  }

  deleteItem(item: InventoryItem): void {
    const ok = typeof window !== 'undefined'
      ? window.confirm(`¿Eliminar "${item.name}" del inventario?`)
      : true;
    if (!ok) return;
    this.store.deleteInventoryItem(item.id);
    this.notifications.showInfo('Componente Eliminado', 'Se eliminó el insumo del sistema.');
  }

  exportCSV(): void {
    const rows = this.filtered();
    if (rows.length === 0) return;
    const headers = ['name', 'category', 'stock', 'minStock', 'unit', 'unitCost'];
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => JSON.stringify((r as unknown as Record<string, unknown>)[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
