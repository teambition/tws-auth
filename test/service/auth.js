'use strict'
const tman = require('tman')
const MemoryStore = require('../../cache/memory')
const Auth = require('../../service/auth')

tman.suite('service - auth', function () {
  let auth = new Auth({
    cacheStore: new MemoryStore(),
    host: 'http://192.168.0.21:31090',
    appId: '58f95e92c06a546f7dab73c7',
    appSecret: 'hello123',
    resourceType: 'self'
  })

  tman.it('authorize', function * () {
    let { access_token } = yield auth.authorize()
    access_token.length.should.not.equal(0)
  })
})
