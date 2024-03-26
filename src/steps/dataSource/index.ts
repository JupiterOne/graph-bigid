import {
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { getOrCreateAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { ACCOUNT_ENTITY_KEY } from '../account';
import {
  Entities,
  Steps,
  Relationships,
  MappedRelationships,
} from '../constants';
import {
  createAccountScansDatastoreMappedRelationship,
  createAccountSourceRelationship,
  createDataSourceEntity,
  createDataSourceKey,
  createDatasourceS3BucketMappedRelationship,
} from './converter';

export async function fetchDataSources({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = getOrCreateAPIClient(instance.config, logger);

  const accountEntity = (await jobState.getData(ACCOUNT_ENTITY_KEY)) as Entity;

  // We've seen some instances of our client query for listing data sources having
  // duplicates (all properties identical including name and ids).  To prevent
  // errors, we need to check before adding each data source.

  await apiClient.iterateDataSources(async (source) => {
    if (!(await jobState.findEntity(createDataSourceKey(source._id)))) {
      const sourceEntity = await jobState.addEntity(
        createDataSourceEntity(source),
      );
      await jobState.addRelationship(
        createAccountSourceRelationship(accountEntity, sourceEntity),
      );

      if (source.bucket_name && source.aws_region) {
        await Promise.all([
          jobState.addRelationship(
            createAccountScansDatastoreMappedRelationship(
              accountEntity,
              source,
            ),
          ),
          jobState.addRelationship(
            createDatasourceS3BucketMappedRelationship(sourceEntity, source),
          ),
        ]);
      }
    } else {
      logger.info(
        { sourceName: source.name, sourceId: source._id },
        `Skipping creation of duplicate data source.`,
      );
    }
  });
}

export const dataSourceSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.SOURCE,
    name: 'Fetch Sources',
    entities: [Entities.SOURCE],
    relationships: [Relationships.ACCOUNT_HAS_SOURCE],
    mappedRelationships: [MappedRelationships.ACCOUNT_SCANS_DATASTORE],
    dependsOn: [Steps.ACCOUNT],
    executionHandler: fetchDataSources,
  },
];
