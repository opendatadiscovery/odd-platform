import { configuration, UserType } from '../config/configuration';

import APIBase from './api-base';
import auth from './auth';
import { status_is_ok } from './helpers/api-status-check';

export default class LoginService {
  /**
   *
   * @param user
   * @param client
   */
  static async login_as(
    user: UserType,
    client?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const data = {
      client: client || auth.client,
      username: configuration.users[user].username,
      password: configuration.users[user].password,
    };

    console.log(`--->I login as the user ${data.username}`);

    const response = await auth.post('auth/login', {
      data,
    });

    status_is_ok(response);

    const {
      data: { access_token, refresh_token },
    } = response;

    APIBase.auth_token = access_token as string;

    return { access_token, refresh_token };
  }

  static set auth_token(token: string) {
    APIBase.auth_token = token;
  }
}
