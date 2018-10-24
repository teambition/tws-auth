'use strict'

import { Client, RequestOptions } from "../client"

// 暂不对第三方应用开放
export function checkCookie<T> (
  this: Client, cookie: string, signature: string, options?: RequestOptions): Promise<T> {
  const client = options == null ? this : this.withOptions(options)
  return client.request(
    'POST',
    '/v1/users/verify/cookie',
    { cookie, signed: signature },
  )
}

// 暂不对第三方应用开放
export function checkToken<T> (
  this: Client, accessToken: string, options?: RequestOptions): Promise<T> {
  const client = options == null ? this : this.withOptions(options)
  return client.request(
    'POST',
    '/v1/users/verify/token',
    { token: accessToken },
  )
}

// 暂不对第三方应用开放
export function getById<T> (
  this: Client, _userId: string): Promise<T> {
  return this.request(
    'GET',
    `/v1/users/${_userId}`,
  )
}

// 暂不对第三方应用开放
export function getByEmail<T> (
  this: Client, email: string): Promise<T> {
  return this.request(
    'GET',
    '/v1/users:getByEmail',
    { email },
  )
}

// 暂不对第三方应用开放
export function batchGetbyIds<T> (
  this: Client, ids: string[], queries: object): Promise<T> {
  // queries 参数目前为 auth 的 fieldmask 功能做支持
  // 例： batchGetbyIds(['51762b8f78cfa9f357000011'], { fields: '_id' })
  return this.withQuery(queries).request(
    'POST',
    `/v1/users:BatchGetByIDs`,
    { ids },
  )
}
