import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { invocationConfig } from '../src';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}
const DEFAULT_URL = 'https://sandbox.bigid.tools';
const DEFAULT_LOGIN = 'dummy-bigid-username';
const DEFAULT_PASSWORD = 'dummy-bigid-password';

export const integrationConfig: IntegrationConfig = {
  baseUrl: process.env.BASE_URL || DEFAULT_URL,
  login: process.env.LOGIN || DEFAULT_LOGIN,
  password: process.env.PASSWORD || DEFAULT_PASSWORD,
};

export function buildStepTestConfigForStep(stepId: string): StepTestConfig {
  return {
    stepId,
    instanceConfig: integrationConfig,
    invocationConfig: invocationConfig as IntegrationInvocationConfig,
  };
}
