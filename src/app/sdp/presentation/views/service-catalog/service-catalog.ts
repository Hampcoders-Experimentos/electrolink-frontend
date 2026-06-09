import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SdpStoreService } from '@sdp/application/sdp-store.service';
import { AssetsStoreService } from '@assets/application/assets-store.service';
import { ServiceEntity } from '@sdp/domain/model/service.entity';
import { AuthStore } from '@shared/infrastructure/stores/auth.store';
import { NotificationsService } from '@shared/application/notifications.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

/**
 * Service catalogue view.
 *
 * Card / table hybrid that lets Owners browse available services (and
 * Technicians / Owners register new ones via the embedded form).
 *
 * ### State signals
 * - {@link selectedCategory}  - Active category filter (`ALL`/`Instalación`/…).
 * - {@link showAddDialog}     - Drives the "new service" modal.
 * - {@link filteredServices}  - Computed list after the category filter.
 * - {@link page}              - 1-based current page.
 * - {@link totalPages}        - Computed page count.
 * - {@link pagedServices}     - Computed slice for the current page.
 *
 * ### External dependencies
 * - {@link SdpStoreService}      - Service catalogue + add/remove side effects.
 * - {@link AssetsStoreService}   - Inventory list rendered inside the modal.
 * - {@link AuthStore}            - `isTechnician()` / `isOwner()` permission gates.
 * - {@link NotificationsService} - Success toast on save.
 *
 * ### Lifecycle
 * - `ngOnInit` loads the catalogue + inventory and builds the new-service form.
 */
@Component({
  selector: 'app-service-catalog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './service-catalog.html',
  styleUrl: './service-catalog.css',
})
export class ServiceCatalogComponent implements OnInit {
  store = inject(SdpStoreService);
  assetsStore = inject(AssetsStoreService);
  authStore = inject(AuthStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notifications = inject(NotificationsService);

  selectedCategory = signal<string>('ALL');
  showAddDialog = signal<boolean>(false);
  newServiceForm!: FormGroup;

  isTechnician = this.authStore.isTechnician;
  isOwner = this.authStore.isOwner;

  categories = [
    { id: 'ALL',           label: 'Todos los Servicios', icon: 'bolt' },
    { id: 'Instalación',   label: 'Instalación',         icon: 'wrench' },
    { id: 'Mantenimiento', label: 'Mantenimiento',       icon: 'cog' },
    { id: 'Emergencia',    label: 'Emergencia 24/7',     icon: 'exclamation-triangle' }
  ];

  categoryOptions = ['Instalación', 'Mantenimiento', 'Emergencia'];
  statusOptions = ['VISIBLE', 'OCULTO'];

  page = signal(1);
  rows = 10;

  filteredServices = computed<ServiceEntity[]>(() => {
    const category = this.selectedCategory();
    const services = this.store.services();
    return category === 'ALL' ? services : services.filter(s => s.category === category);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredServices().length / this.rows)));
  pagedServices = computed(() => {
    const list = this.filteredServices();
    const start = (this.page() - 1) * this.rows;
    return list.slice(start, start + this.rows);
  });

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

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.page.set(1);
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
        this.notifications.showSuccess('Servicio Creado', 'El nuevo servicio ha sido agregado al catálogo exitosamente.');
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

  goToWizard(): void { this.router.navigate(['/sdp/request']).then(); }
  goToWizardWithService(serviceId: string | number): void { this.router.navigate(['/sdp/request'], { queryParams: { serviceId } }).then(); }
}
