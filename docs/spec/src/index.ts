import { IntegrationSpecConfig } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../../src/config';
import { dataSourceSpec } from './dataSource';
import { accountSpec } from './account';
import { findingSpec } from './findings';
import { userSpec } from './users';

export const invocationConfig: IntegrationSpecConfig<IntegrationConfig> = {
  integrationSteps: [
    ...accountSpec,
    ...dataSourceSpec,
    ...findingSpec,
    ...userSpec,
  ],
};
