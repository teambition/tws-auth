'use strict'

import { suite, it, Suite, before, after } from 'tman'
import assert from 'assert'
import http from 'http'
import Auth from '../src'
import { Client, Payload } from '../src'
import { AddressInfo } from 'net';

suite('tws-auth', function (this: Suite) {
  this.timeout(5000)

  suite('Client.request', function () {
    it('should work', function * () {
      const server = http.createServer((_req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end('{"result":"ok"}')
      })
      server.listen()
      const addr = server.address() as AddressInfo

      yield Client.request({
        method: 'GET',
        url: `http://127.0.0.1:${addr.port}`,
        json: true,
      })
        .then((res) => {
          assert.strictEqual(res.statusCode, 200)
          assert.strictEqual(res.attempts, 1)
          assert.strictEqual(res.body.result, 'ok')
        })

      server.close()
    })

    it('request with max retry', function * () {
      const server = http.createServer((_req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end('{"result":"ok"}')
      })
      server.listen()
      const addr = server.address() as AddressInfo
      server.close()

      yield Client.request({
        method: 'GET',
        url: `http://127.0.0.1:${addr.port}`,
        retryDelay: 300,
        maxAttempts: 10,
      })
        .then((_res) => {
          throw new Error('should no result')
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ECONNREFUSED')
          assert.strictEqual(err.attempts, 10)
          assert.strictEqual(err.originalUrl, `http://127.0.0.1:${addr.port}`)
          assert.strictEqual(err.originalMethod, 'GET')
        })
    })

    it('request with default retry', function * () {
      const server = http.createServer((_req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end('{"result":"ok"}')
      })
      server.listen()
      const addr = server.address() as AddressInfo
      server.close()

      yield Client.request({
        method: 'GET',
        url: `http://127.0.0.1:${addr.port}`,
      })
        .then((_res) => {
          throw new Error('should no result')
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ECONNREFUSED')
          assert.strictEqual(err.attempts, 3)
          assert.strictEqual(err.originalUrl, `http://127.0.0.1:${addr.port}`)
          assert.strictEqual(err.originalMethod, 'GET')
        })
    })

    it('request with no retry', function * () {
      const server = http.createServer((_req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end('{"result":"ok"}')
      })
      server.listen()
      const addr = server.address() as AddressInfo
      server.close()

      yield Client.request({
        method: 'GET',
        url: `http://127.0.0.1:${addr.port}`,
        maxAttempts: 1,
      })
        .then((_res) => {
          throw new Error('should no result')
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ECONNREFUSED')
          assert.strictEqual(err.attempts, 1)
          assert.strictEqual(err.originalUrl, `http://127.0.0.1:${addr.port}`)
          assert.strictEqual(err.originalMethod, 'GET')
        })
    })
  })

  suite('class Client', function () {
    it('new Client', function () {
      assert.throws(() => new Client({
        appId: '',
        appSecrets: [],
        host: '',
      }), /appId/)

      assert.throws(() => new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: [],
        host: '',
      }), /appSecrets/)

      assert.throws(() => new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: '',
      }), /host/)

      const cli = new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: 'http://test.org',
      })

      assert.ok(cli)
      assert.equal(Client.request, Auth.request)
    })

    it('withService', function () {
      const cli = new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: 'http://test.org',
      })

      const srvProto = {
        echoHost (this: Client) { return this.host },
      }

      const srv1 = cli.withService(srvProto)
      assert.strictEqual(cli.host, 'http://test.org')
      assert.strictEqual(cli.host, srv1.host)
      assert.strictEqual(cli.host, srv1.echoHost())

      const srv2 = cli.withService(srvProto, 'https://test.org')
      assert.strictEqual(cli.host, 'http://test.org')
      assert.strictEqual(srv2.host, 'https://test.org')
      assert.strictEqual(srv2.echoHost(), 'https://test.org')
      assert.notEqual(srv1, srv2)
      assert.equal(srv1.echoHost, srv2.echoHost)
    })

    it('withOptions', function () {
      const cli = new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: 'http://test.org',
      })

      assert.strictEqual(cli.requestOptions.timeout, 3000)

      const cli1 = cli.withOptions({ timeout: 10000 })
      assert.strictEqual(cli.requestOptions.timeout, 3000)
      assert.strictEqual(cli1.requestOptions.timeout, 10000)

      const cli2 = cli1.withOptions({ timeout: 20000 })
      assert.strictEqual(cli1.requestOptions.timeout, 10000)
      assert.strictEqual(cli2.requestOptions.timeout, 20000)
    })

    it('withHeaders', function () {
      const cli = new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: 'http://test.org',
      })

      assert.strictEqual(cli.headers['x-request-id'], undefined)

      const cli1 = cli.withHeaders({ 'x-request-id': '123' })
      assert.strictEqual(cli.headers['x-request-id'], undefined)
      assert.strictEqual(cli1.headers['x-request-id'], '123')
    })

    it('withQuery', function () {
      const cli = new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: 'http://test.org',
      })

      assert.strictEqual(cli.query._id, undefined)

      const cli1 = cli.withQuery({ _id: '123' })
      assert.strictEqual(cli.query._id, undefined)
      assert.strictEqual(cli1.query._id, '123')
    })

    it('withTenant, withOperator', function () {
      const cli = new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: 'http://test.org',
      })

      const cli1 = cli.withTenant('123')
      assert.strictEqual(cli.headers['X-Tenant-Id'], undefined)
      assert.strictEqual(cli1.headers['X-Tenant-Id'], '123')
      assert.strictEqual(cli1.headers['X-Tenant-Type'], 'organization')

      const cli2 = cli1.withOperator('123')
      assert.strictEqual(cli1.headers['X-Operator-ID'], undefined)
      assert.strictEqual(cli2.headers['X-Tenant-Id'], '123')
      assert.strictEqual(cli2.headers['X-Tenant-Type'], 'organization')
      assert.strictEqual(cli2.headers['X-Operator-ID'], '123')
    })

    it('signToken, decodeToken, verifyToken', function () {
      const cli = new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: 'http://test.org',
      })
      const token = cli.signToken({user: 'tester'})
      assert.strictEqual(cli.decodeToken(token).user, 'tester')
      assert.strictEqual(cli.verifyToken(token).user, 'tester')
      assert.throws(() => cli.verifyToken(token + '0'))
    })
  })

  suite('client.request', function () {
    let server: http.Server
    let cli: Client

    interface Body {
      method: string
      url: string
      headers: Payload
    }

    before(function () {
      server = http.createServer((req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({
          method: req.method,
          url: req.url,
          headers: req.headers,
        }))
      })
      server.listen()
      const addr = server.address() as AddressInfo

      cli = new Client({
        appId: '59294da476d70b4b83fa91a5',
        appSecrets: ['123'],
        host: `http://${addr.address}:${addr.port}`,
      })
    })

    after(function () {
      server.close()
    })

    it('request', function * () {
      yield cli.request<Body>('GET', '/abc').then((body) => {
        assert.strictEqual(body.method, 'GET')
        assert.strictEqual(body.url, '/abc')
      })
    })

    it('post', function * () {
      yield cli.post<Body>('/abc').then((body) => {
        assert.strictEqual(body.method, 'POST')
        assert.strictEqual(body.url, '/abc')
      })
    })

    it('put', function * () {
      yield cli.put<Body>('/abc').then((body) => {
        assert.strictEqual(body.method, 'PUT')
        assert.strictEqual(body.url, '/abc')
      })
    })

    it('patch', function * () {
      yield cli.patch<Body>('/abc').then((body) => {
        assert.strictEqual(body.method, 'PATCH')
        assert.strictEqual(body.url, '/abc')
      })
    })

    it('get', function * () {
      yield cli.get<Body>('/abc').then((body) => {
        assert.strictEqual(body.method, 'GET')
        assert.strictEqual(body.url, '/abc')
      })
    })

    it('delete', function * () {
      yield cli.delete<Body>('/abc').then((body) => {
        assert.strictEqual(body.method, 'DELETE')
        assert.strictEqual(body.url, '/abc')
      })
    })

    it('head', function * () {
      yield cli.head('/abc')
    })
  })

  if (process.env.APP_SECRET == null) {
    return
  }

  suite('user service', function () {
    let cli: Auth

    before(function () {
      cli = new Auth({
        appId: process.env.APP_ID as string,
        appSecrets: [process.env.APP_SECRET as string],
        host: process.env.HOST as string,
      })
    })

    it('checkCookie - invalid cookie', function * () {
      const res = yield cli.user.checkCookie('68e9721d-d823-d973-0d21-c14d7c29d213', 'xxxxxxx')
      assert.equal(res.result, null)
      assert.equal(res.error.error, 'Unauthorized')
    })

    it('checkToken - Unauthorized', function * () {
      const res = yield cli.user.checkToken('invalid-token')
      assert.equal(res.result, null)
      assert.equal(res.error.error, 'Unauthorized')
    })

    it('getById - Resource Not Found', function * () {
      try {
        yield cli.user.getById('5109f1e918e6fcfc560001a7')
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
        yield cli.user.getByEmail('test-not-found@email.email')
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
        yield cli.user.batchGetbyIds([
          '5109f1e918e6fcfc560001a7',
          '5109f1e918e6fcfc560001a8',
        ], { fields: '_id' })
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
})
