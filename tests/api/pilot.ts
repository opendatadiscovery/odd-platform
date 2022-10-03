import APIBase from './api-base';

class Pilot extends APIBase {
  constructor() {
    super('pilot', 'api/v2/');

    this.axiosInstance.interceptors.request.use(config => {
      config.headers.common.Authorization = `Bearer ${APIBase.token}`;
      config.headers.common.referer = this.referer;

      return config;
    });
  }
}

export default new Pilot();
