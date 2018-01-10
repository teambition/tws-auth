'use strict'

const thunk = require('thunks').thunk
const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const urlResolve = require('url').resolve
const request = require('requestretry')

const Store = require('./cache/store')
const UA = require('./util/ua')
const { assertRes } = require('./util/request')

const FIVE_MINUTES = 5 * 60
const MONGO_REG = /^[0-9a-f]{24}$/i
const AUTHORIZE_PATH = '/v1/apps/authorize'

// teambition auth service client
class Client {
  static request (options) {
    return thunk.promise((done) => {
      request(Object.assign({
        maxAttempts: 5,
        retryDelay: Math.random() * 200,
        retryStrategy: request.RetryStrategies.NetworkError
      }, options), (err, res) => {
        Object.assign(err || res, {
          originalUrl: options.url,
          originalMethod: options.method
        })

        done(err, res)
      })
    })
  }

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

    if (!(options.cacheStore instanceof Store)) {
      throw new TypeError('cacheStore required and should be an instance of Store')
    }

    let authHost = options.host || 'https://auth.teambitionapis.com'
    options.timeout = options.timeout || 2000
    options.pool = options.pool || { maxSockets: options.maxSockets || 500 }
    options.authUrl = urlResolve(authHost, AUTHORIZE_PATH)

    this.options = options
    this.host = authHost
  }

  withService (servicePrototype, servicehost) {
    if (servicehost) {
      servicePrototype.host = servicehost
    }
    return Object.assign(Object.create(this), servicePrototype)
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
    let headers = { 'User-Agent': UA }
    if (typeof method === 'object') {
      if (method.headers) headers = Object.assign(headers, method.headers)
      url = method.url
      data = method.data
      token = method.token
      assertFunc = method.assertFunc || assertFunc
      method = method.method
    }
    // sopport multi tokens
    if (Array.isArray(token)) {
      token = token.join(', ')
    }
    headers.Authorization = `Bearer ${token}`

    return Client.request({
      method,
      url: urlResolve(this.host, url),
      headers: headers,
      json: true,
      forever: true,
      body: data,
      timeout: this.options.timeout,
      cert: this.options.certChain,
      key: this.options.privateKey,
      ca: this.options.rootCert,
      pool: this.options.pool,
      time: this.options.time
    }).then(assertFunc)
  }

  requestWithSelfToken (method, url, data, assertFunc = assertRes) {
    return this.authorize(this.options.appId, 'self').then((token) => {
      return this.requestWithToken(method, url, data, token, assertFunc)
    })
  }

  authorize (_grantorId, grantorType) {
    return thunk.promise.call(this, function * () {
      const cacheStore = this.options.cacheStore
      const cacheKey = `${this.options.appId}$${_grantorId}`
      let token = yield cacheStore.get(cacheKey)
      if (token) return token

      token = this.signToken({ _appId: this.options.appId })
      const data = yield this.requestWithToken(
        'POST',
        this.options.authUrl,
        {
          _resourceId: _grantorId, // compatibility
          resourceType: grantorType,
          _grantorId: _grantorId,
          grantorType: grantorType,
          _appId: this.options.appId,
          name: 'tws-auth',
          grantType: 'client_credentials'
        },
        token
      )

      yield cacheStore.set(cacheKey, data.access_token,
        data.expires_in > FIVE_MINUTES
                        ? data.expires_in - FIVE_MINUTES
                        : data.expires_in
      )

      return data.access_token
    })
  }
}

module.exports = Client
