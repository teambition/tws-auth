'use strict'
const tman = require('tman')
const assert = require('power-assert')
const MemoryStore = require('../../lib/cache/memory')
const Auth = require('../../lib/service/auth')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

tman.suite('service - auth', function () {
  let auth = new Auth({
    cacheStore: new MemoryStore(),
    host: 'https://121.196.214.67:31090',
    appId: '59294da476d70b4b83fa91a5',
    appSecret: process.env.APP_SECRET,
    timeout: 30000
  })

  tman.it('authorize by type: self', function * () {
    let token = yield auth.authorize('59294da476d70b4b83fa91a5', 'self')
    assert(token.length !== 0)
  })

  tman.it('authorize by type: user', function * () {
    let token = yield auth.authorize('59294da476d70b4b83fa91a0', 'user')
    assert(token.length !== 0)
  })
})
