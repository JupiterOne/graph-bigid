import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationInstanceConfigFieldMap,
  IntegrationInstanceConfig,
} from '@jupiterone/integration-sdk-core';
import { getOrCreateAPIClient } from './client';

export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  baseUrl: {
    type: 'string',
  },
  token: {
    type: 'string',
    mask: true,
  },
};

export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The base URL used for all requests.
   */
  baseUrl: string;

  /**
   * The authentication token used for querying BigID
   */
  token: string;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (!config.baseUrl || !config.token) {
    throw new IntegrationValidationError(
      'Config requires all of {baseUrl, token}',
    );
  }

  const apiClient = getOrCreateAPIClient(config, context.logger);
  await apiClient.verifyAuthentication();
}
