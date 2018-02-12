'use strict'

const jwt = require('jsonwebtoken')
const request = require('request')
const createError = require('http-errors')
const urlResolve = require('url').resolve
const thunk = require('thunks').thunk

const UA = require('./util/ua')
const Store = require('./cache/store')
const { assertRes } = require('./util/request')

const $setTimeout = setTimeout
const EXPIRE_GAP = 42 // 42 seconds
const MONGO_REG = /^[0-9a-f]{24}$/i
const AUTHORIZE_PATH = '/v1/apps/authorize'
// Network Errors
const RETRIABLE_ERRORS = ['ECONNRESET', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE', 'EAI_AGAIN']

// teambition auth service client
class Client {
  static request (options) {
    return thunk.promise(function * () {
      let err = null
      let attempts = 0
      let retryDelay = options.retryDelay >= 10 ? Math.floor(options.retryDelay) : 300
      let maxAttempts = options.maxAttempts >= 1 ? Math.min(Math.floor(options.maxAttempts), 10) : 3
      let retryErrorCodes = Array.isArray(options.retryErrorCodes) ? options.retryErrorCodes : RETRIABLE_ERRORS

      while (attempts < maxAttempts) {
        attempts++

        try {
          let res = yield (done) => request(options, done)
          // res: [response, body]
          return Object.assign(res[0], {
            attempts: attempts,
            originalUrl: options.url,
            originalMethod: options.method
          })
        } catch (e) {
          err = e
          if (!retryErrorCodes.includes(e.code)) break
          yield (done) => $setTimeout(done, retryDelay)
        }
      }

      throw Object.assign(err, {
        attempts: attempts,
        originalUrl: options.url,
        originalMethod: options.method
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
    options.timeout = options.timeout || 3000
    options.pool = options.pool || { maxSockets: options.maxSockets || 100 }
    options.authUrl = urlResolve(authHost, AUTHORIZE_PATH)
    options.strictSSL = options.strictSSL || false

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
    let options = {
      method: method.toUpperCase(),
      url: urlResolve(this.host, url),
      headers: headers,
      json: true,
      forever: true,
      strictSSL: this.options.strictSSL,
      timeout: this.options.timeout,
      cert: this.options.certChain,
      key: this.options.privateKey,
      ca: this.options.rootCert,
      pool: this.options.pool,
      time: this.options.time
    }

    if (data) {
      if (options.method === 'GET') options.qs = data
      else options.body = data
    }
    return Client.request(options).then(assertFunc)
  }

  requestWithSelfToken (method, url, data, assertFunc = assertRes) {
    return this.authorize(this.options.appId, 'self').then((token) => {
      return this.requestWithToken(method, url, data, token, assertFunc)
    })
  }

  authorize (_grantorId, grantorType) {
    return thunk.promise.call(this, function * () {
      if (!_grantorId || !grantorType) {
        throw new Error(`_grantorId and grantorType required`)
      }

      const cacheStore = this.options.cacheStore
      let cacheKey
      if (this.options.cacheKeyWithType) {
        cacheKey = `${this.options.appId}$${grantorType}$${_grantorId}`
      } else {
        cacheKey = `${this.options.appId}$${_grantorId}`
      }
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
        data.expires_in > EXPIRE_GAP
                        ? data.expires_in - EXPIRE_GAP
                        : data.expires_in - 1
      )

      return data.access_token
    })
  }
}

module.exports = Client
