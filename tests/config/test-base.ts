import { test as base, TestInfo } from '@playwright/test';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import AppService from '../api/app-service';
import { MyProfile } from '../api/interfaces/my-profile';
import LoginService from '../api/login-service';
import CommonUtils from '../common-utilities/common-utils';
import { Steps } from '../ui/steps';
import { goToPage } from '../ui/steps/login';
import { configuration, UserType } from './configuration';
import { odd } from './environments.json';

const workersFolder = `./dist/workers`;
const saveWorkerId = (workerId: string) => {
  fs.writeFileSync(path.resolve(`${workersFolder}/${workerId}`), workerId, { flag: 'w' });
};

type AuthData =
  | { authType: 'ui'; user: UserType; url?: string }
  | { authType: 'public' }
  | { authType: 'api'; user: UserType; client?: 'general' };

export const test = base.extend<
  {
    steps: Steps;
    /**
     * Shared beforeEach hook which runs before each `test`
     */
    sharedBeforeEach;
    /**
     * Logins in application with the defined auth type
     * If 'api' auth type is used for preparing IC for UI test then `goToPage(page, url?)` should be used after it for navigation to main page/or url.
     *
     * `You do not need to use both auth types in the same test/test suite`
     *
     * @example
     * loginAs({authType: 'ui', user: 'admin', url: 'https://example.com'}) - navigates to login page and logins under admin user with UI, navigates to main page or url if passed, and sets the `accessToken` in `APIBase`
     * loginAs({authType: 'api', user: 'power_user'}) - will set `accessToken` in `APIBase` (does not perform navigation)
     * loginAs({authType: 'public'}) - will set `publicAccessToken' for `PublicAPI`
     * @param authType define the auth level
     * @param user user under which the login will be performed
     * @returns Promise<MyProfile | void>
     */
    loginAs: (authData: AuthData) => Promise<MyProfile | void>;
  },
  { workerId: string }
>({
  workerId: [
    async ({ browser }, use) => {
      const workerId = `-auto-${crypto.randomUUID().substring(0, 13)}`;
      saveWorkerId(workerId);

      await use(workerId);
    },
    { scope: 'worker' },
  ],
  steps: async ({ page }, use) => {
    const steps = new Steps({ page });
    await use(steps);
  },
  loginAs: async ({ page, context, steps }, use) => {
    const login = async (authData: AuthData) => {
      if ('user' in authData) {
        if (authData.authType === 'api') {
          const { accessToken, refreshToken } = await LoginService.loginAs(
            authData.user,
            authData.client,
          );

          await context.addCookies([
            { url: odd[configuration.environment], name: 'accessToken', value: accessToken },
            {
              url: odd[configuration.environment],
              name: 'refreshToken',
              value: refreshToken,
            },
          ]);
        } else if (authData.authType === 'ui') {
          await context.clearCookies();
          await goToPage(page);

          await steps.pages.login.login({
            username: configuration.users[authData.user].username,
            password: configuration.users[authData.user].password,
          });

          const accessToken = await CommonUtils.waitUntil(async () => {
            const [accessTokenCookie] = (
              await context.cookies([odd[configuration.environment]])
            ).filter(cookie => cookie.name === 'accessToken');

            if (accessTokenCookie) return accessTokenCookie.value;
          });

          if (authData.url) {
            await goToPage(page, authData.url);
          }

          LoginService.authToken = accessToken;
        }
      }

      return AppService.getProfileData();
    };

    await use(login);
  },
  sharedBeforeEach: [
    async ({ page, browser }, use, testInfo: TestInfo) => {
      // skip automation, that isn't done
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
