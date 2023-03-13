import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { getOrCreateAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { Entities, Steps, Relationships } from '../constants';
import {
  createFindingEntity,
  createSourceFindingRelationship,
} from './converter';
import { createDataSourceKey } from '../dataSource/converter';

export async function fetchFindings({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = getOrCreateAPIClient(instance.config, logger);

  await apiClient.iterateFindings(async (finding) => {
    const findingEntity = await jobState.addEntity(
      createFindingEntity(finding),
    );
    const sourceEntity = await jobState.findEntity(
      createDataSourceKey(finding['Data Source']),
    );

    if (sourceEntity) {
      await jobState.addRelationship(
        createSourceFindingRelationship(sourceEntity, findingEntity),
      );
    }
  });
}

export const findingSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.FINDING,
    name: 'Fetch Findings',
    entities: [Entities.FINDING],
    relationships: [Relationships.SOURCE_HAS_FINDING],
    dependsOn: [Steps.SOURCE],
    executionHandler: fetchFindings,
  },
];
