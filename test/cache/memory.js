'use strict'
const EventEmitter = require('events')
const assert = require('power-assert')
const tman = require('tman')
const Store = require('../../lib/cache/store')
const MemoryStore = require('../../lib/cache/memory')

tman.suite('cache - memory', function () {
  let store
  tman.beforeEach(function () {
    store = new MemoryStore()
  })

  tman.it('should extend EventEmitter and Store', function () {
    assert(store instanceof EventEmitter)
    assert(store instanceof Store)
  })

  tman.it('should get the specfied value', function * () {
    assert((yield store.get('test_key')) === null)
    store.map.set('test_key', { value: 'test_value', expiredAt: Date.now() + 200 })
    assert((yield store.get('test_key')) === 'test_value')
  })

  tman.it('should set the specifed value', function * () {
    assert((yield store.get('test_key')) === null)
    yield store.set('test_key', 'test_value', 2000)
    assert((yield store.get('test_key')) === 'test_value')
  })
})
