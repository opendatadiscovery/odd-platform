import APIBase from './api-base';

class Auth extends APIBase {
  constructor() {
    super('auth', 'v1/');
  }
}

export default new Auth();
