import {
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  parseTimePropertyValue,
  RelationshipClass,
  Relationship,
} from '@jupiterone/integration-sdk-core';

import { Entities } from '../constants';
import { User } from '../../types';

function createUserKey(id: string) {
  return `${Entities.USER._type}:${id}`;
}

export function createUserEntity(user: User): Entity {
  return createIntegrationEntity({
    entityData: {
      // I recommend we purposely don't ingest raw data for this entity.  There is
      // a field listed as `password` that I'm unable to confirm will never be filled
      // in.
      source: [],
      assign: {
        _type: Entities.USER._type,
        _class: Entities.USER._class,
        _key: createUserKey(user._id),
        name: user.name,
        displayName: user.name,
        admin: user.admin,
        lastLoginOn: parseTimePropertyValue(user.last_successful_login_at),
      },
    },
  });
}

export function createAccountUserRelationship(
  account: Entity,
  user: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: account,
    to: user,
  });
}
