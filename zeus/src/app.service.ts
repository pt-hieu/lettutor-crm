import { HttpService } from '@nestjs/axios'
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common'
import type { AxiosResponse } from 'axios'
import { Request } from 'express'
import { stringify } from 'querystring'
import { Observable, catchError, first, lastValueFrom, map } from 'rxjs'

import { EnvService } from './env.service'
import { ParsedResponses, StrapiEntity, StrapiResponse } from './model'

type TPayload = {
  path: string
  req: Request
  query: any
  files?: Array<Express.Multer.File>
}

type TFile = {
  name: string
  buffer: string
}

export type TMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head'

@Injectable()
export class AppService {
  constructor(private env: EnvService, private http: HttpService) {}

  private wrap<T>($obs: Observable<AxiosResponse<T>>) {
    return lastValueFrom(
      $obs.pipe(
        map((res) => res.data),
        first(),
        catchError((e) => {
          if (e.code) {
            throw new InternalServerErrorException(e.code)
          }

          throw new HttpException(e.response.data, e.response.status)
        }),
      ),
    )
  }

  private handleApolloRequest({ req, path, query, files }: TPayload) {
    path = path.slice('apollo'.length)

    const filesToSend = files?.map(
      (file): TFile => ({
        name: file.originalname,
        buffer: file.buffer.toString('base64'),
      }),
    )

    return this.wrap(
      this.http.request({
        method: req.method as TMethod,
        data: {
          ...req.body,
          files: filesToSend,
        },
        url: this.env.apolloService + path + '?' + stringify(query),
        headers: {
          'x-api-key': this.env.apiKey,
          'x-user': JSON.stringify(req.user || ''),
        },
      }),
    )
  }

  private async handlePoseidonRequest({ path, query, req }: TPayload) {
    path = path.slice('poseidon'.length)

    let response: any = await this.wrap<StrapiResponse<any>>(
      this.http.request({
        method: req.method as TMethod,
        data: req.body,
        url: this.env.poseidonService + path + '?' + stringify(query),
      }),
    )

    response = this.processPoseidonResponse(response)
    return response
  }

  private processPoseidonResponse(response: StrapiResponse<StrapiEntity<any>>) {
    let result: Partial<ParsedResponses<any>> = {}
    if (Array.isArray(response.data)) {
      result.items = response.data.map(({ id, attributes }) => {
        Object.entries(attributes).forEach(([key, value]: [string, any]) => {
          if (value && value.data && Array.isArray(value.data)) {
            attributes[key] = value.data.map(({ id, attributes }) => ({
              id,
              ...attributes,
            }))
          }
        })

        return {
          id,
          ...attributes,
        }
      })

      result.meta = {
        currentPage: response.meta.pagination?.page,
        totalPages: response.meta.pagination?.pageCount,
        itemsPerPage: response.meta.pagination?.pageSize,
        totalItems: response.meta.pagination?.total,
      }
    } else {
      result = { id: response.data.id, ...response.data.attributes }
      Object.entries(result).map(([key, value]: [any, any]) => {
        if (value.data && Array.isArray(value.data)) {
          result[key] = value.data.map(({ id, attributes }) => ({
            id,
            ...attributes,
          }))
        }
      })
    }

    return result
  }

  async handleService(payload: TPayload) {
    if (payload.path.startsWith('apollo')) {
      return this.handleApolloRequest(payload)
    }

    if (payload.path.startsWith('poseidon')) {
      return this.handlePoseidonRequest(payload)
    }

    throw new ServiceUnavailableException()
  }
}
