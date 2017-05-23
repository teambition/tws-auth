'use strict'
const Store = require('./store')

class MemoryStore extends Store {
  constructor () {
    super()
    this.map = new Map()
  }

  get (key) {
    const result = this.map.get(key)

    if (!result || result.expiredAt < Date.now()) {
      this.map.delete(key)
      return Promise.resolve(null)
    }

    return Promise.resolve(result.value)
  }

  set (key, value, ttl) {
    return Promise.resolve(this.map.set(key, {
      value,
      expiredAt: Date.now() + ttl
    }))
  }
}

module.exports = MemoryStore
