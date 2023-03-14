import {
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  parseTimePropertyValue,
  RelationshipClass,
  Relationship,
} from '@jupiterone/integration-sdk-core';

import { Entities } from '../constants';
import { DataSource } from '../../types';

export function createDataSourceKey(name: string) {
  return `${Entities.SOURCE._type}:${name}`;
}

export function createDataSourceEntity(source: DataSource): Entity {
  return createIntegrationEntity({
    entityData: {
      // I recommend we purposely don't ingest raw data for this entity.  There is
      // a field listed as `password` that I'm unable to confirm will never be filled
      // in.
      source: [],
      assign: {
        _type: Entities.SOURCE._type,
        _class: Entities.SOURCE._class,
        // If we run into issues, we should consider using _id for the key instead, but
        // this change will complicate the current method we use for relationship
        // creation between source and findings.
        _key: createDataSourceKey(source.name),
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
        owners: source.owners_v2?.map((item) => item.email),
        // When the data source is an AWS bucket, the following items will be populated.
        awsRegion: source.aws_region,
        awsBucket: source.bucket_name,
        // the API doesn't provide a classification, but this is a required field
        classification: null,
      },
    },
  });
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
