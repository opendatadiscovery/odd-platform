import dotenv from 'dotenv';

import { ThirdPartyCredentials } from '../common-utilities/interfaces/shared';
import users from './users.json';

dotenv.config({ path: 'envs/.env' });

const { env } = process;

export const printConfiguration = () =>
  console.log(`configuration: ${JSON.stringify(configuration, null, 3)}`);
export type UserType = keyof typeof configuration.users;

export const isOnProd = (): boolean => configuration.environment.startsWith('production');
export const isOnMain = (): boolean => configuration.environment.startsWith('main');
export const uiPerformanceTag = `@uiPerformance`;
export const isOnCi = () => process.env.CI_JOB_ID;

type Scope = string; // todo: make explicit scopes 'ui' | 'api' | 'smoke' | '..after-merge..'
type Users = Record<string, { username: string; password: string }>;
type EnvironmentVariables = {
  readonly users: Users;
  readonly environment: string;
  readonly scope: Scope;
  readonly testDir: string | undefined;
  readonly skipTeardown: boolean;
  readonly teardownPattern?: string;
  readonly timeout: number;
  readonly thirdPartyCredentials?: ThirdPartyCredentials;
};
const configurationDefaults: EnvironmentVariables = {
  users: users.odd,
  scope: 'smoke',
  environment: isOnCi() ? 'main_qatest' : 'main_qatestdevelop',
  testDir: undefined,
  skipTeardown: false,
  timeout: 40000,
};

type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? Mutable<U>[] : Mutable<T[P]>;
};

const envWithDefaults = (
  configurationDefaults: EnvironmentVariables,
  env,
): EnvironmentVariables => {
  const result: Mutable<EnvironmentVariables> = configurationDefaults; // so we could assign to result.users for production case
  Object.keys(configurationDefaults)
    .filter(key => key !== 'users')
    .forEach(key => {
      if (env[key.toUpperCase()]) {
        result[key] = env[key.toUpperCase()];
      }
    });
  if (env.USERS && result.environment.startsWith('production')) {
    // on CI there's always env.USERS. But they contain production credentials, so for non-production environments we don't need to replace defaults
    result.users = JSON.parse(env.USERS as string).odd;
  }

  result.thirdPartyCredentials = JSON.parse(env.THIRD_PARTY_CREDENTIALS as string);

  return result;
};

export const configuration: EnvironmentVariables = envWithDefaults(configurationDefaults, env);
