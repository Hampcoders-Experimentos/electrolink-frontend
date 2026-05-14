import { Injectable, signal } from '@angular/core';
import { ServiceEntity } from '../domain/model/service.entity';
import { RequestEntity } from '../domain/model/request.entity';
import { ScheduleAggregate } from '../domain/model/schedule.entity';
import { SdpApiService } from '../infrastructure/sdp-api.service';
import { Observable, tap } from 'rxjs';
import { CreateRequestResource, RequestResource } from '../infrastructure/request-response';
import { CreateScheduleResource } from '../infrastructure/schedule-response';

@Injectable({ providedIn: 'root' })
export class SdpStoreService {
  // --- Private signals ---
  private readonly servicesSignal = signal<ServiceEntity[]>([]);
  private readonly myRequestsSignal = signal<RequestEntity[]>([]);
  private readonly schedulesSignal = signal<ScheduleAggregate[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Stepper state signals
  private readonly stepSignal = signal<number>(1);
  private readonly selectedPropertySignal = signal<any>(null);
  private readonly selectedServiceSignal = signal<ServiceEntity | null>(null);
  private readonly isPriorityRequestSignal = signal<boolean>(false);
  private readonly currentRequestSignal = signal<RequestEntity | null>(null);

  // --- Public readonly accessors ---
  readonly services = this.servicesSignal.asReadonly();
  readonly myRequests = this.myRequestsSignal.asReadonly();
  readonly technicianSchedules = this.schedulesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly errorMessage = this.errorSignal.asReadonly();

  readonly step = this.stepSignal.asReadonly();
  readonly selectedProperty = this.selectedPropertySignal.asReadonly();
  readonly selectedService = this.selectedServiceSignal.asReadonly();
  readonly isPriorityRequest = this.isPriorityRequestSignal.asReadonly();
  readonly currentRequest = this.currentRequestSignal.asReadonly();

  constructor(private sdpApi: SdpApiService) {}

  // --- Stepper Navigation & Selection Methods ---
  setStep(step: number): void {
    this.stepSignal.set(step);
  }

  nextStep(): void {
    this.stepSignal.update(s => s + 1);
  }

  prevStep(): void {
    this.stepSignal.update(s => Math.max(1, s - 1));
  }

  selectProperty(property: any): void {
    this.selectedPropertySignal.set(property);
  }

  selectService(service: ServiceEntity | null): void {
    this.selectedServiceSignal.set(service);
  }

  setPriorityRequest(isPriority: boolean): void {
    this.isPriorityRequestSignal.set(isPriority);
  }

  resetWizard(): void {
    this.stepSignal.set(1);
    this.selectedPropertySignal.set(null);
    this.selectedServiceSignal.set(null);
    this.isPriorityRequestSignal.set(false);
  }

  loadServices(): Observable<ServiceEntity[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.sdpApi.getServices().pipe(
      tap({
        next: services => {
          this.servicesSignal.set(services);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar la lista de servicios.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  addService(service: ServiceEntity): Observable<ServiceEntity> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.sdpApi.createService(service).pipe(
      tap({
        next: created => {
          this.servicesSignal.update(services => [...services, created]);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al crear el servicio.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  loadMyRequests(homeownerId: number): Observable<RequestEntity[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.sdpApi.getRequestsByHomeownerId(homeownerId).pipe(
      tap({
        next: requests => {
          this.myRequestsSignal.set(requests);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar mis solicitudes.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  createRequest(data: CreateRequestResource): Observable<RequestEntity> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.sdpApi.createRequest(data).pipe(
      tap({
        next: created => {
          this.myRequestsSignal.update(requests => [...requests, created]);
          this.loadingSignal.set(false);

          // Simulate backend automatic matching after 4 seconds
          setTimeout(() => {
            const matchedResource: RequestResource = {
              id: created.id,
              homeownerId: created.homeownerId,
              propertyId: created.propertyId,
              serviceId: created.serviceId,
              description: created.description,
              requiresBill: created.requiresBill,
              priority: created.priority,
              status: 'MATCHED',
              assignedTechnicianId: 3 // Assign technician with ID 3 (Luis Torres)
            };
            this.sdpApi.updateRequest(matchedResource, created.id).subscribe(updated => {
              this.myRequestsSignal.update(reqs => reqs.map(r => r.id === updated.id ? updated : r));
            });
          }, 4000);
        },
        error: () => {
          this.errorSignal.set('Error al crear la solicitud. Inténtelo de nuevo.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  loadTechnicianSchedules(technicianId: number): Observable<ScheduleAggregate[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.sdpApi.getSchedulesByTechnicianId(technicianId).pipe(
      tap({
        next: schedules => {
          this.schedulesSignal.set(schedules);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar horarios del técnico.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  createSchedule(data: CreateScheduleResource): Observable<ScheduleAggregate> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.sdpApi.createSchedule(data).pipe(
      tap({
        next: created => {
          this.schedulesSignal.update(schedules => [...schedules, created]);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al crear el horario.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
