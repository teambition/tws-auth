'use strict'
const EventEmitter = require('events')
const assert = require('power-assert')
const tman = require('tman')
const Store = require('../../lib/cache/store')
const RedisStore = require('../../lib/cache/redis')

tman.suite('cache - redis', function () {
  let key = 'test_key'
  const prefix = 'TEST_TWS_AUTH'

  let store
  tman.beforeEach(function * () {
    store = new RedisStore({ addrs: ['127.0.0.1:6379'] }, prefix)
    yield store.client.del(`${prefix}$${key}`)
  })

  tman.it('should extend EventEmitter and Store', function () {
    assert(store instanceof EventEmitter)
    assert(store instanceof Store)
  })

  tman.it('should get the specfied value', function * () {
    assert((yield store.get(key)) === null)
    yield store.client.psetex(`${prefix}$${key}`, 2000, 'test_value')
    assert((yield store.get(key)) === 'test_value')
  })

  tman.it('should set the specifed value', function * () {
    yield store.client.del(`${prefix}$${key}`)
    assert((yield store.get(key)) === null)
    yield store.set(key, 'test_value', 2)
    assert((yield store.get(key)) === 'test_value')
  })
})
