import { Injectable } from '@angular/core';
import { BaseApi } from '@shared/infrastructure/base-api';
import { PropertyApiEndpoint } from './property-api-endpoint';
import { Property } from '../domain/model/property.entity';
import { Observable } from 'rxjs';
import { CreatePropertyResource, PropertyResource } from './property-response';

/**
 * Facade service for all Assets BC API operations.
 * Composes the various endpoints (Property, Inventory, Components) into a unified API.
 */
@Injectable({ providedIn: 'root' })
export class AssetsApiService extends BaseApi {

  constructor(public propertyEndpoint: PropertyApiEndpoint) {
    super();
  }

  // --- Property API methods ---

  /**
   * Fetches all properties.
   */
  getProperties(): Observable<Property[]> {
    return this.propertyEndpoint.getAll();
  }

  /**
   * Fetches a single property by its ID.
   */
  getPropertyById(id: string | number): Observable<Property> {
    return this.propertyEndpoint.getById(id);
  }

  /**
   * Creates a new property.
   */
  createProperty(resource: CreatePropertyResource): Observable<Property> {
    return this.propertyEndpoint.createFromResource(resource);
  }

  /**
   * Updates an existing property.
   */
  updateProperty(resource: PropertyResource, id: string | number): Observable<Property> {
    return this.propertyEndpoint.updateFromResource(resource, id);
  }

  /**
   * Deletes a property by its ID.
   */
  deleteProperty(id: string | number): Observable<void> {
    return this.propertyEndpoint.delete(id);
  }

  /**
   * Fetches properties by owner ID.
   */
  getPropertiesByOwnerId(ownerId: number): Observable<Property[]> {
    return this.propertyEndpoint.getByOwnerId(ownerId);
  }
}
