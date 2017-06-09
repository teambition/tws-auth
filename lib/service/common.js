'use strict'
const urllib = require('urllib')
const co = require('co')
const jwt = require('jsonwebtoken')
const UaComposer = require('user-agent-composer')
const { assertRes } = require('../util/request')
const pkg = require('../../package.json')

const FIVE_MINUTES = 5 * 60
const UA = new UaComposer().product(pkg.name, pkg.version)
                           .ext(`Node.js/${process.version}`)
                           .build()

class Service {
  constructor (options) {
    this.options = options
  }

  _requestWithToken (method, url, data, token, assertFunc = assertRes) {
    return co(function * () {
      return assertFunc(yield urllib.request(url, {
        method,
        data,
        contentType: 'json',
        dataType: 'json',
        ca: this.options.rootCert,
        key: this.options.privateKey,
        cert: this.options.certChain,
        timeout: this.options.timeout,
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': UA }
      }))
    }.bind(this))
  }

  _requestWithSelfToken (method, url, data, assertFunc = assertRes) {
    return co(function * () {
      return yield this._requestWithToken(
        method,
        url,
        data,
        yield this.authorize(this.options.appId, 'self'),
        assertFunc
      )
    }.bind(this))
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
}

module.exports = Service
