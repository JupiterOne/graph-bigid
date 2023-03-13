import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { Entities } from '../constants';

export function createAccountEntity(): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {
        id: 'bigid-account-id',
        name: 'BigID Account',
      },
      assign: {
        _key: 'bigid-account-id',
        _type: Entities.ACCOUNT._type,
        _class: Entities.ACCOUNT._class,
      },
    },
  });
}
