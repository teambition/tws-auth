'use strict'
const tman = require('tman')
const assert = require('power-assert')
const MemoryStore = require('../../cache/memory')
const Auth = require('../../service/auth')
const Client = require('../../service/suite')

tman.suite('service - suite', function () {
  let auth = new Auth({
    cacheStore: new MemoryStore(),
    host: 'http://121.196.214.67:31090',
    appId: '59294da476d70b4b83fa91a5',
    appSecret: 'hello123',
    timeout: 30000
  })

  let client = new Client({
    host: 'http://121.196.214.67:31090',
    timeout: 30000
  })

  let token
  tman.before(function * () {
    token = yield auth.authorize('59294da476d70b4b83fa91a5', 'self')
  })

  tman.it('listSuitesByUserId', function * () {
    let suites = yield client.listSuitesByUserId('59294da476d70b4b83fa91a0', token)
    assert(Array.isArray(suites))
    assert(suites.length > 0)
  })
})
