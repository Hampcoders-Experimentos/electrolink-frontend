import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HomeOwnerConsumption, TechnicianPerformance, TechnicianRevenue } from '../domain/model/analytics.entity';
import { AnalyticsApiService } from '../infrastructure/analytics-api.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private analyticsApi = inject(AnalyticsApiService);

  private readonly consumptionSignal = signal<HomeOwnerConsumption[]>([]);
  private readonly performanceSignal = signal<TechnicianPerformance | null>(null);
  private readonly revenueSignal = signal<TechnicianRevenue[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // --- Public Readonly Accessors ---
  readonly consumption = this.consumptionSignal.asReadonly();
  readonly consumptionData = this.consumptionSignal.asReadonly();

  readonly performance = this.performanceSignal.asReadonly();
  readonly performanceData = this.performanceSignal.asReadonly();

  readonly revenue = this.revenueSignal.asReadonly();
  readonly revenueData = this.revenueSignal.asReadonly();

  readonly loading = this.loadingSignal.asReadonly();
  readonly errorMessage = this.errorSignal.asReadonly();

  loadConsumption(ownerId: number = 1, months: number = 12): Observable<HomeOwnerConsumption[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.analyticsApi.getHomeOwnerConsumption(ownerId, months).pipe(
      tap({
        next: (data) => {
          this.consumptionSignal.set(data);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar datos de consumo.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  loadPerformance(technicianId: number = 1): Observable<TechnicianPerformance> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.analyticsApi.getTechnicianPerformance(technicianId).pipe(
      tap({
        next: (data) => {
          this.performanceSignal.set(data);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar métricas de desempeño.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  loadRevenue(technicianId: number = 1, months: number = 6): Observable<TechnicianRevenue[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.analyticsApi.getTechnicianRevenue(technicianId, months).pipe(
      tap({
        next: (data) => {
          this.revenueSignal.set(data);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar datos de ingresos.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
