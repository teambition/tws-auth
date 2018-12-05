'use strict'

import {
  Client, isSuccess, delay, assertRes,
  ClientOptions, RetryOptions, ExtraResponse, Payload, RequestOptions, Response,
} from './client'

const authSrv = {
  /**
   * Checks user' session cookie.
   * @param cookie seesion cookie to check.
   * @param signature cookie' signature to check.
   * @param options request options.
   *
   * @returns a result with user info or a error that cookie is invalid.
   */
  checkUserCookie<T> (
    this: Client, cookie: string, signature: string, options?: RequestOptions,
  ): Promise<T> {
    const client = options == null ? this : this.withOptions(options)
    return client.post(
      '/v1/users/verify/cookie',
      { cookie, signed: signature },
    )
  },

  /**
   * Checks user' access token.
   * @param accessToken access token to check.
   * @param options request options.
   *
   * @returns a result with user info or a error that access token is invalid.
   */
  checkUserToken<T> (
    this: Client, accessToken: string, options?: RequestOptions,
  ): Promise<T> {
    const client = options == null ? this : this.withOptions(options)
    return client.post(
      '/v1/users/verify/token',
      { token: accessToken },
    )
  },

  /**
   * Get a user by it's id.
   * @param _userId user's id.
   *
   * @returns a user info.
   */
  getUserById<T> (
    this: Client, _userId: string,
  ): Promise<T> {
    return this.get(`/v1/users/${_userId}`)
  },

  /**
   * Get a user by it's email.
   * @param email user's email.
   *
   * @returns a user info.
   */
  getUserByEmail<T> (
    this: Client, email: string,
  ): Promise<T> {
    return this.get('/v1/users:getByEmail', { email })
  },

  /**
   * Get many users by their id.
   * @param ids a array of users's id.
   * @param queries a query of fieldmask.
   *
   * @returns a array of users info.
   */
  getUsersbyIds<T> (
    this: Client, ids: string[], queries: object = { fields: '_id,name,avatarUrl' },
  ): Promise<T> {
    // queries 参数目前为 auth 的 fieldmask 功能做支持
    // 例： batchGetbyIds(['51762b8f78cfa9f357000011'], { fields: '_id' })
    return this.withQuery(queries).post(
      `/v1/users:BatchGetByIDs`,
      { ids },
    )
  },
}

/**
 * Auth client with some teambition auth service method.
 * It is a typical example that how to create custom service client with Client.
 * You may need to create your teambition web service client with some useful method.
 */
class TWS extends Client {
  readonly authSrv: Client & typeof authSrv
  constructor (options: ClientOptions) {
    super(options)

    this.authSrv = this.withService(authSrv)
  }
}

export default TWS
export {
  TWS, Client, isSuccess, delay, assertRes, authSrv,
  ClientOptions, RetryOptions, ExtraResponse, Payload, RequestOptions, Response,
}
