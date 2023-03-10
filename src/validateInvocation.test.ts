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
      'Config requires all of {baseUrl, username, password}',
    );
  });

  describe('fails validating invocation', () => {
    describe('invalid user credentials', () => {
      test('should throw if username is invalid', async () => {
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
            username: 'INVALID',
            password: integrationConfig.password,
          },
        });

        // tests validate that invalid configurations throw an error
        // with an appropriate and expected message.
        await expect(validateInvocation(executionContext)).rejects.toThrow(
          'Provider authentication failed at https://sandbox.bigid.tools/api/v1/sessions: 401 Authentication failed.',
        );
      });

      test('should throw if password is invalid', async () => {
        recording = setupProjectRecording({
          directory: __dirname,
          name: 'client-secret-auth-error',
          options: {
            recordFailedRequests: true,
          },
        });

        const executionContext = createMockExecutionContext({
          instanceConfig: {
            baseUrl: integrationConfig.baseUrl,
            username: integrationConfig.username,
            password: 'INVALID',
          },
        });

        await expect(validateInvocation(executionContext)).rejects.toThrow(
          'Provider authentication failed at https://sandbox.bigid.tools/api/v1/sessions: 401 Authentication failed.',
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
