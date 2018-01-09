'use strict'

const Client = require('./lib/client')
const Store = require('./lib/cache/store')
const userSrv = require('./lib/service/user')
const RedisStore = require('./lib/cache/redis')
const MemoryStore = require('./lib/cache/memory')
const { assertRes } = require('./lib/util/request')

class Auth extends Client {
  constructor (options) {
    super(options)

    this.user = this.withService(Auth.user)
  }
}

Auth.user = userSrv
Auth.Client = Client
Auth.Store = Store
Auth.RedisStore = RedisStore
Auth.MemoryStore = MemoryStore
Auth.assertRes = assertRes
Auth.request = Client.request

module.exports = Auth
