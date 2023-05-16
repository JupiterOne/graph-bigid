import {
  createMappedRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  RelationshipDirection,
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
  createAccountSourceRelationship,
  createDataSourceEntity,
  createDataSourceKey,
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
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.SCANS,
            _type: MappedRelationships.ACCOUNT_SCANS_DATASTORE._type,
            _mapping: {
              sourceEntityKey: accountEntity._key,
              relationshipDirection: RelationshipDirection.FORWARD,
              targetFilterKeys: [['_type', 'bucketName', 'region']],
              targetEntity: {
                _type: 'aws_s3_bucket',
                bucketName: source.bucket_name,
                region: source.aws_region,
              },
            },
            skipTargetCreation: true,
          }),
        );
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
