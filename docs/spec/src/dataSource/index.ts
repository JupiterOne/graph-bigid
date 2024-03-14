import { RelationshipClass, StepSpec } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/config';

export const dataSourceSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://sandbox.bigid.tools/api/v1/ds-connections
     * PATTERN: Fetch Entities
     */
    id: 'fetch-data-sources',
    name: 'Fetch Sources',
    entities: [
      {
        resourceName: 'Data Source',
        _type: 'bigid_datasource',
        _class: ['DataCollection'],
      },
    ],
    relationships: [
      {
        _type: 'bigid_account_scans_datasource',
        sourceType: 'bigid_account',
        _class: RelationshipClass.SCANS,
        targetType: 'bigid_datasource',
      },
      {
        _type: 'bigid_datasource_has_tag',
        sourceType: 'bigid_datasource',
        _class: RelationshipClass.HAS,
        targetType: 'bigid_datasource_tag',
      },
    ],
    dependsOn: ['fetch-account', 'fetch-datasource-tags'],
    implemented: true,
  },
  {
    /**
     * ENDPOINT: https://sandbox.bigid.tools/api/v1/data-catalog/tags/all-pairs
     * PATTERN: Fetch Entities
     */
    id: 'fetch-datasource-tags',
    name: 'Fetch Datasource Tags',
    entities: [
      {
        resourceName: 'Datasource Tag',
        _type: 'bigid_datasource_tag',
        _class: ['Entity'],
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: true,
  },
];
