'use strict'

const EventEmitter = require('events')

class Store extends EventEmitter {
  get (key) {
    throw new Error('store.get() should be implemented manually')
  }

  set (key, value, ttl) {
    throw new Error('store.set() should be implemented manually')
  }
}

module.exports = Store
