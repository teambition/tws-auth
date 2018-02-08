'use strict'
const querystring = require('querystring')
const { assertResultOrError } = require('../util/request')

module.exports = {
  // 将被淘汰，该接口无法区分无效 cookie 验证的 401 错误还是应用请求的 401 错误
  verifyCookie: function (cookie, signature) {
    return this.requestWithSelfToken(
      'POST',
      '/v1/users/verify/cookie',
      { cookie, signed: signature },
      assertResultOrError
    )
  },

  // 将被淘汰，该接口无法区分无效 token 验证的 401 错误还是应用请求的 401 错误
  verifyToken: function (accessToken) {
    return this.requestWithSelfToken(
      'POST',
      '/v1/users/verify/token',
      { token: accessToken },
      assertResultOrError
    )
  },

  // 暂不对第三方应用开放
  checkCookie: function (cookie, signature) {
    return this.requestWithSelfToken(
      'POST',
      '/v1/users/verify/cookie',
      { cookie, signed: signature }
    )
  },

  // 暂不对第三方应用开放
  checkToken: function (accessToken) {
    return this.requestWithSelfToken(
      'POST',
      '/v1/users/verify/token',
      { token: accessToken }
    )
  },

  // 暂不对第三方应用开放
  getById: function (_userId) {
    return this.requestWithSelfToken(
      'GET',
      `/v1/users/${_userId}`,
      null
    )
  },

  // 暂不对第三方应用开放
  getByEmail: function (email) {
    return this.requestWithSelfToken(
      'GET',
      '/v1/users:getByEmail',
      { email }
    )
  },

  // 暂不对第三方应用开放
  batchGetbyIds: function (_ids, queries = {}) {
    // queries 参数目前为 auth 的 fieldmask 功能做支持
    // 例： batchGetbyIds(['51762b8f78cfa9f357000011'], { fields: '_id' })
    return this.requestWithSelfToken(
      'POST',
      `/v1/users:BatchGetByIDs?${querystring.stringify(queries)}`,
      { ids: _ids }
    )
  }
}
