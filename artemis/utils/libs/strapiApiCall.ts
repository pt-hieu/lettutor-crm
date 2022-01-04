import { AxiosRequestConfig } from 'axios'

export const strapiApiCall =
  <T, S>(token?: string) =>
  (f: (config: AxiosRequestConfig) => (variables: S) => Promise<T>) => {
    const config: AxiosRequestConfig = {
      withCredentials: false,
      headers: {},
    }

    if (token && config.headers) {
      config.headers.authorization = 'Bearer ' + token
    }

    if (process.env.NODE_ENV === 'production' && config.headers)
      config.headers['x-forward-to'] = 'cms'

    return f(config)
  }
