import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { ProfilesApiEndpoint } from './profiles-api-endpoint';
import { Profile } from '../domain/model/profile.entity';
import { Observable } from 'rxjs';
import { CreateProfileResource, ProfileResource } from './profiles-response';

/**
 * Facade service for all profile-related API operations.
 * Composes the ProfilesApiEndpoint into a single cohesive API for the application layer.
 */
@Injectable({ providedIn: 'root' })
export class ProfilesApiService extends BaseApi {

  constructor(public profilesEndpoint: ProfilesApiEndpoint) {
    super();
  }

  /**
   * Fetches all profiles.
   */
  getProfiles(): Observable<Profile[]> {
    return this.profilesEndpoint.getAll();
  }

  /**
   * Fetches a single profile by its ID.
   */
  getProfileById(id: number): Observable<Profile> {
    return this.profilesEndpoint.getById(id);
  }

  /**
   * Creates a new profile.
   */
  createProfile(resource: CreateProfileResource): Observable<Profile> {
    return this.profilesEndpoint.createFromResource(resource);
  }

  /**
   * Updates an existing profile.
   */
  updateProfile(resource: ProfileResource, id: number): Observable<Profile> {
    return this.profilesEndpoint.updateFromResource(resource, id);
  }

  /**
   * Deletes a profile by its ID.
   */
  deleteProfile(id: number): Observable<void> {
    return this.profilesEndpoint.delete(id);
  }

  /**
   * Searches profiles by email address.
   */
  searchByEmail(email: string): Observable<Profile[]> {
    return this.profilesEndpoint.searchByEmail(email);
  }

  /**
   * Searches profiles by role.
   */
  searchByRole(role: string): Observable<Profile[]> {
    return this.profilesEndpoint.searchByRole(role);
  }
}
