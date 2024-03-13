import { Relationship } from '@jupiterone/integration-sdk-core';
import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from '../../../test/config';
import { Recording, setupProjectRecording } from '../../../test/recording';
import { Steps } from '../constants';

function isMappedRelationship(r: Relationship): boolean {
  return !!r._mapping;
}

function filterDirectRelationships(
  relationships: Relationship[],
): Relationship[] {
  return relationships.filter((r) => !isMappedRelationship(r));
}

// See test/README.md for details
let recording: Recording;
afterEach(async () => {
  await recording.stop();
});

// Skipping because we don't have credentials
test('fetch-datasource-tags', async () => {
  recording = setupProjectRecording({
    directory: __dirname,
    name: 'fetch-datasource-tags',
    options: {
      matchRequestsBy: {
        url: false,
      },
    },
  });

  const stepConfig = buildStepTestConfigForStep(Steps.DATASOURCE_TAG);
  const stepResult = await executeStepWithDependencies(stepConfig);

  expect(stepResult).toMatchStepMetadata(stepConfig);
});

test('fetch-datasource', async () => {
  recording = setupProjectRecording({
    directory: __dirname,
    name: 'fetch-datasource',
    options: {
      matchRequestsBy: {
        url: false,
      },
    },
  });

  const stepConfig = buildStepTestConfigForStep(Steps.SOURCE);
  const stepResult = await executeStepWithDependencies(stepConfig);
  expect({
    ...stepResult,
    // HACK: `@jupiterone/integration-sdk-testing`
    // does not currently support `toMatchStepMetadata` with mapped
    // relationships, which is causing tests to fail. We will add
    // support soon and remove this hack.
    // Originally reported in a separate project by austinkelleher.
    // Reported here by adam-in-ict.
    collectedRelationships: filterDirectRelationships(
      stepResult.collectedRelationships,
    ),
  }).toMatchStepMetadata({
    ...stepConfig,
    invocationConfig: {
      ...stepConfig.invocationConfig,
      integrationSteps: stepConfig.invocationConfig.integrationSteps.map(
        (s) => {
          return {
            ...s,
            mappedRelationships: [],
          };
        },
      ),
    },
  });
});
