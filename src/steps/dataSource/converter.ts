import {
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  parseTimePropertyValue,
  RelationshipClass,
  Relationship,
} from '@jupiterone/integration-sdk-core';

import { Entities } from '../constants';
import { DataSource, Tag } from '../../types';

export function createDataSourceKey(id: string) {
  return `${Entities.SOURCE._type}:${id}`;
}

export function createDatasourceTagKey(id: string) {
  return `${Entities.DATASOURCE_TAG._type}:${id}`;
}

export function createDataSourceEntity(source: DataSource): Entity {
  return createIntegrationEntity({
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
}

export function createTagEntity(tag: Tag): Entity {
  return createIntegrationEntity({
    entityData: {
      source: tag,
      assign: {
        _type: Entities.DATASOURCE_TAG._type,
        _class: Entities.DATASOURCE_TAG._class,
        _key: createDatasourceTagKey(tag.tagId),
        name: tag.tagName,
        displayName: tag.tagName,
        tagId: tag.tagId,
        valueId: tag.valueId,
        isMutuallyExclusive: tag.isMutuallyExclusive,
        tagName: tag.tagName,
        tagValue: tag.tagValue,
        'properties.applicationType': tag.properties?.applicationType,
        'properties.hidden': tag.properties?.hidden,
        'properties.isExplicit': tag.properties?.isExplicit,
        'properties.explicitValueType': tag.properties?.explicitValueType,
        'properties.displayName': tag.properties?.displayName,
      },
    },
  });
}

export function createDataSourceTagRelationship(
  dataSource: Entity,
  tagId: string,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromKey: dataSource._key,
    fromType: dataSource._type,
    toKey: createDatasourceTagKey(tagId),
    toType: Entities.DATASOURCE_TAG._type,
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
