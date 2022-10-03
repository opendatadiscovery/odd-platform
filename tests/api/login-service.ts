import { configuration, UserType } from '../config/configuration';

import APIBase from './api-base';
import auth from './auth';
import { isStatusOk } from './helpers/api-status-check';

export default class LoginService {
  /**
   *
   * @param user
   * @param client
   */
  static async loginAs(
    user: UserType,
    client?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const data = {
      client: client || auth.client,
      username: configuration.users[user].username,
      password: configuration.users[user].password,
    };

    console.log(`--->I login as the user ${data.username}`);

    const response = await auth.post('auth/login', {
      data,
    });

    isStatusOk(response);

    const {
      data: { accessToken, refreshToken },
    } = response;

    APIBase.authToken = accessToken as string;

    return { accessToken, refreshToken };
  }

  static set authToken(token: string) {
    APIBase.authToken = token;
  }
}
