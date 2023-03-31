import {
  createMockExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../test/config';
import { setupProjectRecording } from '../test/recording';
import { IntegrationConfig, validateInvocation } from './config';

describe('#validateInvocation', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  test('requires valid config', async () => {
    const executionContext = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: {} as IntegrationConfig,
    });

    await expect(validateInvocation(executionContext)).rejects.toThrow(
      'Config requires all of {baseUrl, token}',
    );
  });

  describe('fails validating invocation', () => {
    describe('invalid user credentials', () => {
      test('should throw if token is invalid', async () => {
        recording = setupProjectRecording({
          directory: __dirname,
          name: 'client-id-auth-error',
          options: {
            recordFailedRequests: true,
          },
        });

        const executionContext = createMockExecutionContext({
          instanceConfig: {
            baseUrl: integrationConfig.baseUrl,
            token: 'INVALID',
          },
        });

        // tests validate that invalid configurations throw an error
        // with an appropriate and expected message.
        await expect(validateInvocation(executionContext)).rejects.toThrow(
          'Provider API failed at https://sandbox.bigid.tools/api/v1/refresh-access-token: 500 Failed to authenticate token.',
        );
      });

      /**
       * Do successful test last so the singleton won't
       * cause the deliberate failures above to succeed.
       */
      test('successfully validates invocation', async () => {
        recording = setupProjectRecording({
          directory: __dirname,
          name: 'validate-invocation',
        });

        // Pass integrationConfig to authenticate with real credentials
        const executionContext = createMockExecutionContext({
          instanceConfig: integrationConfig,
        });

        // successful validateInvocation doesn't throw errors and will be undefined
        await expect(
          validateInvocation(executionContext),
        ).resolves.toBeUndefined();
      });
    });
  });
});
