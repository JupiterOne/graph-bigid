import { RelationshipClass, StepSpec } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/config';

export const userSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://sandbox.bigid.tools/api/v1/access-management/users
     * PATTERN: Fetch Entities
     */
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [
      {
        resourceName: 'User',
        _type: 'bigid_user',
        _class: ['User'],
      },
    ],
    relationships: [
      {
        _type: 'bigid_account_has_user',
        sourceType: 'bigid_account',
        _class: RelationshipClass.HAS,
        targetType: 'bigid_user',
      },
    ],
    dependsOn: ['fetch-account'],
    implemented: true,
  },
];
