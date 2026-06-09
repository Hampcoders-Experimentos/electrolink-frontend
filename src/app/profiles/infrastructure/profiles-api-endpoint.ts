import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '@shared/infrastructure/base-api-endpoint';
import { Profile } from '../domain/model/profile.entity';
import { CreateProfileResource, ProfileResource, ProfilesResponse } from './profiles-response';
import { ProfileAssembler } from './profile-assembler';
import { environment } from '@env/environment';
import { catchError, map, Observable } from 'rxjs';

/**
 * API endpoint for profile CRUD operations and specialized searches.
 * Extends BaseApiEndpoint with additional search methods.
 */
@Injectable({ providedIn: 'root' })
export class ProfilesApiEndpoint extends BaseApiEndpoint<Profile, ProfileResource, ProfilesResponse, ProfileAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/profiles`, new ProfileAssembler());
  }

  /**
   * Creates a new profile via the API using a CreateProfileResource.
   * @param resource - The create profile resource data.
   * @returns An Observable emitting the created Profile entity.
   */
  createFromResource(resource: CreateProfileResource): Observable<Profile> {
    return this.http.post<ProfileResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create profile'))
    );
  }

  /**
   * Updates a profile via the API using a ProfileResource.
   * @param resource - The profile resource data to update.
   * @param id - The profile ID.
   * @returns An Observable emitting the updated Profile entity.
   */
  updateFromResource(resource: ProfileResource, id: number): Observable<Profile> {
    return this.http.put<ProfileResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to update profile with id=${id}`))
    );
  }

  /**
   * Searches profiles by email address.
   * @param email - The email to search for.
   * @returns An Observable emitting matching Profile entities.
   */
  searchByEmail(email: string): Observable<Profile[]> {
    return this.http.get<ProfileResource[]>(`${this.endpointUrl}?email=${encodeURIComponent(email)}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to search profiles by email=${email}`))
    );
  }

  /**
   * Searches profiles by role.
   * @param role - The role to filter by ('HOMEOWNER' or 'TECHNICIAN').
   * @returns An Observable emitting matching Profile entities.
   */
  searchByRole(role: string): Observable<Profile[]> {
    return this.http.get<ProfileResource[]>(`${this.endpointUrl}?role=${encodeURIComponent(role)}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to search profiles by role=${role}`))
    );
  }
}
