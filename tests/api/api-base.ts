import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { URL } from 'url';

import { configuration, isOnMain, isOnProd } from '../config/configuration';
import { odd } from '../config/environments.json';

type TInstanceType = 'pilot' | 'auth' | 'api';

export default class APIBase {
  private readonly instanceType: TInstanceType;

  private readonly apiVersion: string;

  protected readonly axiosInstance: AxiosInstance;

  protected readonly env: string = configuration.environment;

  readonly client: string = odd[this.env].match(/.+\/login/)[1];

  readonly referer: string = odd[this.env];

  protected static token: string;

  /**
   *
   * @param instanceType
   * @param apiVersion
   */
  protected constructor(instanceType: TInstanceType, apiVersion = '') {
    this.instanceType = instanceType;
    this.apiVersion = apiVersion;

    const config = {
      baseURL: this.generateUrl(),
      validateStatus: null,
    };

    this.axiosInstance = axios.create(config);
  }

  static set authToken(token: string) {
    APIBase.token = token;
  }

  /**
   *
   * @param prefix
   * @param env
   */
  private addPrefix(prefix: string, env: string): string {
    const url = new URL(env);

    return `${url.protocol}//${prefix}-${url.host}/${this.apiVersion}`;
  }

  private generateUrl() {
    if (isOnProd() || isOnMain()) {
      const url = new URL(odd[this.env] as string);
      const prefix =
        this.instanceType === 'pilot' && isOnProd()
          ? 'app'
          : isOnProd()
          ? `${this.instanceType}.clients`
          : this.instanceType;

      return `${url.protocol}//${prefix}.${url.host.substring('clients'.length + 1)}/${
        this.apiVersion
      }`;
    }
    return this.addPrefix(this.instanceType, odd[this.env] as string);
  }

  /**
   *
   * @param url
   * @param config
   */
  async get(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.request({ method: 'GET', url, ...config });
  }

  /**
   *
   * @param url
   * @param config
   */
  async post(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.request({ method: 'POST', url, ...config });
  }

  /**
   *
   * @param url
   * @param config
   */
  async delete(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.request({ method: 'DELETE', url, ...config });
  }

  /**
   *
   * @param url
   * @param config
   */
  async put(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.request({ method: 'PUT', url, ...config });
  }

  /**
   *
   * @param url
   * @param config
   */
  async patch(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.request({ method: 'PATCH', url, ...config });
  }
}
