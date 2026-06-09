import { BaseResource, BaseResponse } from '@shared/infrastructure/base-response';

export interface SignUpResource {
  username: string;
  password?: string;
  roles: string[];
}

export interface SignInResource {
  username: string;
  password?: string;
}

export interface UserResource extends BaseResource {
  id: string | number;
  username: string;
  email?: string;
  roles: string[];
  subscriptionState?: string;
}

export interface AuthenticatedUserResource extends BaseResource {
  id: string | number;
  username: string;
  token: string;
  roles: string[];
}

export interface UsersResponse extends BaseResponse {
  users: UserResource[];
}
