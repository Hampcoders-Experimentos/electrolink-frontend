import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Rating } from '../domain/model/rating.entity';
import { RatingResource, RatingsResponse, CreateRatingResource } from './rating-response';
import { RatingAssembler } from './rating-assembler';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RatingEndpoint extends BaseApiEndpoint<Rating, RatingResource, RatingsResponse, RatingAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/ratings`, new RatingAssembler());
  }

  createFromResource(resource: CreateRatingResource): Observable<Rating> {
    return this.http.post<RatingResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create rating'))
    );
  }

  updateFromResource(resource: RatingResource, id: string | number): Observable<Rating> {
    return this.http.put<RatingResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to update rating with id=${id}`))
    );
  }

  getByTechnicianId(technicianId: string | number): Observable<Rating[]> {
    return this.http.get<RatingResource[]>(`${this.endpointUrl}/technicians/${technicianId}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch ratings for technicianId=${technicianId}`))
    );
  }

  getByRequestId(requestId: string | number): Observable<Rating[]> {
    return this.http.get<RatingResource[]>(`${this.endpointUrl}/requests/${requestId}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch ratings for requestId=${requestId}`))
    );
  }
}
