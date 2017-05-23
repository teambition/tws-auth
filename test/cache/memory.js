'use strict'
const EventEmitter = require('events')
const tman = require('tman')
const Store = require('../../cache/store')
const MemoryStore = require('../../cache/memory')

tman.suite('cache - memory', function () {
  let store
  tman.beforeEach(function () {
    store = new MemoryStore()
  })

  tman.it('should extend EventEmitter and Store', function () {
    ;(store instanceof EventEmitter).should.be.true()
    ;(store instanceof Store).should.be.true()
  })

  tman.it('should get the specfied value', function * () {
    ;((yield store.get('test_key')) === null).should.be.true()
    store.map.set('test_key', {
      value: 'test_value',
      expiredAt: Date.now() + 200
    })
    ;(yield store.get('test_key')).should.equal('test_value')
  })

  tman.it('should set the specifed value', function * () {
    ;((yield store.get('test_key')) === null).should.be.true()
    yield store.set('test_key', 'test_value', 2000)
    ;(yield store.get('test_key')).should.equal('test_value')
  })
})
