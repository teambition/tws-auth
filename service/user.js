'use strict'
const co = require('co')
const Service = require('./common')
const { assertResultWithError } = require('../util/request')

class User extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  login (name, password, requestType, responseType, token) {
    return co(function * () {
      return assertResultWithError(yield this._requestWithToken(
        'POST',
        `${this.options.host}/v1/user/login`,
        {
          name,
          password,
          grant_type: 'password',
          request_type: requestType,
          response_type: responseType
        },
        token
      ))
    }.bind(this))
  }

  verifyCookie (cookie, signature, token) {
    return co(function * () {
      return assertResultWithError(yield this._requestWithToken(
        'POST',
        `${this.options.host}/v1/user/verify/cookie`,
        { cookie, signed: signature },
        token
      ))
    }.bind(this))
  }

  verifyToken (tokenToVerify, token) {
    return co(function * () {
      return assertResultWithError(yield this._requestWithToken(
        'POST',
        `${this.options.host}/v1/user/verify/token`,
        { token: tokenToVerify },
        token
      ))
    }.bind(this))
  }

  getById (_userId, token) {
    return co(function * () {
      return assertResultWithError(yield this._requestWithToken(
        'GET',
        `${this.options.host}/v1/users/${_userId}`,
        null,
        token
      ))
    }.bind(this))
  }

  getByEmail (email, token) {
    return co(function * () {
      return assertResultWithError(yield this._requestWithToken(
        'GET',
        `${this.options.host}/v1/users:getByEmail`,
        { email },
        token
      ))
    }.bind(this))
  }
}

module.exports = User
