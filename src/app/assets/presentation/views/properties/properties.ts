import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetsStoreService } from '../../../application/assets-store.service';
import { Property } from '../../../domain/model/property.entity';
import { ElectroMapComponent, MapMarker } from '../../../../shared/presentation/components/electro-map/electro-map';
import { NotificationsService } from '../../../../shared/application/notifications.service';
import { IconComponent } from '../../../../shared/presentation/components/icon/icon';

@Component({
  selector: 'app-properties',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ElectroMapComponent, IconComponent],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class PropertiesComponent implements OnInit {
  store = inject(AssetsStoreService);
  private fb = inject(FormBuilder);
  private notifications = inject(NotificationsService);

  isDrawerVisible = signal(false);
  isDialogVisible = signal(false);
  selectedProperty: Property | null = null;

  editForm!: FormGroup;
  addForm!: FormGroup;

  page = signal(1);
  rows = 8;

  totalPages = computed(() => Math.max(1, Math.ceil(this.store.properties().length / this.rows)));
  pagedProperties = computed(() => {
    const all = this.store.properties();
    const start = (this.page() - 1) * this.rows;
    return all.slice(start, start + this.rows);
  });

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
    if (found) this.openEditDrawer(found);
  }

  openEditDrawer(property: Property): void {
    this.selectedProperty = property;
    this.editForm.patchValue({
      address: property.address, region: property.region,
      district: property.district, ownerId: property.ownerId
    });
    this.isDrawerVisible.set(true);
  }

  openAddDialog(): void {
    this.addForm.reset({ ownerId: 1 });
    this.isDialogVisible.set(true);
  }

  savePropertyEdit(): void {
    if (this.editForm.invalid || !this.selectedProperty) return;
    const resource = { ...this.editForm.value, photos: [] };
    this.store.updateProperty(resource, this.selectedProperty.id).subscribe({
      next: () => {
        this.notifications.showSuccess('Propiedad Actualizada', 'Los datos se guardaron correctamente.');
        this.isDrawerVisible.set(false);
      }
    });
  }

  saveNewProperty(): void {
    if (this.addForm.invalid) return;
    const resource = { ...this.addForm.value, photos: [] };
    this.store.addProperty(resource).subscribe({
      next: () => {
        this.notifications.showSuccess('Propiedad Creada', 'La propiedad ha sido registrada en el sistema.');
        this.isDialogVisible.set(false);
      }
    });
  }

  deleteProperty(property: Property): void {
    const ok = typeof window !== 'undefined' ? window.confirm(`¿Eliminar la propiedad "${property.address}"?`) : true;
    if (!ok) return;
    this.store.deleteProperty(property.id).subscribe({
      next: () => this.notifications.showInfo('Propiedad Eliminada', 'Se eliminó la propiedad del inventario.')
    });
  }
}
