'use strict'

const thunk = require('thunks').thunk
const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const urlResolve = require('url').resolve
const request = require('request')

const Store = require('./cache/store')
const UA = require('./util/ua')
const { assertRes } = require('./util/request')

const FIVE_MINUTES = 5 * 60
const MONGO_REG = /^[0-9a-f]{24}$/i

// teambition auth service client
class Client {
  constructor (options) {
    if (!MONGO_REG.test(options.appId)) {
      throw new Error(`appId: ${options.appId} is not a valid mongo object id`)
    }

    if (options.appSecret) {
      options.appSecrets = [options.appSecret]
    }
    if (!Array.isArray(options.appSecrets) || !options.appSecrets.length) {
      throw new Error(`appSecrets required`)
    }

    if (options.cacheStore && !(options.cacheStore instanceof Store)) {
      throw new TypeError('cacheStore should be an instance of Store')
    }

    options.host = options.host || 'https://auth.teambitionapis.com'
    options.timeout = options.timeout || 2000

    this.options = options
  }

  withObject (obj) {
    return Object.assign(Object.create(this), obj)
  }

  signToken (payload, options) {
    return jwt.sign(payload, this.options.appSecrets[0], options)
  }

  decodeToken (token, options) {
    return jwt.decode(token, options)
  }

  verifyToken (token, options) {
    let error = null
    for (let secret of this.options.appSecrets) {
      try {
        return jwt.verify(token, secret, options)
      } catch (err) {
        error = err
      }
    }
    throw createError(401, error)
  }

  requestWithToken (method, url, data, token, assertFunc = assertRes) {
    let headers = { Authorization: `Bearer ${token}`, 'User-Agent': UA }
    if (typeof method === 'object') {
      if (method.headers) headers = Object.assign(headers, method.headers)
      url = method.url
      data = method.data
      token = method.token
      assertFunc = method.assertFunc || assertFunc
      method = method.method
    }

    return thunk.promise((done) => request({
      method,
      url: urlResolve(this.options.host, url),
      headers: headers,
      json: true,
      forever: true,
      body: data,
      timeout: this.options.timeout,
      cert: this.options.certChain,
      key: this.options.privateKey,
      ca: this.options.rootCert,
      resolveWithFullResponse: true
    }, (err, res) => done(err, res))).then(assertFunc)
  }

  requestWithSelfToken (method, url, data, assertFunc = assertRes) {
    return this.authorize(this.options.appId, 'self').then((token) => {
      return this.requestWithToken(method, url, data, token, assertFunc)
    })
  }

  authorize (_resourceId, resourceType) {
    return thunk.promise.call(this, function * () {
      const cacheKey = `${this.options.appId}$${_resourceId}`
      if (this.options.cacheStore) {
        const token = yield this.options.cacheStore.get(cacheKey)
        if (token) return token
      }

      const token = this.signToken({ _appId: this.options.appId })

      const data = yield this.requestWithToken(
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
    })
  }

  // compatibility
  _requestWithToken (method, url, data, token, assertFunc = assertRes) {
    return this.requestWithToken(method, url, data, token, assertFunc)
  }

  // compatibility
  _requestWithSelfToken (method, url, data, assertFunc = assertRes) {
    return this.requestWithSelfToken(method, url, data, assertFunc)
  }
}

module.exports = Client
