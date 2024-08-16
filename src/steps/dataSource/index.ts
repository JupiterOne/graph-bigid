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
  createAccountScansDatastoreV2MappedRelationship,
  createAccountSourceRelationship,
  createDataSourceEntity,
  createDataSourceKey,
  createDatasourceS3BucketMappedRelationship,
  createDatasourceS3V2BucketMappedRelationship,
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

      const hasS3BucketV1Properties = source.bucket_name && source.aws_region;
      const hasS3BucketV2Properties =
        source.resourceProperties?.resourceEntry && source.systemId;

      if (hasS3BucketV1Properties) {
        await jobState.addRelationships([
          createAccountScansDatastoreMappedRelationship(accountEntity, source),
          createDatasourceS3BucketMappedRelationship(sourceEntity, source),
        ]);
      }

      if (hasS3BucketV2Properties) {
        await jobState.addRelationships([
          createAccountScansDatastoreV2MappedRelationship(
            accountEntity,
            source,
          ),
          createDatasourceS3V2BucketMappedRelationship(sourceEntity, source),
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
    mappedRelationships: [
      MappedRelationships.ACCOUNT_SCANS_DATASTORE,
      MappedRelationships.DATASTORE_IS_AWS_S3_BUCKET,
    ],
    dependsOn: [Steps.ACCOUNT],
    executionHandler: fetchDataSources,
  },
];
