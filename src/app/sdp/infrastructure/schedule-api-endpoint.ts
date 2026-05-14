import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { ScheduleAggregate } from '../domain/model/schedule.entity';
import { CreateScheduleResource, ScheduleResource, SchedulesResponse } from './schedule-response';
import { ScheduleAssembler } from './schedule-assembler';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScheduleApiEndpoint extends BaseApiEndpoint<ScheduleAggregate, ScheduleResource, SchedulesResponse, ScheduleAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/schedules`, new ScheduleAssembler());
  }

  createFromResource(resource: CreateScheduleResource): Observable<ScheduleAggregate> {
    return this.http.post<ScheduleResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create schedule'))
    );
  }

  getByTechnicianId(technicianId: number): Observable<ScheduleAggregate[]> {
    return this.http.get<ScheduleResource[]>(`${this.endpointUrl}?technicianId=${technicianId}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch schedules for technicianId=${technicianId}`))
    );
  }

  updateFromResource(resource: ScheduleResource, id: string | number): Observable<ScheduleAggregate> {
    return this.http.put<ScheduleResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to update schedule with id=${id}`))
    );
  }
}
