'use strict'
const Service = require('./common')
const { assertResultWithError } = require('../util/request')

class User extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  verifyCookie (cookie, signature) {
    return this._requestWithSelfToken(
      'POST',
      `${this.options.host}/v1/users/verify/cookie`,
      { cookie, signed: signature },
      assertResultWithError
    ).then(({ user }) => user)
  }

  verifyToken (tokenToVerify) {
    return this._requestWithSelfToken(
      'POST',
      `${this.options.host}/v1/users/verify/token`,
      { token: tokenToVerify },
      assertResultWithError
    ).then(({ user }) => user)
  }

  getById (_userId) {
    return this._requestWithSelfToken(
      'GET',
      `${this.options.host}/v1/users/${_userId}`,
      null
    )
  }

  getByEmail (email) {
    return this._requestWithSelfToken(
      'GET',
      `${this.options.host}/v1/users:getByEmail`,
      { email }
    )
  }

  batchGetbyIds (_ids) {
    return this._requestWithSelfToken(
      'POST',
      `${this.options.host}/v1/users:BatchGetByIDs`,
      { ids: _ids }
    )
  }
}

module.exports = User
