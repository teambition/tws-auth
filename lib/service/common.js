'use strict'
const urlResolve = require('url').resolve
const request = require('request')
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

  _request (method, url, data, token) {
    return new Promise((resolve, reject) => {
      request({
        method,
        url: urlResolve(this.options.host, url),
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': UA },
        json: true,
        forever: true,
        body: data,
        timeout: this.options.timeout,
        cert: this.options.certChain,
        key: this.options.privateKey,
        ca: this.options.rootCert
      }, function (err, res, body) {
        if (err) return reject(err)
        return resolve(res)
      })
    })
  }

  _requestWithToken (method, url, data, token, assertFunc = assertRes) {
    return co(function * () {
      return assertFunc(yield this._request(method, url, data, token))
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
      const cacheKey = `${this.options.appId}$${_resourceId}`
      if (this.options.cacheStore) {
        const token = yield this.options.cacheStore.get(cacheKey)
        if (token) return token
      }

      const token = jwt.sign(
        { _appId: this.options.appId },
        this.options.appSecret
      )

      const data = yield this._requestWithToken(
        'POST',
        '/v1/apps/authorize',
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
        yield this.options.cacheStore.set(cacheKey, data.access_token,
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
