'use strict'

import request from 'request'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { resolve as urlResolve } from 'url'
import { UA } from './ua'

const $setTimeout = setTimeout
const MONGO_REG = /^[0-9a-f]{24}$/i
// Network Errors
const RETRIABLE_ERRORS = ['ECONNRESET', 'ENOTFOUND',
  'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE', 'EAI_AGAIN']

export interface RetryOptions {
  retryDelay?: number
  maxAttempts?: number
  retryErrorCodes?: string[]
}

export interface RetryResponse {
  attempts: number
  originalUrl: string
  originalMethod: string
}

export interface ClientOptions {
  appId: string
  appSecrets: string[]
  timeout?: number
  host?: string
  pool?: any
  maxSockets?: number
  strictSSL?: boolean
  time?: boolean
  certChain?: Buffer
  privateKey?: Buffer
  rootCert?: string | Buffer | string[] | Buffer[]
}

export interface Payload { [key: string]: any }

export type RequestOptions = request.CoreOptions & RetryOptions
export type Response = request.Response & RetryResponse

// teambition auth service client
export class Client {
  public static async request (options: RequestOptions & request.UrlOptions): Promise<Response> {
    const retryDelay = options.retryDelay != null ? Math.floor(options.retryDelay) : 300
    const maxAttempts = options.maxAttempts != null ? Math.min(Math.floor(options.maxAttempts), 10) : 3
    const retryErrorCodes = Array.isArray(options.retryErrorCodes) ? options.retryErrorCodes : RETRIABLE_ERRORS

    let err = null
    let attempts = 0
    while (attempts < maxAttempts) {
      attempts++

      try {
        const res = await new Promise<request.Response>((resolve, reject) => {
          request(options, (error: any, response: request.Response, _body: any) => {
            if (error != null) {
              reject(error)
            } else {
              resolve(response)
            }
          })
        })

        return Object.assign(res, {
          attempts,
          originalUrl: options.url as string,
          originalMethod: options.method as string,
        })
      } catch (e) {
        err = e
        if (!retryErrorCodes.includes(e.code)) {
          break
        }
        await delay(retryDelay)
      }
    }

    throw Object.assign(err, {
      attempts,
      originalUrl: options.url,
      originalMethod: options.method,
    })
  }

  private _options: ClientOptions
  private _host: string
  private _headers: Payload
  private _query: Payload
  private _requestOptions: RequestOptions
  constructor (options: ClientOptions) {
    if (!MONGO_REG.test(options.appId)) {
      throw new Error(`appId: ${options.appId} is not a valid mongo object id`)
    }

    if (!Array.isArray(options.appSecrets) || options.appSecrets.length === 0) {
      throw new Error(`appSecrets required`)
    }

    if (typeof options.host !== 'string' || options.host === '') {
      throw new Error(`host required`)
    }

    options.timeout = options.timeout == null ? 3000 : options.timeout
    options.pool = options.pool == null ?
      { maxSockets: options.maxSockets == null ? 100 : options.maxSockets } : options.pool
    options.strictSSL = options.strictSSL || false

    this._options = options
    this._host = options.host
    this._headers = { 'User-Agent': UA }
    this._query = {}
    this._requestOptions = {
      json: true,
      forever: true,
      strictSSL: options.strictSSL,
      timeout: options.timeout,
      cert: options.certChain,
      key: options.privateKey,
      ca: options.rootCert,
      pool: options.pool,
      time: options.time,
    } as RequestOptions
  }

  get host () {
    return this._host
  }

  get headers () {
    return this._headers
  }

  get query () {
    return this._query
  }

  get requestOptions () {
    return this._requestOptions
  }

  withService<T> (servicePrototype: T, servicehost: string = ''): this & T {
    const srv = Object.assign<this, T>(Object.create(this), servicePrototype)
    if (servicehost !== '') {
      srv._host = servicehost
    }
    return srv
  }

  withOptions (options: RequestOptions): this {
    return Object.assign(Object.create(this), {
      _requestOptions: Object.assign({}, this._requestOptions, options),
    })
  }

  withHeaders (headers: Payload): this {
    return Object.assign(Object.create(this), {
      _headers: Object.assign({}, this._headers, headers),
    })
  }

  withQuery (query: Payload): this {
    return Object.assign(Object.create(this), {
      _query: Object.assign({}, this._query, query),
    })
  }

  withTenant (_tenantId: string, TenantType = 'organization') {
    return this.withHeaders({
      'X-Tenant-Id': _tenantId,
      'X-Tenant-Type': TenantType,
    })
  }

  withOperator (_operatorId: string) {
    return this.withHeaders({
      'X-Operator-ID': _operatorId,
    })
  }

  signToken (payload: Payload, options?: jwt.SignOptions) {
    return jwt.sign(payload, this._options.appSecrets[0], options)
  }

  decodeToken (token: string, options?: jwt.DecodeOptions): Payload {
    return jwt.decode(token, options) as Payload
  }

  verifyToken (token: string, options?: jwt.VerifyOptions): Payload {
    let error = null
    for (const secret of this._options.appSecrets) {
      try {
        return jwt.verify(token, secret, options) as Payload
      } catch (err) {
        error = err
      }
    }
    throw createError(401, error)
  }

  request (method: string, url: string, data?: any) {
    const iat = Math.floor(Date.now() / (1000 * 3600)) * 3600
    const exp = iat + 3660
    // token change in every hour
    const token = this.signToken({ _appId: this._options.appId, iat, exp })
    const options: RequestOptions & request.UrlOptions = Object.assign({ url: '' }, this._requestOptions)

    options.method = method.toUpperCase()
    options.url = urlResolve(this._host, url)
    options.qs = Object.assign({}, options.qs, this._query)
    options.headers =
      Object.assign({}, options.headers, this._headers, { Authorization: `Bearer ${token}` })
    if (data != null) {
      if (options.method === 'GET') {
        options.qs = Object.assign(options.qs, data)
      } else {
        options.body = data
      }
    }
    return Client.request(options)
  }

  get<T> (url: string, data?: any) {
    return this.request('GET', url, data).then(assertRes) as Promise<T>
  }

  post<T> (url: string, data?: any) {
    return this.request('POST', url, data).then(assertRes) as Promise<T>
  }

  put<T> (url: string, data?: any) {
    return this.request('PUT', url, data).then(assertRes) as Promise<T>
  }

  patch<T> (url: string, data?: any) {
    return this.request('PATCH', url, data).then(assertRes) as Promise<T>
  }

  delete<T> (url: string, data?: any) {
    return this.request('DELETE', url, data).then(assertRes) as Promise<T>
  }
}

export function isSuccess (res: request.RequestResponse) {
  return res.statusCode >= 200 && res.statusCode < 300
}

export function delay (ms: number) {
  return new Promise((resolve) => $setTimeout(resolve, ms))
}

export function assertRes (res: Response): any {
  if (isSuccess(res)) {
    return res.body
  }

  // 追加额外的信息，方便调试
  // 注意，不要把调试信息直接返给客户端
  const err = createError(res.statusCode, res.statusMessage, {
    originalUrl: res.originalUrl,
    originalMethod: res.originalMethod,
    headers: res.headers,
    body: res.body,
    elapsedTime: res.elapsedTime == null ? 0 : res.elapsedTime,
    timingPhases: res.timingPhases == null ? {} : res.timingPhases,
  })

  // 标准的 Teambition Web Service 错误响应应该包含 `error` 和 `message` 两个 string 属性
  // 其中 error 为错误码，形如 "InvalidPassword", "UserNotFound"，客户端可以根据该错误码进行 i18n 错误提示处理
  // message 则为英文版的详细错误提示
  if (res.body != null) {
    err.name = err.error = res.body.error == null ? err.name : res.body.error
    if (res.body.message != null) {
      err.message = res.body.message
    }
  }

  throw err
}
