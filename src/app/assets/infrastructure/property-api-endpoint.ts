import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '@shared/infrastructure/base-api-endpoint';
import { Property } from '../domain/model/property.entity';
import { CreatePropertyResource, PropertyResource, PropertiesResponse } from './property-response';
import { PropertyAssembler } from './property-assembler';
import { environment } from '@env/environment';
import { catchError, map, Observable } from 'rxjs';

/**
 * API endpoint for property CRUD operations.
 */
@Injectable({ providedIn: 'root' })
export class PropertyApiEndpoint extends BaseApiEndpoint<Property, PropertyResource, PropertiesResponse, PropertyAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/properties`, new PropertyAssembler());
  }

  /**
   * Creates a new property via the API using a CreatePropertyResource.
   * @param resource - The create property resource data.
   * @returns An Observable emitting the created Property entity.
   */
  createFromResource(resource: CreatePropertyResource): Observable<Property> {
    return this.http.post<PropertyResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create property'))
    );
  }

  /**
   * Updates a property via the API using a PropertyResource.
   * @param resource - The property resource data to update.
   * @param id - The property ID.
   * @returns An Observable emitting the updated Property entity.
   */
  updateFromResource(resource: PropertyResource, id: string | number): Observable<Property> {
    return this.http.put<PropertyResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to update property with id=${id}`))
    );
  }

  /**
   * Fetches properties belonging to a specific owner.
   * @param ownerId - The ID of the owner.
   * @returns An Observable emitting matching Property entities.
   */
  getByOwnerId(ownerId: number): Observable<Property[]> {
    return this.http.get<PropertyResource[]>(`${this.endpointUrl}?ownerId=${ownerId}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch properties for ownerId=${ownerId}`))
    );
  }
}
