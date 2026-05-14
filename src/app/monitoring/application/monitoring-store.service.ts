import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { ServiceOperation, ServiceOperationStatus } from '../domain/model/service-operation.entity';
import { Report } from '../domain/model/report.entity';
import { Rating } from '../domain/model/rating.entity';
import { MonitoringApiService } from '../infrastructure/monitoring-api.service';
import { Observable, tap } from 'rxjs';
import { CreateServiceOperationResource, UpdateServiceStatusResource } from '../infrastructure/service-operation-response';
import { CreateReportResource, CreateReportPhotoResource, ReportPhotoResource } from '../infrastructure/report-response';
import { CreateRatingResource, RatingResource } from '../infrastructure/rating-response';

export interface TimelineEvent {
  status: ServiceOperationStatus;
  timestamp: Date;
  icon: string;
  color: string;
}

export interface MonitoringState {
  currentServiceOperation: ServiceOperation | null;
  timelineEvents: TimelineEvent[];
  reports: Report[];
  reportPhotos: Record<string, ReportPhotoResource[]>;
  ratings: Rating[];
  loading: boolean;
  errorMessage: string | null;
}

const initialState: MonitoringState = {
  currentServiceOperation: null,
  timelineEvents: [],
  reports: [],
  reportPhotos: {},
  ratings: [],
  loading: false,
  errorMessage: null
};

export const MonitoringStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ currentServiceOperation, ratings }) => ({
    canStart: computed(() => currentServiceOperation()?.status === 'PENDING'),
    canComplete: computed(() => currentServiceOperation()?.status === 'IN_PROGRESS'),
    canCancel: computed(() => {
      const status = currentServiceOperation()?.status;
      return status !== 'COMPLETED' && status !== 'CANCELLED';
    }),
    averageRating: computed(() => {
      const list = ratings();
      if (list.length === 0) return 0;
      const sum = list.reduce((acc, curr) => acc + curr.score, 0);
      return Math.round((sum / list.length) * 10) / 10;
    })
  })),
  withMethods((store, monitoringApi = inject(MonitoringApiService)) => ({

    loadServiceOperation(requestId: string): Observable<ServiceOperation> {
      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.getServiceOperationByRequestId(requestId).pipe(
        tap({
          next: serviceOperation => {
            const events: TimelineEvent[] = [
              {
                status: 'PENDING',
                timestamp: serviceOperation.startedAt,
                icon: 'pi pi-clock',
                color: '#64748B'
              }
            ];
            if (serviceOperation.status === 'IN_PROGRESS' || serviceOperation.status === 'COMPLETED') {
              events.push({
                status: 'IN_PROGRESS',
                timestamp: serviceOperation.startedAt,
                icon: 'pi pi-spin pi-spinner',
                color: '#3B82F6'
              });
            }
            if (serviceOperation.status === 'COMPLETED' && serviceOperation.completedAt) {
              events.push({
                status: 'COMPLETED',
                timestamp: serviceOperation.completedAt,
                icon: 'pi pi-check-circle',
                color: '#10B981'
              });
            }
            if (serviceOperation.status === 'CANCELLED') {
              events.push({
                status: 'CANCELLED',
                timestamp: new Date(),
                icon: 'pi pi-times-circle',
                color: '#EF4444'
              });
            }
            patchState(store, {
              currentServiceOperation: serviceOperation,
              timelineEvents: events,
              loading: false
            });
          },
          error: () => patchState(store, {
            errorMessage: `Error al cargar la operación de servicio para la solicitud ${requestId}.`,
            loading: false
          })
        })
      );
    },

    updateStatus(newStatus: ServiceOperationStatus): Observable<ServiceOperation> {
      const current = store.currentServiceOperation();
      if (!current) {
        throw new Error('No active service operation loaded.');
      }

      const resource: UpdateServiceStatusResource = {
        serviceOperationId: current.id,
        status: newStatus
      };

      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.updateServiceStatus(resource).pipe(
        tap({
          next: updated => {
            const events = [...store.timelineEvents()];
            const timestamp = updated.completedAt || new Date();
            
            if (newStatus === 'IN_PROGRESS') {
              events.push({
                status: 'IN_PROGRESS',
                timestamp,
                icon: 'pi pi-spin pi-spinner',
                color: '#3B82F6'
              });
            } else if (newStatus === 'COMPLETED') {
              events.push({
                status: 'COMPLETED',
                timestamp,
                icon: 'pi pi-check-circle',
                color: '#10B981'
              });
            } else if (newStatus === 'CANCELLED') {
              events.push({
                status: 'CANCELLED',
                timestamp,
                icon: 'pi pi-times-circle',
                color: '#EF4444'
              });
            }

            patchState(store, {
              currentServiceOperation: updated,
              timelineEvents: events,
              loading: false
            });
          },
          error: () => patchState(store, {
            errorMessage: 'Error al actualizar el estado del servicio.',
            loading: false
          })
        })
      );
    },

    loadReports(serviceOperationId: string): Observable<Report[]> {
      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.getReportsByServiceOperationId(serviceOperationId).pipe(
        tap({
          next: reports => patchState(store, { reports, loading: false }),
          error: () => patchState(store, {
            errorMessage: 'Error al cargar los reportes técnicos.',
            loading: false
          })
        })
      );
    },

    addReport(data: CreateReportResource): Observable<Report> {
      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.createReport(data).pipe(
        tap({
          next: created => patchState(store, {
            reports: [...store.reports(), created],
            loading: false
          }),
          error: () => patchState(store, {
            errorMessage: 'Error al crear el reporte técnico.',
            loading: false
          })
        })
      );
    },

    loadReportPhotos(reportId: string): Observable<ReportPhotoResource[]> {
      return monitoringApi.getReportPhotos(reportId).pipe(
        tap({
          next: photos => {
            const map = { ...store.reportPhotos() };
            map[reportId] = photos;
            patchState(store, { reportPhotos: map });
          }
        })
      );
    },

    addPhoto(reportId: string, url: string, fileName: string, contentType: string): Observable<ReportPhotoResource> {
      const resource: CreateReportPhotoResource = {
        reportId,
        url,
        fileName,
        contentType
      };

      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.addReportPhoto(resource).pipe(
        tap({
          next: photo => {
            const map = { ...store.reportPhotos() };
            const existing = map[reportId] || [];
            map[reportId] = [...existing, photo];
            patchState(store, { reportPhotos: map, loading: false });
          },
          error: () => patchState(store, {
            errorMessage: 'Error al subir la fotografía del reporte.',
            loading: false
          })
        })
      );
    },

    loadRatings(technicianId: string): Observable<Rating[]> {
      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.getRatingsByTechnicianId(technicianId).pipe(
        tap({
          next: ratings => patchState(store, { ratings, loading: false }),
          error: () => patchState(store, {
            errorMessage: 'Error al cargar las evaluaciones.',
            loading: false
          })
        })
      );
    },

    addRating(data: CreateRatingResource): Observable<Rating> {
      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.createRating(data).pipe(
        tap({
          next: created => patchState(store, {
            ratings: [created, ...store.ratings()],
            loading: false
          }),
          error: () => patchState(store, {
            errorMessage: 'Error al registrar la evaluación.',
            loading: false
          })
        })
      );
    },

    updateRating(id: string, score: number, comment: string): Observable<Rating> {
      const current = store.ratings().find(r => r.id === id);
      if (!current) {
        throw new Error('Rating not found.');
      }

      const resource: RatingResource = {
        id: current.id,
        requestId: current.requestId,
        technicianId: current.technicianId,
        raterId: current.raterId,
        score,
        comment,
        createdAt: current.createdAt.toISOString()
      };

      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.updateRating(resource, id).pipe(
        tap({
          next: updated => patchState(store, {
            ratings: store.ratings().map(r => r.id === id ? updated : r),
            loading: false
          }),
          error: () => patchState(store, {
            errorMessage: 'Error al actualizar la evaluación.',
            loading: false
          })
        })
      );
    },

    deleteRating(id: string): Observable<void> {
      patchState(store, { loading: true, errorMessage: null });
      return monitoringApi.deleteRating(id).pipe(
        tap({
          next: () => patchState(store, {
            ratings: store.ratings().filter(r => r.id !== id),
            loading: false
          }),
          error: () => patchState(store, {
            errorMessage: 'Error al eliminar la evaluación.',
            loading: false
          })
        })
      );
    },

    clearError(): void {
      patchState(store, { errorMessage: null });
    }
  }))
);
