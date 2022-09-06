import { test as base, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { odd } from '../config/environments.json';
import AppService from '../api/app-service';
import { MyProfile } from '../api/interfaces/my-profile';
import LoginService from '../api/login-service';
import CommonUtils from '../common-utilities/common-utils';
import { configuration, UserType } from './configuration';
import { go_to_page } from '../ui/steps/login';
import { Steps } from '../ui/steps';

const workers_folder = `./dist/workers`;
const save_worker_id = (worker_id: string) => {
  fs.writeFileSync(path.resolve(`${workers_folder}/${worker_id}`), worker_id, { flag: 'w' });
};

type AuthData =
  | { auth_type: 'ui'; user: UserType; url?: string }
  | { auth_type: 'public' }
  | { auth_type: 'api'; user: UserType; client?: 'general' };

export const test = base.extend<
  {
    steps: Steps;
    /**
     * Shared beforeEach hook which runs before each `test`
     */
    // @ts-ignore
    shared_before_each;
    /**
     * Logins in application with the defined auth type
     * If 'api' auth type is used for preparing IC for UI test then `go_to_page(page, url?)` should be used after it for navigation to main page/or url.
     *
     * `You do not need to use both auth types in the same test/test suite`
     *
     * @example
     * logins_as({auth_type: 'ui', user: 'admin', url: 'https://example.com'}) - navigates to login page and logins under admin user with UI, navigates to main page or url if passed, and sets the `access_token` in `APIBase`
     * login_as({auth_type: 'api', user: 'power_user'}) - will set `access_token` in `APIBase` (does not perform navigation)
     * login_as({auth_type: 'public'}) - will set `public_access_token' for `PublicAPI`
     * @param auth_type define the auth level
     * @param user user under which the login will be performed
     * @returns Promise<MyProfile | void>
     */
    login_as: (auth_data: AuthData) => Promise<MyProfile | void>;
  },
  { worker_id: string }
>({
  worker_id: [
    async ({ browser }, use) => {
      const worker_id = `-auto-${uuidv4().substring(0, 13)}`;
      save_worker_id(worker_id);
      // Use worker_id value.
      await use(worker_id);
    },
    { scope: 'worker' },
  ],
  steps: async ({ page }, use) => {
    const steps = new Steps({ page });
    await use(steps);
  },
  login_as: async ({ page, context, steps }, use) => {
    const login = async (auth_data: AuthData) => {
      if ('user' in auth_data) {
        if (auth_data.auth_type === 'api') {
          const { access_token, refresh_token } = await LoginService.login_as(
            auth_data.user,
            auth_data.client,
          );

          await context.addCookies([
            // @ts-ignore
            { url: odd[configuration.environment], name: 'access_token', value: access_token },
            {
              // @ts-ignore
              url: odd[configuration.environment],
              name: 'refresh_token',
              value: refresh_token,
            },
          ]);
        } else if (auth_data.auth_type === 'ui') {
          await context.clearCookies();
          await go_to_page(page);

          await steps.pages.login.login({
            username: configuration.users[auth_data.user].username,
            password: configuration.users[auth_data.user].password,
          });

          const access_token = await CommonUtils.wait_until(async () => {
            const [access_token_cookie] = // @ts-ignore
            (await context.cookies([odd[configuration.environment]])).filter(
              cookie => cookie.name === 'access_token',
            );

            if (access_token_cookie) return access_token_cookie.value;
          });

          if (auth_data.url) {
            await go_to_page(page, auth_data.url);
          }

          // @ts-ignore
          LoginService.auth_token = access_token;
        }
      }

      return AppService.get_profile_data();
    };

    await use(login);
  },
  shared_before_each: [
    // @ts-ignore
    async ({ page, browser }, use, testInfo: TestInfo) => {
      // skip automation, that isn't done
      // @ts-ignore
      const tags: string[] = testInfo.titlePath.map(title => title.match(/@\w+/gi)).flat();

      test.skip(tags.includes('@wip'), 'Check under work(tagged with @wip)');
      test.skip(
        tags.includes('@to_be_investigated'),
        'Check under investigation(tagged with @to_be_investigated)',
      );

      await use();
    },
    { scope: 'test', auto: true },
  ], // starts automatically for every test - we pass "auto" for that.
});
