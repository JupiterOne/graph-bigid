import {
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  parseTimePropertyValue,
  RelationshipClass,
  Relationship,
  MappedRelationship,
  createMappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { Entities } from '../constants';
import { FindingRow } from '../../types';

function createFindingKey(source: string, name: string) {
  return `${Entities.FINDING._type}:${source}${name}`;
}

export function createFindingEntity(finding: FindingRow): Entity {
  return createIntegrationEntity({
    entityData: {
      source: [],
      assign: {
        _type: Entities.FINDING._type,
        _class: Entities.FINDING._class,
        _key: createFindingKey(
          finding['Data Source'],
          finding['Full Object Name'],
        ),
        name: finding['Full Object Name'],
        owner: finding['Owner'],
        modifiedOn: parseTimePropertyValue(finding['Modified Date']),
        piiCount: parseInt(finding['PII Count']),
        location: finding['Location'],
        entityCount: parseInt(finding['Number of Entities']),
        residencies: finding['Residencies'],
        openAccess: finding['Open Access'],
      },
    },
  });
}

export function createSourceFindingRelationship(
  source: Entity,
  finding: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: source,
    to: finding,
  });
}

export function createS3BucketFindingRelationship(
  dataSource: Entity,
  finding: Entity,
): MappedRelationship {
  return createMappedRelationship({
    _class: RelationshipClass.HAS,
    source: finding,
    target: {
      _type: dataSource._type,
      _key: dataSource._key,
    },
    relationshipDirection: RelationshipDirection.REVERSE,
  });
}
