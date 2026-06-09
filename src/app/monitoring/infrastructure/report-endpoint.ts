import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '@shared/infrastructure/base-api-endpoint';
import { Report } from '../domain/model/report.entity';
import { ReportResource, ReportsResponse, CreateReportResource, CreateReportPhotoResource, ReportPhotoResource } from './report-response';
import { ReportAssembler } from './report-assembler';
import { environment } from '@env/environment';
import { catchError, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportEndpoint extends BaseApiEndpoint<Report, ReportResource, ReportsResponse, ReportAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/reports`, new ReportAssembler());
  }

  createFromResource(resource: CreateReportResource): Observable<Report> {
    return this.http.post<ReportResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create report'))
    );
  }

  getByServiceOperationId(serviceOperationId: string | number): Observable<Report[]> {
    return this.http.get<ReportResource[]>(`${this.endpointUrl}/requests/${serviceOperationId}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch reports for serviceOperationId=${serviceOperationId}`))
    );
  }

  addPhoto(resource: CreateReportPhotoResource): Observable<ReportPhotoResource> {
    const photoEndpointUrl = `${environment.apiBaseUrl}/api/v1/report-photos`;
    return this.http.post<ReportPhotoResource>(photoEndpointUrl, resource).pipe(
      catchError(this.handleError('Failed to add report photo'))
    );
  }

  getPhotosByReportId(reportId: string | number): Observable<ReportPhotoResource[]> {
    const photoEndpointUrl = `${environment.apiBaseUrl}/api/v1/report-photos?reportId=${reportId}`;
    return this.http.get<ReportPhotoResource[]>(photoEndpointUrl).pipe(
      catchError(this.handleError(`Failed to fetch report photos for reportId=${reportId}`))
    );
  }
}
