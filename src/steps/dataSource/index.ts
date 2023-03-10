import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { getOrCreateAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { ACCOUNT_ENTITY_KEY } from '../account';
import { Entities, Steps, Relationships } from '../constants';
import {
  createAccountSourceRelationship,
  createDataSourceEntity,
} from './converter';

export async function fetchDataSources({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = getOrCreateAPIClient(instance.config, logger);

  const accountEntity = (await jobState.getData(ACCOUNT_ENTITY_KEY)) as Entity;

  await apiClient.iterateDataSources(async (user) => {
    const sourceEntity = await jobState.addEntity(createDataSourceEntity(user));
    await jobState.addRelationship(
      createAccountSourceRelationship(accountEntity, sourceEntity),
    );
  });
}

export const dataSourceSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.SOURCE,
    name: 'Fetch Sources',
    entities: [Entities.SOURCE],
    relationships: [Relationships.ACCOUNT_HAS_SOURCE],
    dependsOn: [Steps.ACCOUNT],
    executionHandler: fetchDataSources,
  },
];
