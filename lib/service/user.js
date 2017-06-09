'use strict'
const Service = require('./common')
const { assertResultWithError } = require('../util/request')

class User extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  verifyCookie (cookie, signature) {
    return this._requestWithToken(
      'POST',
      `${this.options.host}/v1/users/verify/cookie`,
      { cookie, signed: signature },
      this.authorize(this.options.appId, 'self'),
      assertResultWithError
    ).then(({ user }) => user)
  }

  verifyToken (tokenToVerify) {
    return this._requestWithToken(
      'POST',
      `${this.options.host}/v1/users/verify/token`,
      { token: tokenToVerify },
      this.authorize(this.options.appId, 'self'),
      assertResultWithError
    ).then(({ user }) => user)
  }

  getById (_userId) {
    return this._requestWithToken(
      'GET',
      `${this.options.host}/v1/users/${_userId}`,
      null,
      this.authorize(this.options.appId, 'self')
    )
  }

  getByEmail (email) {
    return this._requestWithToken(
      'GET',
      `${this.options.host}/v1/users:getByEmail`,
      { email },
      this.authorize(this.options.appId, 'self')
    )
  }

  batchGetbyIds (_ids) {
    return this._requestWithToken(
      'POST',
      `${this.options.host}/v1/users:BatchGetByIDs`,
      { ids: _ids },
      this.authorize(this.options.appId, 'self')
    )
  }
}

module.exports = User
