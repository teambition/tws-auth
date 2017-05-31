'use strict'
const fs = require('fs')
const validator = require('validator')
const Store = require('./cache/store')
const services = require('./service')

class Client {
  constructor (options) {
    if (!validator.isMongoId(options.appId)) {
      throw new Error(`appId: ${options.appId} is not a valid mongo id`)
    }
    if (options.cacheStore && !(options.cacheStore instanceof Store)) {
      throw new TypeError('cacheStore should be an instance of Store')
    }

    options.host = options.host || 'https://auth.teambitionapis.com'
    options.timeout = options.timeout || 2000
    if (options.certPath) options.cert = fs.readFileSync(options.certPath)

    // Services provided by TWS authorization service
    this.auth = new services.Auth(options)
  }
}

module.exports = Client
