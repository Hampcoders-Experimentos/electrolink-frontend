import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SdpStoreService } from '../../../application/sdp-store.service';
import { AssetsStoreService } from '../../../../assets/application/assets-store.service';
import { SubscriptionStore } from '../../../../subscription/application/subscription-store.service';
import { AuthStore } from '../../../../shared/infrastructure/stores/auth.store';
import { ElectroMapComponent, MapMarker } from '../../../../shared/presentation/components/electro-map/electro-map';
import { NotificationsService } from '../../../../shared/application/notifications.service';
import { IconComponent } from '../../../../shared/presentation/components/icon/icon';
import { Property } from '../../../../assets/domain/model/property.entity';
import { ServiceEntity } from '../../../domain/model/service.entity';

interface StepDef { value: number; label: string }

@Component({
  selector: 'app-request-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ElectroMapComponent, IconComponent],
  templateUrl: './request-form.html',
  styleUrl: './request-form.css',
})
export class RequestFormComponent implements OnInit {
  sdpStore = inject(SdpStoreService);
  assetsStore = inject(AssetsStoreService);
  subscriptionStore = inject(SubscriptionStore);
  authStore = inject(AuthStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notifications = inject(NotificationsService);

  steps: StepDef[] = [
    { value: 1, label: 'Plan' },
    { value: 2, label: 'Propiedad' },
    { value: 3, label: 'Detalles' },
    { value: 4, label: 'Confirmar' },
    { value: 5, label: 'Asignación' },
  ];

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

  propertyMarkers = computed<MapMarker[]>(() =>
    this.assetsStore.properties().map((p, idx) => ({
      lat: -12.046374 + (idx * 0.01),
      lng: -77.042793 + (idx * 0.01),
      popup: `${p.address} (${p.district})`,
      type: 'property' as const,
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

  onPropertySelect(id: number | string): void {
    const found = this.assetsStore.properties().find(p => p.id === id);
    if (found) this.selectedProperty.set(found);
  }

  onMarkerClick(marker: MapMarker): void {
    const found = this.assetsStore.properties().find(p => marker.popup?.startsWith(p.address));
    if (found) this.selectedProperty.set(found);
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
        this.notifications.showSuccess('¡Solicitud enviada con éxito!', 'Nuestro sistema inteligente está asignando el técnico adecuado.', 4000);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notifications.showError('Error', 'No se pudo generar la solicitud. Intente de nuevo.');
      }
    });
  }

  isMatched(): boolean {
    const requests = this.sdpStore.myRequests();
    if (requests.length === 0) return false;
    return requests[requests.length - 1].status === 'MATCHED';
  }

  cancelWizard(): void { this.router.navigate(['/sdp/catalog']); }
  goToNewProperty(): void { this.router.navigate(['/assets/new']); }
  goToCatalog(): void { this.router.navigate(['/sdp/catalog']); }
  goToPremium(): void { this.router.navigate(['/subscription']); }
}
