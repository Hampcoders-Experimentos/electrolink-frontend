import { BaseAssembler } from '@shared/infrastructure/base-assembler';
import { Profile, ProfileRole } from '../domain/model/profile.entity';
import { ProfileResource, ProfilesResponse } from './profiles-response';

/**
 * Assembler for converting between Profile entities and API resources.
 */
export class ProfileAssembler extends BaseAssembler<Profile, ProfileResource, ProfilesResponse> {

  toEntityFromResource(resource: ProfileResource): Profile {
    return new Profile({
      id: resource.id,
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email,
      street: resource.street,
      role: resource.role as ProfileRole,
      dni: resource.dni,
      phoneNumber: resource.phoneNumber,
      specialties: resource.specialties,
      yearsOfExperience: resource.yearsOfExperience,
      certificationCode: resource.certificationCode,
      additionalInfo: resource.additionalInfo,
      latitude: resource.latitude,
      longitude: resource.longitude,
      coverageRadius: resource.coverageRadius
    });
  }

  toResourceFromEntity(entity: Profile): ProfileResource {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      street: entity.street,
      role: entity.role,
      dni: entity.dni,
      phoneNumber: entity.phoneNumber,
      specialties: entity.specialties,
      yearsOfExperience: entity.yearsOfExperience,
      certificationCode: entity.certificationCode,
      additionalInfo: entity.additionalInfo,
      latitude: entity.latitude,
      longitude: entity.longitude,
      coverageRadius: entity.coverageRadius
    };
  }

  toEntitiesFromResponse(response: ProfilesResponse): Profile[] {
    return response.profiles.map(resource => this.toEntityFromResource(resource));
  }
}
