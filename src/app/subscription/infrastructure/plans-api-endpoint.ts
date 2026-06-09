import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '@shared/infrastructure/base-api-endpoint';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './subscription-response';
import { PlanAssembler } from './plan-assembler';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class PlansApiEndpoint extends BaseApiEndpoint<Plan, PlanResource, PlansResponse, PlanAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/plans`, new PlanAssembler());
  }
}
