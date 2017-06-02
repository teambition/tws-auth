'use strict'
const co = require('co')
const Service = require('./common')
const { assertRes } = require('../util/request')

class Suite extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  getById (_suiteId, token) {
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'GET',
        `${this.options.host}/v1/suites/${_suiteId}`,
        null,
        token
      ))
    }.bind(this))
  }

  updateById (_suiteId, body, token) {
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'PUT',
        `${this.options.host}/v1/suites/${_suiteId}`,
        body,
        token
      ))
    }.bind(this))
  }

  updateAESKeysById (_suiteId, AESKeys, token) {
    if (!Array.isArray(AESKeys)) AESKeys = [AESKeys]
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'PUT',
        `${this.options.host}/v1/suites/${_suiteId}/AESKeys`,
        { AESKeys },
        token
      ))
    }.bind(this))
  }

  updateCallbackUrlById (_suiteId, callbackUrl, token) {
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'PUT',
        `${this.options.host}/v1/suites/${_suiteId}/callbackURL`,
        { callbackURL: callbackUrl },
        token
      ))
    }.bind(this))
  }

  updateIpsById (_suiteId, ips, token) {
    if (!Array.isArray(ips)) ips = [ips]

    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'PUT',
        `${this.options.host}/v1/suites/${_suiteId}/ips`,
        { ips },
        token
      ))
    }.bind(this))
  }

  updateIsAccreditedById (_suiteId, isAccredited, token) {
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'PUT',
        `${this.options.host}/v1/suites/${_suiteId}/isAccredited`,
        { isAccredited },
        token
      ))
    }.bind(this))
  }

  updateIsDisabledById (_suiteId, isDisabled, token) {
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'PUT',
        `${this.options.host}/v1/suites/${_suiteId}/isDisabled`,
        { isDisabled },
        token
      ))
    }.bind(this))
  }

  updateSecretsById (_suiteId, secrets, token) {
    if (!Array.isArray(secrets)) secrets = [secrets]

    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'PUT',
        `${this.options.host}/v1/suites/${_suiteId}/secrets`,
        { secrets },
        token
      ))
    }.bind(this))
  }

  transfer (_suiteId, _userId, token) {
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'PUT',
        `${this.options.host}/v1/suites/${_suiteId}/transfer`,
        { _userId },
        token
      ))
    }.bind(this))
  }

  listSuitesByUserId (_userId, token) {
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'GET',
        `${this.options.host}/v1/users/${_userId}/suites`,
        null,
        token
      ))
    }.bind(this))
  }

  createSuites (_creatorId, body, token) {
    return co(function * () {
      return assertRes(yield this._requestWithToken(
        'POST',
        `${this.options.host}/v1/users/${_creatorId}/suites`,
        body,
        token
      ))
    }.bind(this))
  }
}

module.exports = Suite
