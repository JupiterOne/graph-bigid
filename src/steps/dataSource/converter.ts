import {
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  parseTimePropertyValue,
  RelationshipClass,
  Relationship,
  assignTags,
  createMappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { Entities, MappedRelationships } from '../constants';
import { DataSource } from '../../types';

export function createDataSourceKey(id: string) {
  return `${Entities.SOURCE._type}:${id}`;
}

export function createDataSourceEntity(source: DataSource): Entity {
  const datasourceSensitiviyTags = source.tags
    ?.filter((tag) => tag.tagName.includes('sensitivityClassification'))
    .map((tag) => tag.tagValue);

  const entity = createIntegrationEntity({
    entityData: {
      // I recommend we purposely don't ingest all raw data for this entity.  There is
      // a field listed as `password` that I'm unable to confirm will never be filled
      // in.
      source: {
        name: source.name,
      },
      assign: {
        _type: Entities.SOURCE._type,
        _class: Entities.SOURCE._class,
        _key: createDataSourceKey(source._id),
        name: source.name,
        displayName: source.name,
        lastScannedOn: parseTimePropertyValue(source.last_scan_at, 'ms'),
        type: source.type,
        scanStrategy: source.scanner_strategy,
        // These two are string instead of epoch like last_scan_at.
        createdOn: parseTimePropertyValue(source.created_at),
        updatedOn: parseTimePropertyValue(source.updated_at),
        active: source.enabled == 'yes',
        // The owners array contains complex objects we can't directly map
        // to a property, so reduce it down to an array of email addresses.
        // If email is unavailable, try id instead (sometimes it is populated)
        // with email even when email is null).
        owners: source.owners_v2?.map((item) =>
          item.email ? item.email : item.id,
        ),
        // When the data source is an AWS bucket, the following items will be populated.
        awsRegion: source.aws_region,
        awsBucket: source.bucket_name,
        // the API doesn't provide a classification, but this is a required field
        classification: null,
      },
    },
  });

  assignTags(entity, datasourceSensitiviyTags);

  return entity;
}

export function createAccountSourceRelationship(
  account: Entity,
  source: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.SCANS,
    from: account,
    to: source,
  });
}

export function createAccountScansDatastoreMappedRelationship(
  account: Entity,
  source: DataSource,
): Relationship {
  return createMappedRelationship({
    _class: RelationshipClass.SCANS,
    _type: MappedRelationships.ACCOUNT_SCANS_DATASTORE._type,
    _mapping: {
      sourceEntityKey: account._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [['_type', 'bucketName', 'region']],
      targetEntity: {
        _type: 'aws_s3_bucket',
        bucketName: source.bucket_name,
        region: source.aws_region,
      },
    },
    skipTargetCreation: true,
  });
}

export function createAccountScansDatastoreV2MappedRelationship(
  account: Entity,
  source: DataSource,
): Relationship {
  return createMappedRelationship({
    _class: RelationshipClass.SCANS,
    _type: MappedRelationships.ACCOUNT_SCANS_DATASTORE._type,
    _mapping: {
      sourceEntityKey: account._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [['_type', 'bucketName', 'region']],
      targetEntity: {
        _type: 'aws_s3_bucket',
        bucketName: source.systemId?.split('/')[1],
        region: source.resourceProperties?.resourceEntry,
      },
    },
    skipTargetCreation: true,
  });
}

export function createDatasourceS3BucketMappedRelationship(
  sourceEntity: Entity,
  source: DataSource,
): Relationship {
  return createMappedRelationship({
    _class: RelationshipClass.IS,
    _type: MappedRelationships.DATASTORE_IS_AWS_S3_BUCKET._type,
    _mapping: {
      sourceEntityKey: sourceEntity._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [['_type', 'bucketName', 'region']],
      targetEntity: {
        _type: 'aws_s3_bucket',
        bucketName: source.bucket_name,
        region: source.aws_region,
      },
    },
    skipTargetCreation: true,
  });
}

export function createDatasourceS3V2BucketMappedRelationship(
  sourceEntity: Entity,
  source: DataSource,
): Relationship {
  return createMappedRelationship({
    _class: RelationshipClass.IS,
    _type: MappedRelationships.DATASTORE_IS_AWS_S3_BUCKET._type,
    _mapping: {
      sourceEntityKey: sourceEntity._key,
      relationshipDirection: RelationshipDirection.FORWARD,
      targetFilterKeys: [['_type', 'bucketName', 'region']],
      targetEntity: {
        _type: 'aws_s3_bucket',
        bucketName: source.systemId?.split('/')[1],
        region: source.resourceProperties?.resourceEntry,
      },
    },
    skipTargetCreation: true,
  });
}
