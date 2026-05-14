import { Injectable, inject } from '@angular/core';
import { Profile } from '../domain/model/profile.entity';
import { ProfilesApiService } from '../infrastructure/profiles-api.service';
import { Observable, tap } from 'rxjs';
import { CreateProfileResource, ProfileResource } from '../infrastructure/profiles-response';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface ProfilesState {
  profiles: Profile[];
  currentProfile: Profile | null;
  coverageRadius: number;
  loading: boolean;
  errorMessage: string | null;
}

const initialState: ProfilesState = {
  profiles: [],
  currentProfile: null,
  coverageRadius: 10000, // 10km default
  loading: false,
  errorMessage: null
};

export const ProfilesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, profilesApi = inject(ProfilesApiService)) => ({
    loadProfiles(): Observable<Profile[]> {
      patchState(store, { loading: true, errorMessage: null });
      return profilesApi.getProfiles().pipe(
        tap({
          next: profiles => patchState(store, { profiles, loading: false }),
          error: () => patchState(store, { errorMessage: 'Error al cargar la lista de perfiles.', loading: false })
        })
      );
    },
    loadProfileById(id: number): Observable<Profile> {
      patchState(store, { loading: true, errorMessage: null });
      return profilesApi.getProfileById(id).pipe(
        tap({
          next: profile => patchState(store, { 
            currentProfile: profile, 
            coverageRadius: profile.coverageRadius || 10000,
            loading: false 
          }),
          error: () => patchState(store, { errorMessage: 'Error al cargar el perfil.', loading: false })
        })
      );
    },
    createProfile(data: CreateProfileResource): Observable<Profile> {
      patchState(store, { loading: true, errorMessage: null });
      return profilesApi.createProfile(data).pipe(
        tap({
          next: created => patchState(store, { 
            profiles: [...store.profiles(), created], 
            loading: false 
          }),
          error: () => patchState(store, { errorMessage: 'Error al crear el perfil. Inténtelo de nuevo.', loading: false })
        })
      );
    },
    updateProfile(data: ProfileResource, id: number): Observable<Profile> {
      patchState(store, { loading: true, errorMessage: null });
      return profilesApi.updateProfile(data, id).pipe(
        tap({
          next: updated => patchState(store, {
            profiles: store.profiles().map(p => p.id === id ? updated : p),
            currentProfile: updated,
            coverageRadius: updated.coverageRadius || 10000,
            loading: false
          }),
          error: () => patchState(store, { errorMessage: 'Error al actualizar el perfil.', loading: false })
        })
      );
    },
    updateCoverage(latitude: number, longitude: number, coverageRadius: number): Observable<Profile> {
      const current = store.currentProfile();
      if (!current) throw new Error('No profile loaded');
      
      const updatedResource: ProfileResource = {
        id: current.id,
        firstName: current.firstName,
        lastName: current.lastName,
        email: current.email,
        street: current.street,
        role: current.role,
        dni: current.dni,
        phoneNumber: current.phoneNumber,
        specialties: current.specialties,
        yearsOfExperience: current.yearsOfExperience,
        certificationCode: current.certificationCode,
        additionalInfo: current.additionalInfo,
        latitude,
        longitude,
        coverageRadius
      };
      
      patchState(store, { loading: true, errorMessage: null });
      return profilesApi.updateProfile(updatedResource, current.id).pipe(
        tap({
          next: updated => patchState(store, {
            profiles: store.profiles().map(p => p.id === current.id ? updated : p),
            currentProfile: updated,
            coverageRadius: updated.coverageRadius || 10000,
            loading: false
          }),
          error: () => patchState(store, { errorMessage: 'Error al actualizar la cobertura.', loading: false })
        })
      );
    },
    deleteProfile(id: number): Observable<void> {
      patchState(store, { loading: true, errorMessage: null });
      return profilesApi.deleteProfile(id).pipe(
        tap({
          next: () => patchState(store, {
            profiles: store.profiles().filter(p => p.id !== id),
            loading: false
          }),
          error: () => patchState(store, { errorMessage: 'Error al eliminar el perfil.', loading: false })
        })
      );
    },
    clearCurrentProfile(): void {
      patchState(store, { currentProfile: null });
    },
    clearError(): void {
      patchState(store, { errorMessage: null });
    }
  }))
);
