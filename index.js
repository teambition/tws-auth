'use strict'

const Store = require('./lib/cache/store')
const Auth = require('./lib/service')

class Client extends Auth {
  constructor (options) {
    super(options)

    this.auth = this // compatibility
    this.user = this.withObject(Auth.user)
  }
}

Client.Auth = Auth
Client.user = Auth.user
Client.UA = require('./lib/util/ua')

Client.Store = Store
Client.RedisStore = require('./lib/cache/redis')
Client.MemoryStore = require('./lib/cache/memory')

const { assertRes, assertResultWithError } = require('./lib/util/request')
Client.assertRes = assertRes
Client.assertResultWithError = assertResultWithError

module.exports = Client
