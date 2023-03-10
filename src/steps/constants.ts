import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const Steps = {
  ACCOUNT: 'fetch-account',
  SOURCE: 'fetch-data-sources',
  FINDING: 'fetch-pii-findings',
  USER: 'fetch-users',
};

export const Entities: Record<
  'ACCOUNT' | 'SOURCE' | 'FINDING' | 'USER',
  StepEntityMetadata
> = {
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'bigid_account',
    _class: ['Account'],
    schema: {
      properties: {},
      required: [],
    },
  },
  SOURCE: {
    resourceName: 'Data Source',
    _type: 'bigid_datasource',
    _class: ['DataCollection'],
    schema: {
      properties: {},
      required: [],
    },
  },
  FINDING: {
    resourceName: 'PII Object',
    _type: 'bigid_pii_object',
    _class: ['Record'],
    schema: {
      properties: {},
      required: [],
    },
  },
  USER: {
    resourceName: 'User',
    _type: 'bigid_user',
    _class: ['User'],
    schema: {
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
  },
};

export const Relationships: Record<
  'ACCOUNT_HAS_USER' | 'ACCOUNT_HAS_SOURCE' | 'SOURCE_HAS_FINDING',
  StepRelationshipMetadata
> = {
  ACCOUNT_HAS_USER: {
    _type: 'bigid_account_has_user',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
  ACCOUNT_HAS_SOURCE: {
    _type: 'bigid_account_scans_datasource',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.SCANS,
    targetType: Entities.SOURCE._type,
  },
  SOURCE_HAS_FINDING: {
    _type: 'bigid_datasource_has_pii_object',
    sourceType: Entities.SOURCE._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.FINDING._type,
  },
};
