'use strict'
const Service = require('./common')
const { assertResultWithError } = require('../util/request')

class User extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  verifyCookie (cookie, signature, token) {
    const url = `${this.options.host}/v1/user/verify/cookie`
    return this._requestWithToken('POST', url, { cookie, signed: signature },
    token, assertResultWithError)
  }

  verifyToken (tokenToVerify, token) {
    const url = `${this.options.host}/v1/user/verify/token`
    return this._requestWithToken('POST', url, { token: tokenToVerify }, token, assertResultWithError)
  }

  getById (_userId, token) {
    const url = `${this.options.host}/v1/users/${_userId}`
    return this._requestWithToken('GET', url, null, token, assertResultWithError)
  }

  getByEmail (email, token) {
    const url = `${this.options.host}/v1/users:getByEmail`
    return this._requestWithToken('GET', url, { email }, token, assertResultWithError)
  }
}

module.exports = User
