'use strict'
const validator = require('validator')
const Store = require('./lib/cache/store')
const services = require('./lib/service')

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

    // Services provided by TWS authorization service
    this.auth = new services.Auth(options)
    this.user = new services.User(options)
    this.suite = new services.Suite(options)
  }
}

module.exports = Client
