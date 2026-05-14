import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource interface for profile data returned by the API.
 */
export interface ProfileResource extends BaseResource {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  role: string;
  dni?: string;
  phoneNumber?: string;
  specialties?: string;
  yearsOfExperience?: number;
  certificationCode?: string;
  additionalInfo?: string;
  latitude?: number;
  longitude?: number;
  coverageRadius?: number;
}

/**
 * Resource interface for creating a new profile.
 */
export interface CreateProfileResource {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  role: string;
  dni?: string;
  phoneNumber?: string;
  specialties?: string;
  yearsOfExperience?: number;
  certificationCode?: string;
  additionalInfo?: string;
  latitude?: number;
  longitude?: number;
  coverageRadius?: number;
}

/**
 * Response interface wrapping an array of profile resources.
 */
export interface ProfilesResponse extends BaseResponse {
  profiles: ProfileResource[];
}
