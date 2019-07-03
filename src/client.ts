'use strict'

import request from 'request'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { UA } from './ua'

const $setTimeout = setTimeout
const MONGO_REG = /^[0-9a-f]{24}$/i
// Network Errors, exclude 'ETIMEDOUT' and 'ESOCKETTIMEDOUT'
// https://github.com/teambition/tws-auth/issues/15
const RETRIABLE_ERRORS = ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE', 'EAI_AGAIN']

/**
 * Options for request retrying.
 */
export interface RetryOptions {
  retryDelay?: number // (default) wait for 2000 ms before trying again
  maxAttempts?: number // (default) try 3 times
  retryErrorCodes?: string[]
}

/**
 * Extra attributes for response.
 */
export interface ExtraResponse {
  attempts: number
  originalUrl: string
  originalMethod: string
}

/**
 * Options for request Client.
 */
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
export type Response = request.Response & ExtraResponse

/**
 * Client for teambition web service.
 */
export class Client {
  /**
   * a retryable request, wrap of https://github.com/request/request.
   * When the connection fails with one of ECONNRESET, ENOTFOUND, ESOCKETTIMEDOUT, ETIMEDOUT,
   * ECONNREFUSED, EHOSTUNREACH, EPIPE, EAI_AGAIN, the request will automatically be re-attempted as
   * these are often recoverable errors and will go away on retry.
   * @param options request options.
   * @returns a promise with Response.
   */
  public static async request (options: RequestOptions & request.UrlOptions): Promise<Response> {
    const retryDelay = options.retryDelay != null ? Math.floor(options.retryDelay) : 2000
    const maxAttempts = options.maxAttempts != null ? Math.floor(options.maxAttempts) : 3
    const retryErrorCodes = Array.isArray(options.retryErrorCodes) ? options.retryErrorCodes : RETRIABLE_ERRORS

    // default to `false`
    options.followRedirect = options.followRedirect === true

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
  constructor (options: ClientOptions & RetryOptions) {
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
    options.strictSSL = options.strictSSL === true
    options.retryDelay = options.retryDelay == null ? 2000 : options.retryDelay
    options.maxAttempts = options.maxAttempts == null ? 3 : options.maxAttempts

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
      retryDelay: options.retryDelay,
      maxAttempts: options.maxAttempts,
      retryErrorCodes: options.retryErrorCodes,
    } as RequestOptions
  }

  /**
   * @returns User-Agent on the client.
   */
  get UA (): string {
    const ua = this._headers['User-Agent']
    return ua == null ? '' : ua
  }

  /**
   * Set User-Agent to the client.
   * @param ua User-Agent string.
   */
  set UA (ua: string) {
    this._headers['User-Agent'] = ua
  }

  /**
   * @returns host on the client.
   */
  get host () {
    return this._host
  }

  /**
   * @returns preset headers on the client.
   */
  get headers () {
    return this._headers
  }

  /**
   * @returns preset query on the client.
   */
  get query () {
    return this._query
  }

  /**
   * @returns preset request options on the client.
   */
  get requestOptions () {
    return this._requestOptions
  }

  /**
   * Creates (by Object.create) a **new client** instance with given service methods.
   * @param servicePrototype service methods that will be mount to client.
   * @param servicehost service host for new client.
   * @returns a **new client** with with given service methods.
   */
  withService<T> (serviceMethod: T, servicehost: string = ''): this & T {
    const srv = Object.assign<this, T>(Object.create(this), serviceMethod)
    if (servicehost !== '') {
      srv._host = servicehost
    }
    return srv
  }

  /**
   * Creates (by Object.create) a **new client** instance with given request options.
   * @param options request options that will be copy into client.
   * @returns a **new client** with with given request options.
   */
  withOptions (options: RequestOptions): this {
    return Object.assign(Object.create(this), {
      _requestOptions: Object.assign({}, this._requestOptions, options),
    })
  }

  /**
   * Creates (by Object.create) a **new client** instance with given headers.
   * @param headers headers that will be copy into client.
   * @returns a **new client** with with given headers.
   */
  withHeaders (headers: Payload): this {
    return Object.assign(Object.create(this), {
      _headers: Object.assign({}, this._headers, headers),
    })
  }

  /**
   * Creates (by Object.create) a **new client** instance with given query.
   * @param query query that will be copy into client.
   * @returns a **new client** with with given query.
   */
  withQuery (query: Payload): this {
    return Object.assign(Object.create(this), {
      _query: Object.assign({}, this._query, query),
    })
  }

  /**
   * Creates (by withHeaders) a **new client** instance with given `X-Tenant-Id` and `X-Tenant-Type`.
   * @param tenantId that will be added to header as `X-Tenant-Id`.
   * @param tenantType that will be added to header as `X-Tenant-Type`.
   * @returns a **new client** with with given headers.
   */
  withTenant (tenantId: string, tenantType = 'organization') {
    return this.withHeaders({
      'X-Tenant-Id': tenantId,
      'X-Tenant-Type': tenantType,
    })
  }

  /**
   * Creates (by withHeaders) a **new client** instance with given `X-Operator-ID`.
   * @param operatorId that will be added to header as `X-Operator-ID`.
   * @returns a **new client** with with given headers.
   */
  withOperator (operatorId: string) {
    return this.withHeaders({
      'X-Operator-ID': operatorId,
    })
  }

  /**
   * Creates a JWT token string with given payload and client's appSecrets.
   * @param payload Payload to sign, should be an literal object.
   * @param options some JWT sign options.
   * @returns a token string.
   */
  signToken (payload: Payload, options?: jwt.SignOptions) {
    return jwt.sign(payload, this._options.appSecrets[0], options)
  }

  /**
   * Creates a periodical changed JWT token string with appId and appSecrets.
   * @param payload Payload to sign, should be an literal object.
   * @param periodical period in seccond, default to 3600s.
   * @param options some JWT sign options.
   * @returns a token string.
   */
  signAppToken (periodical: number = 3600, options?: jwt.SignOptions) {
    const iat = Math.floor(Date.now() / (1000 * periodical)) * periodical
    const payload = {
      iat,
      exp: iat + Math.floor(1.1 * periodical),
      _appId: this._options.appId,
    }
    // token change in every hour, optimizing for server cache.
    return this.signToken(payload, options)
  }

  /**
   * Decode a JWT token string to literal object payload.
   * @param token token to decode.
   * @param options some JWT decode options.
   * @returns a literal object.
   */
  decodeToken (token: string, options?: jwt.DecodeOptions): Payload {
    return jwt.decode(token, options) as Payload
  }

  /**
   * Decode and verify a JWT token string to literal object payload.
   * if verify failure, it will throw a 401 error (creates by 'http-errors' module)
   * @param token token to decode.
   * @param options some JWT verify options.
   * @returns a literal object.
   */
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

  /**
   * request with given method, url and data.
   * It will genenrate a jwt token by signToken, and set to 'Authorization' header.
   * It will merge headers, query and request options that preset into client.
   * @param method method to request.
   * @param url url to request, it will be resolved with client host.
   * @param data data to request.
   * @returns a promise with Response
   */
  request (method: string, url: string, data?: any) {
    // token change in every hour, optimizing for server cache.
    const token = this.signAppToken()
    const options: RequestOptions & request.UrlOptions = Object.assign({ url: '' }, this._requestOptions)

    options.method = method.toUpperCase()
    options.url = urlJoin(this._host, url)
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

  /**
   * request with `GET` method.
   * @returns a promise with Response body
   */
  get<T> (url: string, data?: any) {
    return this.request('GET', url, data).then(assertRes) as Promise<T>
  }

  /**
   * request with `POST` method.
   * @returns a promise with Response body
   */
  post<T> (url: string, data?: any) {
    return this.request('POST', url, data).then(assertRes) as Promise<T>
  }

  /**
   * request with `PUT` method.
   * @returns a promise with Response body
   */
  put<T> (url: string, data?: any) {
    return this.request('PUT', url, data).then(assertRes) as Promise<T>
  }

  /**
   * request with `PATCH` method.
   * @returns a promise with Response body
   */
  patch<T> (url: string, data?: any) {
    return this.request('PATCH', url, data).then(assertRes) as Promise<T>
  }

  /**
   * request with `DELETE` method.
   * @returns a promise with Response body
   */
  delete<T> (url: string, data?: any) {
    return this.request('DELETE', url, data).then(assertRes) as Promise<T>
  }
}

/**.
 * @returns true if response' statusCode in [200, 300)
 */
export function isSuccess (res: request.RequestResponse) {
  return res.statusCode >= 200 && res.statusCode < 300
}

/**.
 * @returns a promise that delay with given ms time.
 */
export function delay (ms: number) {
  return new Promise((resolve) => $setTimeout(resolve, ms))
}

/**.
 * @returns a Response body or throw a error.
 */
export function assertRes<T> (res: Response): T {
  if (isSuccess(res) && typeof res.body === 'object') {
    return res.body as T
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
  if (typeof res.body === 'string') {
    err.message = res.body
  } else if (res.body != null) {
    err.name = err.error = res.body.error == null ? err.name : res.body.error
    if (res.body.message != null) {
      err.message = res.body.message
    }
  }

  throw err
}

// 简单的 url join，未考虑异常输入，这里不能使用 url.resolve，会丢失 path
export function urlJoin (base: string = '', to: string = ''): string {
  if (base !== '' && to !== '') {
    if (base.endsWith('/')) {
      base = base.slice(0, -1)
    }
    if (!to.startsWith('/')) {
      to = '/' + to
    }
  }

  return base + to
}
