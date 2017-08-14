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
    } catch ({ message }) {
      return assert(message, 'Invalid Parameters')
    }

    throw new Error('not throw')
  })

  tman.it('verifyToken - Unauthorized', function * () {
    try {
      yield user.verifyToken('invalid-token')
    } catch ({ error }) {
      return assert(error.error, 'Unauthorized')
    }

    throw new Error('not throw')
  })

  tman.it('getById - Resource Not Found', function * () {
    try {
      yield user.getById('5109f1e918e6fcfc560001a6')
    } catch ({ message }) {
      return assert(message, 'Resource Not Found')
    }

    throw new Error('not throw')
  })

  tman.it('getByEmail - Resource Not Found', function * () {
    try {
      yield user.getByEmail('test-not-found@email.email')
    } catch ({ message }) {
      return assert(message, 'Resource Not Found')
    }

    throw new Error('not throw')
  })

  tman.it('batchGetbyIds', function * () {
    try {
      yield user.batchGetbyIds([
        '5109f1e918e6fcfc560001a6',
        '5109f1e918e6fcfc560001a7'
      ])
    } catch ({ error }) {
      return assert(error.error, 'Not Found')
    }

    throw new Error('not throw')
  })
})
