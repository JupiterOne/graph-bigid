import {
  RelationshipClass,
  RelationshipDirection,
  StepSpec,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/config';

export const findingSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://sandbox.bigid.tools/api/v1/piiRecords/objects/file-download/export
     * PATTERN: Fetch Entities
     */
    id: 'fetch-pii-findings',
    name: 'Fetch Findings',
    entities: [
      {
        resourceName: 'PII Object',
        _type: 'bigid_pii_object',
        _class: ['Record'],
      },
    ],
    relationships: [
      {
        _type: 'bigid_datasource_has_pii_object',
        sourceType: 'bigid_datasource',
        _class: RelationshipClass.HAS,
        targetType: 'bigid_pii_object',
      },
    ],
    mappedRelationships: [
      {
        _type: 'aws_s3_bucket_has_pii_object',
        _class: RelationshipClass.HAS,
        direction: RelationshipDirection.REVERSE,
        sourceType: 'bigid_pii_object',
        targetType: 'aws_s3_bucket',
      },
    ],
    dependsOn: ['fetch-data-sources'],
    implemented: true,
  },
];
