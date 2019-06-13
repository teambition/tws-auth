# [tws-auth](https://github.com/teambition/tws-auth)

Node.js SDK of TWS (Teambition Web Service) client.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

## Installation

```
npm i --save tws-auth
```

## Usage

```js
const { TWS } = require('tws-auth')

const tws = new TWS({
  appId: '78f95e92c06a546f7dab7327',
  appSecrets: ['app_secret_new', 'app_secret_old'],
  host: 'https://auth.teambitionapis.com'
})

;(async function () {
  console.log(await tws.request('GET', '/version'))
  console.log(await tws.get('/version'))
  console.log(await tws.authSrv.getUserById('59291f0178af6230601abecc'))
  console.log(await tws
    .withTenant('56f0d51e3cd13a5b537c3a12', 'organization')
    .get('/v1/projects/5ae144a3b292d60011b8c329')
  )
})()
```

## Documentation

```js
const { Client } = require('tws-auth')
```

### new Client({ appId, appSecret[, host, timeout, cacheStore, rootCert, privateKey, certChain] })

- appId `String` : The ID of your TWS application.
- appSecrets: `[]String` : The secret passwords of your TWS application.
- host `String` : Optional, host URL of TWS authorization service, by default is `'https://auth.teambitionapis.com'`.
- timeout `Number` : Optional, requst timeout in milliseconds, by default is `3000`.
- rootCert `Buffer` : Optional, the client root certificate.
- privateKey `Buffer` : Optional, the client certificate private key.
- certChain `Buffer` : Optional, the client certificate cert chain.
- maxSockets `Number` : Optional, the client sockets.
- time `Boolean` : Optional, enable timing for request.
- retryDelay `Number` : Optional, delay time for retry, default to 200 ms.
- maxAttempts `Number` : Optional, max attempts for a request, default to 3 times.
- retryErrorCodes `[]String` : Optional, error codes that should retry, default to `['ECONNRESET', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE', 'EAI_AGAIN']`.

### Client API
```ts
class Client {
    /**
     * a retryable request, wrap of https://github.com/request/request.
     * When the connection fails with one of ECONNRESET, ENOTFOUND, ESOCKETTIMEDOUT, ETIMEDOUT,
     * ECONNREFUSED, EHOSTUNREACH, EPIPE, EAI_AGAIN, the request will automatically be re-attempted as
     * these are often recoverable errors and will go away on retry.
     * @param options request options.
     * @returns a promise with Response.
     */
    static request(options: RequestOptions & request.UrlOptions): Promise<Response>;
    constructor(options: ClientOptions);
    /**
     * @returns User-Agent on the client.
     */
    /**
    * Set User-Agent to the client.
    * @param ua User-Agent string.
    */
    UA: string;
    /**
     * @returns host on the client.
     */
    readonly host: string;
    /**
     * @returns preset headers on the client.
     */
    readonly headers: Payload;
    /**
     * @returns preset query on the client.
     */
    readonly query: Payload;
    /**
     * @returns preset request options on the client.
     */
    readonly requestOptions: RequestOptions;
    /**
     * Creates (by Object.create) a **new client** instance with given service methods.
     * @param servicePrototype service methods that will be mount to client.
     * @param servicehost service host for new client.
     * @returns a **new client** with with given service methods.
     */
    withService<T>(serviceMethod: T, servicehost?: string): this & T;
    /**
     * Creates (by Object.create) a **new client** instance with given request options.
     * @param options request options that will be copy into client.
     * @returns a **new client** with with given request options.
     */
    withOptions(options: RequestOptions): this;
    /**
     * Creates (by Object.create) a **new client** instance with given headers.
     * @param headers headers that will be copy into client.
     * @returns a **new client** with with given headers.
     */
    withHeaders(headers: Payload): this;
    /**
     * Creates (by Object.create) a **new client** instance with given query.
     * @param query query that will be copy into client.
     * @returns a **new client** with with given query.
     */
    withQuery(query: Payload): this;
    /**
     * Creates (by withHeaders) a **new client** instance with given `X-Tenant-Id` and `X-Tenant-Type`.
     * @param tenantId that will be added to header as `X-Tenant-Id`.
     * @param tenantType that will be added to header as `X-Tenant-Type`.
     * @returns a **new client** with with given headers.
     */
    withTenant(tenantId: string, tenantType?: string): this;
    /**
     * Creates (by withHeaders) a **new client** instance with given `X-Operator-ID`.
     * @param operatorId that will be added to header as `X-Operator-ID`.
     * @returns a **new client** with with given headers.
     */
    withOperator(operatorId: string): this;
    /**
     * Creates a JWT token string with given payload and client's appSecrets.
     * @param payload Payload to sign, should be an literal object.
     * @param options some JWT sign options.
     * @returns a token string.
     */
    signToken(payload: Payload, options?: jwt.SignOptions): string;
    /**
     * Creates a periodical changed JWT token string with appId and appSecrets.
     * @param payload Payload to sign, should be an literal object.
     * @param periodical period in seccond, default to 3600s.
     * @param options some JWT sign options.
     * @returns a token string.
     */
    signAppToken(periodical?: number, options?: jwt.SignOptions): string;
    /**
     * Decode a JWT token string to literal object payload.
     * @param token token to decode.
     * @param options some JWT decode options.
     * @returns a literal object.
     */
    decodeToken(token: string, options?: jwt.DecodeOptions): Payload;
    /**
     * Decode and verify a JWT token string to literal object payload.
     * if verify failure, it will throw a 401 error (creates by 'http-errors' module)
     * @param token token to decode.
     * @param options some JWT verify options.
     * @returns a literal object.
     */
    verifyToken(token: string, options?: jwt.VerifyOptions): Payload;
    /**
     * request with given method, url and data.
     * It will genenrate a jwt token by signToken, and set to 'Authorization' header.
     * It will merge headers, query and request options that preset into client.
     * @param method method to request.
     * @param url url to request, it will be resolved with client host.
     * @param data data to request.
     * @returns a promise with Response
     */
    request(method: string, url: string, data?: any): Promise<Response>;
    /**
     * request with `GET` method.
     * @returns a promise with Response body
     */
    get<T>(url: string, data?: any): Promise<T>;
    /**
     * request with `POST` method.
     * @returns a promise with Response body
     */
    post<T>(url: string, data?: any): Promise<T>;
    /**
     * request with `PUT` method.
     * @returns a promise with Response body
     */
    put<T>(url: string, data?: any): Promise<T>;
    /**
     * request with `PATCH` method.
     * @returns a promise with Response body
     */
    patch<T>(url: string, data?: any): Promise<T>;
    /**
     * request with `DELETE` method.
     * @returns a promise with Response body
     */
    delete<T>(url: string, data?: any): Promise<T>;
}
```

### More: https://teambition.github.io/tws-auth/

## License

`tws-auth` is licensed under the [MIT](https://github.com/teambition/tws-auth/blob/master/LICENSE) license.
Copyright &copy; 2017-2019 Teambition.

[npm-url]: https://www.npmjs.com/package/tws-auth
[npm-image]: https://img.shields.io/npm/v/tws-auth.svg

[travis-url]: https://travis-ci.org/teambition/tws-auth
[travis-image]: http://img.shields.io/travis/teambition/tws-auth.svg

[downloads-url]: https://npmjs.org/package/tws-auth
[downloads-image]: https://img.shields.io/npm/dm/tws-auth.svg?style=flat-square
