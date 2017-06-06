'use strict'
const Service = require('./common')
const { assertResultWithError } = require('../util/request')

class User extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  verifyCookie (cookie, signature, token) {
    const url = `${this.options.host}/v1/users/verify/cookie`
    return this._requestWithToken('POST', url, { cookie, signed: signature },
    token, assertResultWithError).then(({ user }) => user)
  }

  verifyToken (tokenToVerify, token) {
    const url = `${this.options.host}/v1/users/verify/token`
    return this._requestWithToken('POST', url, { token: tokenToVerify }, token, assertResultWithError).then(({ user }) => user)
  }

  getById (_userId, token) {
    const url = `${this.options.host}/v1/users/${_userId}`
    return this._requestWithToken('GET', url, null, token)
  }

  getByEmail (email, token) {
    const url = `${this.options.host}/v1/users:getByEmail`
    return this._requestWithToken('GET', url, { email }, token)
  }

  batchGetbyIds (_ids, token) {
    const url = `${this.options.host}/v1/users:BatchGetByIDs`
    return this._requestWithToken('POST', url, { ids: _ids }, token)
  }
}

module.exports = User
