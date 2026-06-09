import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '@shared/infrastructure/base-api-endpoint';
import { Subscription } from '../domain/model/subscription.entity';
import { CreateSubscriptionResource, SubscriptionResource, SubscriptionsResponse } from './subscription-response';
import { SubscriptionAssembler } from './subscription-assembler';
import { environment } from '@env/environment';
import { catchError, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscriptionsApiEndpoint extends BaseApiEndpoint<Subscription, SubscriptionResource, SubscriptionsResponse, SubscriptionAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/subscriptions`, new SubscriptionAssembler());
  }

  getByUserId(userId: string): Observable<Subscription[]> {
    return this.http.get<SubscriptionResource[]>(`${this.endpointUrl}?userId=${encodeURIComponent(userId)}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch subscriptions for userId=${userId}`))
    );
  }

  createFromResource(resource: CreateSubscriptionResource): Observable<Subscription> {
    return this.http.post<SubscriptionResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create subscription'))
    );
  }

  updateFromResource(resource: SubscriptionResource, id: number): Observable<Subscription> {
    return this.http.put<SubscriptionResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to update subscription with id=${id}`))
    );
  }
}
