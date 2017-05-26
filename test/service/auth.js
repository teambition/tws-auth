'use strict'
const tman = require('tman')
const assert = require('power-assert')
const MemoryStore = require('../../cache/memory')
const Auth = require('../../service/auth')

tman.suite('service - auth', function () {
  let auth = new Auth({
    cacheStore: new MemoryStore(),
    host: 'http://121.196.214.67:31090',
    appId: '5926a8e876d70b7334461818',
    appSecret: 'hello123',
    resourceType: 'self'
  })

  tman.it('authorize', function * () {
    let token = yield auth.authorize()
    assert(token.length !== 0)
  })
})
