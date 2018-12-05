'use strict'

import http from 'http'
import { AddressInfo } from 'net'
import assert from 'assert'
import querystring from 'querystring'
import { suite, it, Suite, before, after } from 'tman'
import { TWS, Client, Payload, isSuccess, delay } from '../src'

suite('tws-auth', function (this: Suite) {
  this.timeout(10000)

  suite('Client.request', function () {
    it('should work', async function () {
      const server = http.createServer((_req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end('{"result":"ok"}')
      })
      server.listen()
      const addr = server.address() as AddressInfo

      const response = await Client.request({
        method: 'GET',
        url: `http://127.0.0.1:${addr.port}`,
        json: true,
      })
      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(response.attempts, 1)
      assert.strictEqual(response.body.result, 'ok')

      server.close()
    })

    it('request with max retry', async function () {
      const server = http.createServer((_req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end('{"result":"ok"}')
      })
      server.listen()
      const addr = server.address() as AddressInfo
      server.close()

      await Client.request({
        method: 'GET',
        url: `http://127.0.0.1:${addr.port}`,
        retryDelay: 300,
        maxAttempts: 5,
      })
        .then((_res) => {
          throw new Error('should no result')
        })
        .catch((err) => {
          assert.strictEqual(err.code, 'ECONNREFUSED')
          assert.strictEqual(err.attempts, 5)
          assert.strictEqual(err.originalUrl, `http://127.0.0.1:${addr.port}`)
          assert.strictEqual(err.originalMethod, 'GET')
        })
    })

    it('request with default retry', async function () {
      const server = http.createServer((_req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end('{"result":"ok"}')
      })
      server.listen()
      const addr = server.address() as AddressInfo
      server.close()

      await Client.request({
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

    it('request with no retry', async function () {
      const server = http.createServer((_req, res) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end('{"result":"ok"}')
      })
      server.listen()
      const addr = server.address() as AddressInfo
      server.close()

      await Client.request({
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
      assert.equal(Client.request, TWS.request)
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

    it('request should ok', async function () {
      const res = await cli.request('GET', '/abc')
      assert.ok(isSuccess(res))
      assert.strictEqual(res.attempts, 1)
      assert.ok(res.originalUrl)
      assert.strictEqual(res.originalMethod, 'GET')

      assert.strictEqual(res.body.method, 'GET')
      assert.strictEqual(res.body.url, '/abc')

      assert.ok(res.body.headers['user-agent'])
      assert.ok(res.body.headers['user-agent'].startsWith('tws-auth'))
      assert.ok(res.body.headers.authorization)
      assert.ok(res.body.headers.authorization.startsWith('Bearer'))

      assert.ok(cli.verifyToken(res.body.headers.authorization.slice(7)))
    })

    it('request should work with withQuery', async function () {
      const res0 = await cli.withQuery({ _id: 'xyz' }).request('GET', '/abc')
      assert.ok(isSuccess(res0))
      assert.strictEqual(res0.body.url, '/abc?_id=xyz')

      const res1 = await cli.withQuery({ _id: 'xyz' }).request('GET', '/abc?q=x', { type: 'user' })
      assert.ok(isSuccess(res1))
      const qs = querystring.parse(res1.body.url.slice(5))
      assert.deepStrictEqual(Object.assign({}, qs), { q: 'x', _id: 'xyz', type: 'user' })

      const res2 = await cli.request('GET', '/abc')
      assert.ok(isSuccess(res2))
      assert.strictEqual(res2.body.url, '/abc')
    })

    it('request should work with withHeaders', async function () {
      const res0 = await cli.withTenant('xyz', 'org').withOperator('tom').request('GET', '/abc')
      assert.ok(isSuccess(res0))
      assert.strictEqual(res0.body.headers['x-tenant-id'], 'xyz')
      assert.strictEqual(res0.body.headers['x-tenant-type'], 'org')
      assert.strictEqual(res0.body.headers['x-operator-id'], 'tom')

      const res1 = await cli.withOperator('tom').request('GET', '/abc')
      assert.ok(isSuccess(res1))
      assert.strictEqual(res1.body.headers['x-tenant-id'], undefined)
      assert.strictEqual(res1.body.headers['x-tenant-type'], undefined)
      assert.strictEqual(res1.body.headers['x-operator-id'], 'tom')
    })

    it('request should work with withOptions', async function () {
      const res0 = await cli.withOptions({
        headers: { 'x-callback-url': 'http://test.com' },
        qs: { q: 'test' },
      }).request('GET', '/abc')
      assert.ok(isSuccess(res0))
      assert.strictEqual(res0.body.headers['x-callback-url'], 'http://test.com')
      assert.strictEqual(res0.body.url, '/abc?q=test')

      const res1 = await cli.withOptions({ method: 'GET' }).request('POST', '/abc')
      assert.ok(isSuccess(res1))
      assert.strictEqual(res1.body.headers['x-callback-url'], undefined)
      assert.strictEqual(res1.body.method, 'POST')
      assert.strictEqual(res1.body.url, '/abc')
    })

    it('request should use the same token in a time', async function () {
      const res0 = await cli.request('GET', '/abc')
      assert.ok(isSuccess(res0))
      assert.ok(res0.body.headers.authorization.startsWith('Bearer'))

      await delay(1500)
      const res1 = await cli.request('GET', '/abc')
      assert.ok(isSuccess(res1))
      assert.strictEqual(res1.body.headers.authorization, res0.body.headers.authorization)

      await delay(600)
      const res2 = await cli.request('GET', '/abc')
      assert.ok(isSuccess(res1))
      assert.strictEqual(res2.body.headers.authorization, res0.body.headers.authorization)
    })

    it('post should ok', async function () {
      const body = await cli
        .withTenant('xyz', 'org')
        .withOperator('tom')
        .post<Body>('/abc')
      assert.strictEqual(body.method, 'POST')
      assert.strictEqual(body.url, '/abc')
      assert.strictEqual(body.headers['x-tenant-id'], 'xyz')
      assert.strictEqual(body.headers['x-tenant-type'], 'org')
      assert.strictEqual(body.headers['x-operator-id'], 'tom')
    })

    it('put should ok', async function () {
      const body = await cli.put<Body>('/abc')
      assert.strictEqual(body.method, 'PUT')
      assert.strictEqual(body.url, '/abc')
    })

    it('patch should ok', async function () {
      const body = await cli.patch<Body>('/abc')
      assert.strictEqual(body.method, 'PATCH')
      assert.strictEqual(body.url, '/abc')
    })

    it('get should ok', async function () {
      const body = await cli.get<Body>('/abc')
      assert.strictEqual(body.method, 'GET')
      assert.strictEqual(body.url, '/abc')
    })

    it('delete should ok', async function () {
      const body = await cli.delete<Body>('/abc')
      assert.strictEqual(body.method, 'DELETE')
      assert.strictEqual(body.url, '/abc')
    })
  })

  suite('auth service', function () {
    let cli: TWS

    if (process.env.APP_SECRET == null) {
      return
    }

    before(function () {
      cli = new TWS({
        appId: process.env.APP_ID as string,
        appSecrets: [process.env.APP_SECRET as string],
        host: process.env.AUTH_SERVER as string,
        time: true,
      })
    })

    it('checkCookie - invalid cookie', async function () {
      const res = await cli.authSrv.checkUserCookie<{ result: any, error: any }>('68e9721d-d823-d973-0d21-c14d7c29d213', 'xxxxxxx')
      assert.equal(res.result, null)
      assert.equal(res.error.error, 'Unauthorized')
    })

    it('checkToken - Unauthorized', async function () {
      const res = await cli.authSrv.checkUserToken<{ result: any, error: any }>('invalid-token')
      assert.equal(res.result, null)
      assert.equal(res.error.error, 'Unauthorized')
    })

    it('getById - Resource Not Found', async function () {
      try {
        await cli.authSrv.getUserById('5109f1e918e6fcfc560001a7')
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

    it('getByEmail - Resource Not Found', async function () {
      try {
        await cli.authSrv.getUserByEmail('test-not-found@email.email')
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

    it('batchGetbyIds', async function () {
      try {
        await cli.authSrv.getUsersbyIds([
          '5109f1e918e6fcfc560001a7',
          '5109f1e918e6fcfc560001a8',
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
})
