'use strict'
const redis = require('thunk-redis')
const Store = require('./store')

class RedisStore extends Store {
  constructor (options, prefix = 'TWS_AUTH') {
    if (!options || !options.addrs) throw new Error('options.addrs is required')

    super()
    this.client = redis.createClient(Object.assign(options, { usePromise: true }))
    this.prefix = prefix

    for (const event of ['error', 'close']) {
      this.client.on(event, function (error) { this.emit(event, error) })
    }
  }

  get (key) {
    return this.client.get(this.generateRedisKey(key))
  }

  set (key, value, ttl) {
    return this.client
      .psetex(this.generateRedisKey(key), ttl, value)
  }

  generateRedisKey (key) {
    return `${this.prefix}$${key}`
  }
}

module.exports = RedisStore
