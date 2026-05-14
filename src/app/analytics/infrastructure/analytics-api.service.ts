import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HomeOwnerConsumption, TechnicianPerformance, TechnicianRevenue } from '../domain/model/analytics.entity';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  getHomeOwnerConsumption(ownerId: number, months: number): Observable<HomeOwnerConsumption[]> {
    const allMonths: HomeOwnerConsumption[] = [
      { month: 'Ene', energyConsumed: 120, amountPaid: 96 },
      { month: 'Feb', energyConsumed: 145, amountPaid: 116 },
      { month: 'Mar', energyConsumed: 180, amountPaid: 144 },
      { month: 'Abr', energyConsumed: 210, amountPaid: 168 },
      { month: 'May', energyConsumed: 250, amountPaid: 200 }, // Excede umbral de 220
      { month: 'Jun', energyConsumed: 190, amountPaid: 152 },
      { month: 'Jul', energyConsumed: 160, amountPaid: 128 },
      { month: 'Ago', energyConsumed: 175, amountPaid: 140 },
      { month: 'Sep', energyConsumed: 200, amountPaid: 160 },
      { month: 'Oct', energyConsumed: 230, amountPaid: 184 },
      { month: 'Nov', energyConsumed: 195, amountPaid: 156 },
      { month: 'Dic', energyConsumed: 220, amountPaid: 176 },
    ];
    return of(allMonths.slice(-months));
  }

  getTechnicianPerformance(technicianId: number): Observable<TechnicianPerformance> {
    return of({
      technicianId,
      totalServicesCompleted: 48,
      averageRating: 4.9,
      averageCompletionTimeHours: 2.5,
      pendingServices: 3
    });
  }

  getTechnicianRevenue(technicianId: number, months: number): Observable<TechnicianRevenue[]> {
    const allRevenue: TechnicianRevenue[] = [
      { period: 'Jul', totalRevenue: 2100, servicesCount: 12, averageRevenuePerService: 175, recentServices: [] },
      { period: 'Ago', totalRevenue: 2450, servicesCount: 14, averageRevenuePerService: 175, recentServices: [] },
      { period: 'Sep', totalRevenue: 2800, servicesCount: 16, averageRevenuePerService: 175, recentServices: [] },
      { period: 'Oct', totalRevenue: 3150, servicesCount: 18, averageRevenuePerService: 175, recentServices: [] },
      { period: 'Nov', totalRevenue: 2900, servicesCount: 17, averageRevenuePerService: 170, recentServices: [] },
      { period: 'Dic', totalRevenue: 3600, servicesCount: 20, averageRevenuePerService: 180, recentServices: [
        { date: '2026-05-12', clientName: 'Ana Torres', amount: 150 },
        { date: '2026-05-10', clientName: 'Roberto Silva', amount: 250 },
        { date: '2026-05-08', clientName: 'María López', amount: 320 },
        { date: '2026-05-05', clientName: 'Carlos Mendoza', amount: 180 },
        { date: '2026-05-01', clientName: 'Lucía Fernández', amount: 450 }
      ] },
    ];
    return of(allRevenue.slice(-months));
  }
}
