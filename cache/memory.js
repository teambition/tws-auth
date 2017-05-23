'use strict'
const Store = require('./store')

class MemoryStore extends Store {
  constructor () {
    super()
    this.map = new Map()
  }

  get (key) {
    return Promise.resolve(this.map.get(key))
  }

  set (key, value) {
    return Promise.resolve(this.map.set(key, value))
  }
}

module.exports = MemoryStore
