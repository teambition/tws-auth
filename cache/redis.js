'use strict'
const redis = require('thunk-redis')
const Store = require('./store')

class RedisStore extends Store {
  constructor (addrs = ['127.0.0.1:6379'], prefix = 'TWS_AUTH') {
    super()
    this.client = redis.createClient(addrs)
    this.prefix = prefix

    for (const event of ['error', 'close']) {
      this.client.on(event, function (error) { this.emit(event, error) })
    }
  }

  * get (key) {
    return yield this.client.get(`${this.prefix}$${key}`)
  }

  * set (key, value) {
    return yield this.client.set(`${this.prefix}$${key}`, value)
  }
}

module.exports = RedisStore
