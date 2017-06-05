'use strict'
const tman = require('tman')
const assert = require('power-assert')
const MemoryStore = require('../../lib/cache/memory')
const Auth = require('../../lib/service/auth')

tman.suite('service - auth', function () {
  let auth = new Auth({
    cacheStore: new MemoryStore(),
    host: 'http://121.196.214.67:31090',
    appId: '59294da476d70b4b83fa91a5',
    appSecret: 'hello123',
    timeout: 30000
  })

  tman.it('authorize', function * () {
    let token = yield auth.authorize('59294da476d70b4b83fa91a5', 'self')
    assert(token.length !== 0)
  })
})
