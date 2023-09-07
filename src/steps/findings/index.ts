import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  getRawData,
} from '@jupiterone/integration-sdk-core';

import { getOrCreateAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import {
  Entities,
  Steps,
  Relationships,
  MappedRelationships,
} from '../constants';
import {
  createFindingEntity,
  createSourceFindingRelationship,
  createS3BucketFindingRelationship,
} from './converter';
import { DataSource } from '../../types';

function isAwsS3Bucket(sourceEntity): boolean {
  return !!sourceEntity.awsRegion && !!sourceEntity.awsBucket;
}

export async function fetchFindings({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = getOrCreateAPIClient(instance.config, logger);

  // Iterate through Data Sources and download findings for each one separately.  This
  // helps us avoid timeout issues when hitting thefindings endpoint.
  await jobState.iterateEntities(
    { _type: Entities.SOURCE._type },
    async (source) => {
      const sourceRawData = getRawData<DataSource>(source);
      if (sourceRawData) {
        await apiClient.iterateFindings(sourceRawData.name, async (finding) => {
          // The filter used for querying Findings per data source doesn't allow for an exact match.
          // This means that a query with the filter `source=Songs` would return findings for both
          // data sources named "Songs" as well as data sources named "SongsHistory".  We have to
          // make sure we're only ingesting for the specific data source we wanted in order to
          // avoid duplication of findings in the job state.
          // console.log('finding:', finding);
          if (finding['Data Source'] == sourceRawData.name) {
            const findingEntity = await jobState.addEntity(
              createFindingEntity(finding),
            );
            const sourceEntity = await jobState.findEntity(source._key);

            // This shouldn't happen, but strictly speaking the sourceEntity still *could* be null.
            if (sourceEntity) {
              if (isAwsS3Bucket(source)) {
                await jobState.addRelationship(
                  createS3BucketFindingRelationship(
                    sourceEntity,
                    findingEntity,
                  ),
                );
              } else {
                await jobState.addRelationship(
                  createSourceFindingRelationship(sourceEntity, findingEntity),
                );
              }
            } else {
              logger.info(
                { findingDataSource: finding['Data Source'] },
                `Skipping relationship creation between source and finding due to missing source in jobState.`,
              );
            }
          }
        });
      }
    },
  );
}

export const findingSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.FINDING,
    name: 'Fetch Findings',
    entities: [Entities.FINDING],
    relationships: [Relationships.SOURCE_HAS_FINDING],
    mappedRelationships: [MappedRelationships.AWS_S3_BUCKET_HAS_FINDING],
    dependsOn: [Steps.SOURCE],
    executionHandler: fetchFindings,
  },
];
