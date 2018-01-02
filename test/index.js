'use strict'

const { suite, it } = require('tman')
const assert = require('power-assert')

const Auth = require('..')
const MemoryStore = Auth.MemoryStore

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

suite('tws-auth', function () {
  this.timeout(5000)

  const client = new Auth({
    cacheStore: new MemoryStore(),
    host: 'https://121.196.214.67:31090',
    appId: '59294da476d70b4b83fa91a5',
    appSecret: process.env.APP_SECRET,
    timeout: 30000
  })

  suite('client method', function () {
    it('withService', function () {
      let srv1 = client.withService({
        echo: function () { return this }
      })
      assert.strictEqual(client.host, 'https://121.196.214.67:31090')
      assert.strictEqual(client.host, srv1.host)
      assert.strictEqual(client.host, srv1.echo().host)

      let srv2 = client.withService({
        echo: function () { return this }
      }, 'https://test.org')
      assert.strictEqual(client.host, 'https://121.196.214.67:31090')
      assert.strictEqual(srv2.host, 'https://test.org')
      assert.strictEqual(srv2.echo().host, 'https://test.org')
      assert.notEqual(srv1, srv2)
      assert.notEqual(srv1.echo, srv2.echo)
    })

    it('signToken, decodeToken, verifyToken', function () {
      let token = client.signToken({user: 'tester'})
      assert.strictEqual(client.decodeToken(token).user, 'tester')
      assert.strictEqual(client.verifyToken(token).user, 'tester')
      assert.throws(() => client.verifyToken(token + '0'))
    })
  })

  suite('service - auth', function () {
    it('authorize by type: self', function * () {
      let token = yield client.authorize('59294da476d70b4b83fa91a5', 'self')
      assert(token.length !== 0)
    })

    it('authorize by type: user', function * () {
      let token = yield client.authorize('59294da476d70b4b83fa91a0', 'user')
      assert(token.length !== 0)
    })
  })

  suite('service - user', function () {
    it('authorize by type: self', function * () {
      let token = yield client.user.authorize('59294da476d70b4b83fa91a5', 'self')
      assert(token.length !== 0)
    })

    it('authorize by type: user', function * () {
      let token = yield client.user.authorize('59294da476d70b4b83fa91a0', 'user')
      assert(token.length !== 0)
    })

    it('verifyCookie - invalid parameters', function * () {
      try {
        yield client.user.verifyCookie('68e9721d-d823-d973-0d21-c14d7c29d213')
      } catch ({ message }) {
        return assert(message, 'Invalid Parameters')
      }

      throw new Error('not throw')
    })

    it('verifyToken - Unauthorized', function * () {
      try {
        yield client.user.verifyToken('invalid-token')
      } catch ({ error }) {
        return assert(error.error, 'Unauthorized')
      }

      throw new Error('not throw')
    })

    it('getById - Resource Not Found', function * () {
      try {
        yield client.user.getById('5109f1e918e6fcfc560001a6')
      } catch ({ message }) {
        return assert(message, 'Resource Not Found')
      }

      throw new Error('not throw')
    })

    it('getByEmail - Resource Not Found', function * () {
      try {
        yield client.user.getByEmail('test-not-found@email.email')
      } catch ({ message }) {
        return assert(message, 'Resource Not Found')
      }

      throw new Error('not throw')
    })

    it('batchGetbyIds', function * () {
      try {
        yield client.user.batchGetbyIds([
          '5109f1e918e6fcfc560001a6',
          '5109f1e918e6fcfc560001a7'
        ])
      } catch ({ error }) {
        return assert(error, 'UserNotFound')
      }

      throw new Error('not throw')
    })
  })
})
