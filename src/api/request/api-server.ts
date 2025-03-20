import queryString from 'query-string';
import * as Sentry from '@sentry/nextjs';
import { eventBus, UnAuth } from 'utils/myEvent';
import { apiServerBase, networkType } from 'config';
import { runTimeEnv } from 'utils/env';
import { SentryEvents } from 'types/sentry';
import { telegramNeedAuthList } from '../api-wrap/telegram';
import { tmrwNeedAuthList } from '../url/tmrw';
import { tokenIssueUrl } from 'api/url/tmrw';
export const apiServerBaseURL = apiServerBase + '/api/app';
const defaultServerError = 'The API has an error. Please refresh and retry.';
export const LoginExpiredTip = 'Login expired, please log in again';
// const host = getHost();
const authList = [
  '/proposal/my-info',
  '/dao/my-dao-list',
  '/discussion/new-comment',
  ...tmrwNeedAuthList,
  ...telegramNeedAuthList,
];

const ignoreToastList = [tokenIssueUrl];
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type Params = Record<string, any>;

interface Props extends Params {
  url: string;
  method: Method;
  headers?: Record<string, string>;
}
interface ReqParams {
  url: string;
  options: RequestInit;
}
class RequestFetch {
  token: string | null = null;
  baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  public setToken(token: string) {
    this.token = token;
  }
  interceptorsRequest({ url, method, params, headers }: Props): ReqParams {
    let queryParams = '';
    // let requestPayload = '';
    const token = this.token;
    let reqHeaders: Record<string, string> = { ...headers };
    if (token && authList.find((item) => url.includes(item))) {
      reqHeaders = { ...reqHeaders, Authorization: `Bearer ${token}` };
    }
    url = `${url}`;

    if (method === 'GET') {
      if (params) {
        queryParams = queryString.stringify(params);
        // eslint-disable-next-line prettier/prettier
        url = `${url}?${queryParams}`;
      }
    } else if (method === 'POST') {
      if (Object.prototype.toString.call(params) !== '[object FormData]') {
        reqHeaders = {
          'Content-Type': 'application/json',
          ...reqHeaders,
        };
      }
    }
    const getRequestPayload = () => {
      if (method === 'GET') {
        return undefined;
      }
      if (method === 'POST') {
        if (Object.prototype.toString.call(params) === '[object FormData]') {
          return params;
        } else {
          return JSON.stringify(params);
        }
      }
    };
    const requestPayload = getRequestPayload();
    const cacheString: RequestCache = 'no-store';
    return {
      url,
      options: {
        method,
        headers: reqHeaders,
        body: requestPayload,
        cache: cacheString,
      },
    };
  }

  interceptorsResponse = async <T>(res: Response, req: ReqParams): Promise<T> => {
    if (res.ok) {
      const json = await res.json();
      const { code, message: errorMessage } = json;
      if (code === '20000') {
        return json as T;
      }
      if (ignoreToastList.find((item) => req.url.includes(item))) {
        return json as T;
      }
      if (typeof window !== 'undefined') {
        // toast.error(errorMessage);
      } else {
        Sentry.captureMessage(SentryEvents.SERVER_API_REQUEST_ERROR, {
          level: 'info',
          extra: {
            networkType,
            url: req.url,
            method: req.options.method,
            runtime: runTimeEnv,
            code,
            errorMessage,
          },
        });
      }
      return Promise.reject(errorMessage ? errorMessage : defaultServerError);
    } else {
      let errMessage = '';
      switch (res.status) {
        case 400:
          errMessage = 'Bad Request';
          break;

        case 401:
          eventBus.emit(UnAuth);
          errMessage = 'The signature has expired. Please Login again.';
          break;

        case 404:
          errMessage = 'Not Found';
          break;

        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
          errMessage = `${res.status}: something is wrong in server`;
          break;

        default:
          errMessage = `${res.status}: something is wrong, please try again later`;
          break;
      }

      if (typeof window !== 'undefined') {
        // toast.error(errMessage);
      } else {
        Sentry.captureMessage(SentryEvents.SERVER_API_REQUEST_ERROR, {
          level: 'info',
          extra: {
            networkType,
            url: req.url,
            method: req.options.method,
            runtime: runTimeEnv,
            code: res.status,
            errorMessage: errMessage,
          },
        });
      }
      return Promise.reject(errMessage ? errMessage : defaultServerError);
    }
  };

  async httpFactory<T>({ url = '', params = {}, method, headers }: Props): Promise<T> {
    const req = this.interceptorsRequest({
      url: this.baseURL + url,
      method,
      params: params,
      headers,
    });
    const reqStart = new Date().getTime();
    const res = await fetch(req.url, req.options);
    const reqEnd = new Date().getTime();
    // const logString = `${reqEnd - reqStart}ms ${runTimeEnv} ${req.url}  ${method}  ${reqEnd}`;
    if (runTimeEnv === 'server') {
      Sentry.captureMessage(SentryEvents.SERVER_API_REQUEST_TIMING, {
        level: 'info',
        extra: {
          networkType,
          url: req.url,
          method,
          runtime: runTimeEnv,
          timing: reqEnd - reqStart,
        },
      });
    }
    return this.interceptorsResponse<T>(res, req);
  }

  async request<T>(
    method: Method,
    url: string,
    params?: Params,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.httpFactory<T>({ url, params, method, headers });
  }

  get<T>(url: string, params?: Params): Promise<T> {
    return this.request('GET', url, params);
  }

  post<T>(url: string, params?: Params, headers?: Record<string, string>): Promise<T> {
    return this.request('POST', url, params, headers);
  }

  put<T>(url: string, params?: Params): Promise<T> {
    return this.request('PUT', url, params);
  }

  delete<T>(url: string, params?: Params): Promise<T> {
    return this.request('DELETE', url, params);
  }

  patch<T>(url: string, params?: Params): Promise<T> {
    return this.request('PATCH', url, params);
  }
}

const apiServer = new RequestFetch(apiServerBaseURL);

export { apiServer };
