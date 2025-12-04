import axios from 'axios';
import { toast } from 'react-toastify';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiServerBase } from 'config';

interface ResponseType<T> {
  code: string;
  message: string;
  data: T;
}

class Request {
  instance: AxiosInstance;
  baseConfig: AxiosRequestConfig = { baseURL: '/api', timeout: 60000 };
  token: string | null = null;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(Object.assign({}, this.baseConfig, config));

    this.instance.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        return config;
      },
      (error) => {
        console.error(`something were wrong when fetch ${config?.url}`, error);
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(<T>(response: AxiosResponse<ResponseType<T>>) => {
      const res = response.data;
      const { code, message: errorMessage } = res;
      if (response.config.url?.includes('/connect/token')) {
        return res;
      }

      switch (code) {
        case '20000':
          return res;
        case '20001':
          return {};
        case '50000':
          return null;
        default:
          toast.error(errorMessage);
          return res;
      }
    });
  }

  public async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.request(config);
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T, R>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> {
    return this.instance.post(url, data, config);
  }

  public put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.instance.put(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
  public setToken(token: string) {
    this.token = token;
  }
}

const tokenServer = new Request({
  baseURL: apiServerBase,
});
export { tokenServer };
