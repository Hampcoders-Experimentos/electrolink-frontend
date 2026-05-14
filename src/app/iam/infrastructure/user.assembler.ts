import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { User } from '../domain/model/user.entity';
import { AuthenticatedUserResource, UserResource, UsersResponse } from './user.response';

export class UserAssembler extends BaseAssembler<User, UserResource, UsersResponse> {
  toEntityFromResource(resource: UserResource): User {
    return new User({
      id: resource.id,
      username: resource.username,
      email: resource.email,
      roles: resource.roles,
      subscriptionState: resource.subscriptionState
    });
  }

  toEntityFromAuthenticatedResource(resource: AuthenticatedUserResource): User {
    return new User({
      id: resource.id,
      username: resource.username,
      roles: resource.roles || [],
      token: resource.token
    });
  }

  toResourceFromEntity(entity: User): UserResource {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      roles: entity.roles,
      subscriptionState: entity.subscriptionState
    };
  }

  toEntitiesFromResponse(response: UsersResponse): User[] {
    return response.users.map(resource => this.toEntityFromResource(resource));
  }
}
