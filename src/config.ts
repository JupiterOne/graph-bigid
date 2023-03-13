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
  login: {
    type: 'string',
  },
  password: {
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
   * The username used to authenticate requests.  USERNAME is a
   * Windows reserved variable, so using LOGIN instead.
   */
  login: string;

  /**
   * The password used to authenticate requests.
   */
  password: string;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (!config.baseUrl || !config.login || !config.password) {
    throw new IntegrationValidationError(
      'Config requires all of {baseUrl, login, password}',
    );
  }

  const apiClient = getOrCreateAPIClient(config, context.logger);
  await apiClient.verifyAuthentication();
}
