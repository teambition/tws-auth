'use strict'

const { suite, it } = require('tman')
const { thunk } = require('thunks')
const assert = require('power-assert')

const Auth = require('..')
const MemoryStore = Auth.MemoryStore

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

suite('tws-auth', function () {
  this.timeout(5000)

  const clientOptions = {
    cacheStore: new MemoryStore(),
    host: 'https://121.196.214.67:31090',
    appId: '59294da476d70b4b83fa91a5',
    appSecret: process.env.APP_SECRET,
    timeout: 30000,
    time: true
  }
  const client = new Auth(clientOptions)

  // travis-ci 中测试有问题，目前只能本机测试
  suite.skip('request', function () {
    it('should work', function () {
      return Auth.Client.request({
        method: 'GET',
        url: 'https://121.196.214.67:31090',
        json: true
      })
        .then((res) => {
          assert.strictEqual(res.statusCode, 200)
          assert.strictEqual(res.attempts, 1)
          assert.ok(res.body.Version)
        })
    })

    it('request with max retry', function () {
      return Auth.Client.request({
        method: 'GET',
        url: 'https://121.196.214.67:11111',
        retryDelay: 300,
        maxAttempts: 100
      })
        .then((res) => {
          throw new Error('should no result')
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ECONNREFUSED')
          assert.strictEqual(err.attempts, 10)
          assert.strictEqual(err.originalUrl, 'https://121.196.214.67:11111')
          assert.strictEqual(err.originalMethod, 'GET')
        })
    })

    it('request with default retry', function () {
      return Auth.Client.request({
        method: 'GET',
        url: 'https://121.196.214.67:11111'
      })
        .then((res) => {
          throw new Error('should no result')
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ECONNREFUSED')
          assert.strictEqual(err.attempts, 3)
          assert.strictEqual(err.originalUrl, 'https://121.196.214.67:11111')
          assert.strictEqual(err.originalMethod, 'GET')
        })
    })

    it('request with no retry', function * () {
      return Auth.Client.request({
        method: 'GET',
        url: 'https://121.196.214.67:11111',
        maxAttempts: 1
      })
        .then((res) => {
          throw new Error('should no result')
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ECONNREFUSED')
          assert.strictEqual(err.attempts, 1)
          assert.strictEqual(err.originalUrl, 'https://121.196.214.67:11111')
          assert.strictEqual(err.originalMethod, 'GET')
        })
    })
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

    it('checkCookie - invalid cookie', function * () {
      let res = yield client.user.checkCookie('68e9721d-d823-d973-0d21-c14d7c29d213', 'xxxxxxx')
      assert.equal(res.result, null)
      assert.equal(res.error.error, 'Unauthorized')
    })

    it('checkToken - Unauthorized', function * () {
      let res = yield client.user.checkToken('invalid-token')
      assert.equal(res.result, null)
      assert.equal(res.error.error, 'Unauthorized')
    })

    it('getById - Resource Not Found', function * () {
      try {
        yield client.user.getById('5109f1e918e6fcfc560001a6')
      } catch (err) {
        assert.ok(err.originalUrl)
        assert.ok(err.originalMethod)
        assert.ok(err.headers)
        assert.ok(err.elapsedTime > 0)
        assert.ok(err.error)
        assert.ok(err.message)
        return
      }

      throw new Error('not throw')
    })

    it('getByEmail - Resource Not Found', function * () {
      try {
        yield client.user.getByEmail('test-not-found@email.email')
      } catch (err) {
        assert.ok(err.originalUrl)
        assert.ok(err.originalMethod)
        assert.ok(err.headers)
        assert.ok(err.elapsedTime > 0)
        assert.ok(err.error)
        assert.ok(err.message)
        return
      }

      throw new Error('not throw')
    })

    it('batchGetbyIds', function * () {
      try {
        yield client.user.batchGetbyIds([
          '5109f1e918e6fcfc560001a6',
          '5109f1e918e6fcfc560001a7'
        ])
      } catch (err) {
        assert.ok(err.originalUrl)
        assert.ok(err.originalMethod)
        assert.ok(err.headers)
        assert.ok(err.elapsedTime > 0)
        assert.ok(err.error)
        assert.ok(err.message)
        return
      }

      throw new Error('not throw')
    })
  })

  suite('constructor options', function () {
    it('cacheKeyWithType - token should be same with the same cacheKeyWithType option', function * () {
      const specificOptions = Object.assign({}, clientOptions, { cacheKeyWithType: false })
      const specificClient = new Auth(specificOptions)

      const clientToken = yield client.authorize('59294da476d70b4b83fa91a5', 'self')
      yield thunk.delay(1000)

      const specificToken = yield specificClient.authorize('59294da476d70b4b83fa91a5', 'self')
      assert.equal(clientToken, specificToken)
    })

    it('cacheKeyWithType - token should be different with different cacheKeyWithType option', function * () {
      const specificOptions = Object.assign({}, clientOptions, { cacheKeyWithType: true })
      const specificClient = new Auth(specificOptions)

      const clientToken = yield client.authorize('59294da476d70b4b83fa91a5', 'self')
      yield thunk.delay(1000)

      const specificToken = yield specificClient.authorize('59294da476d70b4b83fa91a5', 'self')
      assert.notEqual(clientToken, specificToken)
    })
  })
})
