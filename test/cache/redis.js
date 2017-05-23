'use strict'
const EventEmitter = require('events')
const tman = require('tman')
const Store = require('../../cache/store')
const RedisStore = require('../../cache/redis')

tman.suite('cache - redis', function () {
  const key = 'test_key'
  const prefix = 'TEST_TWS_AUTH'

  let store
  tman.beforeEach(function * () {
    store = new RedisStore({ addrs: ['127.0.0.1:6379'] }, prefix)
    yield store.client.del(`${prefix}$${key}`)
  })

  tman.it('should extend EventEmitter and Store', function () {
    ;(store instanceof EventEmitter).should.be.true()
    ;(store instanceof Store).should.be.true()
  })

  tman.it('should get the specfied value', function * () {
    ;((yield store.get(key)) === null).should.be.true()
    yield store.client.set(`${prefix}$${key}`, 'test_value')
    ;(yield store.get(key)).should.equal('test_value')
  })

  tman.it('should set the specifed value', function * () {
    ;((yield store.get(key)) === null).should.be.true()
    yield store.set(key, 'test_value', 2000)
    ;(yield store.get(key)).should.equal('test_value')
  })
})
