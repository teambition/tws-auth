'use strict'
const EventEmitter = require('events')
const tman = require('tman')
const Store = require('../../cache/store')

tman.suite('cache - store', function () {
  let store = new Store()

  tman.it('should extend EventEmitter', function () {
    ;(store instanceof EventEmitter).should.be.true()
  })

  tman.it('should throw when not implement store.get()', function () {
    ;(() => store.get()).should
      .throw('store.get() should be implemented manually')
  })

  tman.it('should throw when not implement store.set()', function () {
    ;(() => store.set()).should
      .throw('store.set() should be implemented manually')
  })
})
