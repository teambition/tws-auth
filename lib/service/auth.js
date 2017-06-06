'use strict'
const co = require('co')
const jwt = require('jsonwebtoken')
const Service = require('./common')

const FIVE_MINUTES = 5 * 60

class Auth extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  authorize (_resourceId, resourceType) {
    return co(function * () {
      if (this.options.cacheStore) {
        const token = yield this.options.cacheStore.get(_resourceId)
        if (token) return token
      }

      const token = jwt.sign(
        { _appId: this.options.appId },
        this.options.appSecret
      )

      const data = yield this._requestWithToken(
        'POST',
        `${this.options.host}/v1/apps/authorize`,
        {
          _resourceId,
          resourceType,
          _appId: this.options.appId,
          name: 'tws-auth',
          grantType: 'client_credentials'
        },
        token
      )

      if (this.options.cacheStore) {
        yield this.options.cacheStore.set(_resourceId, data.access_token,
          data.expires_in > FIVE_MINUTES
                           ? data.expires_in - FIVE_MINUTES
                           : data.expires_in
        )
      }

      return data.access_token
    }.bind(this))
  }

  activateApp (_appId, body, token) {
    const url = `${this.options.host}/v1/apps/${_appId}/auths`
    return this._requestWithToken('POST', url, body, token)
  }
}

module.exports = Auth
