'use strict'

import { Client, RequestOptions } from "../client"

export default {
  checkUserCookie<T> (
    this: Client, cookie: string, signature: string, options?: RequestOptions,
  ): Promise<T> {
    const client = options == null ? this : this.withOptions(options)
    return client.post(
      '/v1/users/verify/cookie',
      { cookie, signed: signature },
    )
  },

  checkUserToken<T> (
    this: Client, accessToken: string, options?: RequestOptions,
  ): Promise<T> {
    const client = options == null ? this : this.withOptions(options)
    return client.post(
      '/v1/users/verify/token',
      { token: accessToken },
    )
  },

  getUserById<T> (
    this: Client, _userId: string,
  ): Promise<T> {
    return this.get(`/v1/users/${_userId}`)
  },

  getUserByEmail<T> (
    this: Client, email: string,
  ): Promise<T> {
    return this.get('/v1/users:getByEmail', { email })
  },

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
