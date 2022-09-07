import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { URL } from 'url';

import { odd } from '../config/environments.json';
import { configuration, is_on_main, is_on_prod } from '../config/configuration';

type TInstanceType = 'pilot' | 'auth' | 'api';

export default class APIBase {
  private readonly instance_type: TInstanceType;
  private readonly api_version: string;

  protected readonly axios_instance: AxiosInstance;
  protected readonly env: string = configuration.environment;

  // @ts-ignore
  readonly client: string = odd[this.env].match(/.+\/login/)[1];
  // @ts-ignore
  readonly referer: string = odd[this.env];

  protected static token: string;

  /**
   *
   */
  protected constructor(instance_type: TInstanceType, api_version = '') {
    this.instance_type = instance_type;
    this.api_version = api_version;

    const config = {
      baseURL: this.generate_url(),
      validateStatus: null,
    };

    this.axios_instance = axios.create(config);
  }

  static set auth_token(token: string) {
    APIBase.token = token;
  }

  /**
   *
   */
  private add_prefix(prefix: string, env: string): string {
    const url = new URL(env);

    return `${url.protocol}//${prefix}-${url.host}/${this.api_version}`;
  }

  /**
   *
   */
  private generate_url() {
    if (is_on_prod() || is_on_main()) {
      // @ts-ignore
      const url = new URL(odd[this.env] as string);
      const prefix =
        this.instance_type === 'pilot' && is_on_prod()
          ? 'app'
          : is_on_prod()
          ? `${this.instance_type}.clients`
          : this.instance_type;

      return `${url.protocol}//${prefix}.${url.host.substring('clients'.length + 1)}/${
        this.api_version
      }`;
    } else {
      // @ts-ignore
      return this.add_prefix(this.instance_type, odd[this.env] as string);
    }
  }

  /**
   *
   */
  async get(url: string, config?: AxiosRequestConfig) {
    return this.axios_instance.request({ method: 'GET', url, ...config });
  }

  /**
   *
   */
  async post(url: string, config?: AxiosRequestConfig) {
    return this.axios_instance.request({ method: 'POST', url, ...config });
  }

  /**
   *
   */
  async delete(url: string, config?: AxiosRequestConfig) {
    return this.axios_instance.request({ method: 'DELETE', url, ...config });
  }

  /**
   *
   */
  async put(url: string, config?: AxiosRequestConfig) {
    return this.axios_instance.request({ method: 'PUT', url, ...config });
  }

  /**
   *
   */
  async patch(url: string, config?: AxiosRequestConfig) {
    return this.axios_instance.request({ method: 'PATCH', url, ...config });
  }
}
