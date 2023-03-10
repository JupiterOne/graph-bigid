import { accountSteps } from './account';
import { dataSourceSteps } from './dataSource';
import { findingSteps } from './findings';
import { userSteps } from './users';

const integrationSteps = [
  ...accountSteps,
  ...dataSourceSteps,
  ...findingSteps,
  ...userSteps,
];

export { integrationSteps };
