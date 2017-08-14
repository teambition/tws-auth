'use strict'
const tman = require('tman')
const assert = require('power-assert')
const MemoryStore = require('../../lib/cache/memory')
const User = require('../../lib/service/user')

tman.suite('service - user', function () {
  this.timeout(5000)

  let user = new User({
    cacheStore: new MemoryStore(),
    host: 'https://121.196.214.67:31090',
    appId: '59294da476d70b4b83fa91a5',
    appSecret: process.env.APP_SECRET,
    timeout: 30000
  })

  tman.it('verifyCookie - invalid parameters', function * () {
    try {
      yield user.verifyCookie('68e9721d-d823-d973-0d21-c14d7c29d213')
    } catch (error) {
      return assert(error.message, 'Invalid Parameters')
    }

    throw new Error('not throw')
  })

  tman.it('verifyToken - invalid parameters', function * () {
    try {
      yield user.verifyToken('invalid-token')
    } catch (error) {
      console.log(error)
      // return assert()
    }
  })
})
