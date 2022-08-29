import dotenv from 'dotenv';

import users from '../config/users.json';
import { ThirdPartyCredentials } from '../common-utilities/interfaces/shared';

dotenv.config({ path: 'envs/.env' });

const { env } = process;

export const print_configuration = () =>
  console.log(`configuration: ${JSON.stringify(configuration, null, 3)}`);
export type UserType = keyof typeof configuration.users;

export const is_on_prod = (): boolean => configuration.environment.startsWith('production');
export const is_on_main = (): boolean => configuration.environment.startsWith('main');
export const ui_performance_tag = `@uiPerformance`;
export const is_on_ci = () => process.env.CI_JOB_ID;

type Scope = string; // todo: make explicit scopes 'ui' | 'api' | 'smoke' | '..after-merge..'
type Users = Record<string, { username: string; password: string }>;
type EnvironmentVariables = {
  readonly users: Users;
  readonly environment: string;
  readonly scope: Scope;
  readonly test_dir: string | undefined;
  readonly skip_teardown: boolean;
  readonly teardown_pattern?: string;
  readonly timeout: number;
  readonly third_party_credentials?: ThirdPartyCredentials;
};
const configuration_defaults: EnvironmentVariables = {
  users: users.odd,
  scope: 'smoke',
  environment: is_on_ci() ? 'main_qatest' : 'main_qatestdevelop',
  test_dir: undefined,
  skip_teardown: false,
  timeout: 40000,
};

type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? Mutable<U>[] : Mutable<T[P]>;
};

const env_with_defaults = (
  configuration_defaults: EnvironmentVariables,
  // @ts-ignore
  env,
): EnvironmentVariables => {
  const result: Mutable<EnvironmentVariables> = configuration_defaults; // so we could assign to result.users for production case
  Object.keys(configuration_defaults)
    .filter(key => key !== 'users')
    .forEach(key => {
      if (env[key.toUpperCase()]) {
        // @ts-ignore
        result[key] = env[key.toUpperCase()];
      }
    });
  if (env.USERS && result.environment.startsWith('production')) {
    // on CI there's always env.USERS. But they contain production credentials, so for non-production environments we don't need to replace defaults
    result.users = JSON.parse(env.USERS as string).odd;
  }

  result.third_party_credentials = JSON.parse(env.THIRD_PARTY_CREDENTIALS as string);

  return result;
};

export const configuration: EnvironmentVariables = env_with_defaults(configuration_defaults, env);
