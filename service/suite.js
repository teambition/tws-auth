'use strict'
const Service = require('./common')

class Suite extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  getById (_suiteId, token) {
    const url = `${this.options.host}/v1/suites/${_suiteId}`
    return this._requestWithToken('GET', url, null, token)
  }

  updateById (_suiteId, body, token) {
    const url = `${this.options.host}/v1/suites/${_suiteId}`
    return this._requestWithToken('PUT', url, body, token)
  }

  updateAESKeysById (_suiteId, AESKeys, token) {
    if (!Array.isArray(AESKeys)) AESKeys = [AESKeys]

    const url = `${this.options.host}/v1/suites/${_suiteId}/AESKeys`
    return this._requestWithToken('PUT', url, { AESKeys }, token)
  }

  updateCallbackUrlById (_suiteId, callbackUrl, token) {
    const url = `${this.options.host}/v1/suites/${_suiteId}/callbackURL`
    return this._requestWithToken('PUT', url, { callbackURL: callbackUrl }, token)
  }

  updateIpsById (_suiteId, ips, token) {
    if (!Array.isArray(ips)) ips = [ips]

    const url = `${this.options.host}/v1/suites/${_suiteId}/ips`
    return this._requestWithToken('PUT', url, { ips }, token)
  }

  updateIsAccreditedById (_suiteId, isAccredited, token) {
    const url = `${this.options.host}/v1/suites/${_suiteId}/isAccredited`
    return this._requestWithToken('PUT', url, { isAccredited }, token)
  }

  updateIsDisabledById (_suiteId, isDisabled, token) {
    const url = `${this.options.host}/v1/suites/${_suiteId}/isDisabled`
    return this._requestWithToken('PUT', url, { isDisabled }, token)
  }

  updateSecretsById (_suiteId, secrets, token) {
    if (!Array.isArray(secrets)) secrets = [secrets]

    const url = `${this.options.host}/v1/suites/${_suiteId}/secrets`
    return this._requestWithToken('PUT', url, { secrets }, token)
  }

  transfer (_suiteId, _userId, token) {
    const url = `${this.options.host}/v1/suites/${_suiteId}/transfer`
    return this._requestWithToken('PUT', url, { _userId }, token)
  }

  listSuitesByUserId (_userId, token) {
    const url = `${this.options.host}/v1/users/${_userId}/suites`
    return this._requestWithToken('GET', url, null, token)
  }

  createSuites (_creatorId, body, token) {
    const url = `${this.options.host}/v1/users/${_creatorId}/suites`
    return this._requestWithToken('POST', url, body, token)
  }
}

module.exports = Suite
