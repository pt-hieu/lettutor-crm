import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export const toStrapi = {
  get: <T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    config: AxiosRequestConfig<D> & { token?: string } = {},
  ): Promise<R> => {
    config.withCredentials = false

    config.headers = {}
    config.headers['x-forward-to'] = 'cms'

    if (config.token) {
      config.headers.authorization = 'Bearer ' + config.token
      delete config.token
    }

    return axios.get(url, config)
  },
  post: <T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    data?: D | undefined,
    config: AxiosRequestConfig<D> & { token?: string } = {},
  ): Promise<R> => {
    config.withCredentials = false

    config.headers = {}
    config.headers['x-forward-to'] = 'cms'

    if (config.token) {
      config.headers.authorization = 'Bearer ' + config.token
      delete config.token
    }
    return axios.post(url, data, config)
  },
}
