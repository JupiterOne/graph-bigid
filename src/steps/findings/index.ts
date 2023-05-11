import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { getOrCreateAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { Entities, Steps, Relationships } from '../constants';
import {
  createFindingEntity,
  createSourceFindingRelationship,
} from './converter';
import { DataSource } from '../../types';

export async function fetchFindings({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = getOrCreateAPIClient(instance.config, logger);

  // Build lookup for data sources
  const sourceLookup: { [key: number]: string } = {};
  await jobState.iterateEntities({ _type: Entities.SOURCE._type }, (source) => {
    const sourceRawData = getRawData<DataSource>(source);
    if (sourceRawData) {
      sourceLookup[sourceRawData.name] = source._key;
    }
  });

  await apiClient.iterateFindings(async (finding) => {
    const findingEntity = await jobState.addEntity(
      createFindingEntity(finding),
    );
    const sourceEntity = await jobState.findEntity(
      sourceLookup[finding['Data Source']],
    );

    if (sourceEntity) {
      await jobState.addRelationship(
        createSourceFindingRelationship(sourceEntity, findingEntity),
      );
    } else {
      logger.info(
        { findingDataSource: finding['Data Source'] },
        `Skipping relationship creation between source and finding due to missing source in jobState.`,
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
