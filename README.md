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

### More: https://teambition.github.io/tws-auth/

## License
`tws-auth` is licensed under the [MIT](https://github.com/teambition/tws-auth/blob/master/LICENSE) license.
Copyright &copy; 2017-2018 Teambition.

[npm-url]: https://www.npmjs.com/package/tws-auth
[npm-image]: https://img.shields.io/npm/v/tws-auth.svg

[travis-url]: https://travis-ci.org/teambition/tws-auth
[travis-image]: http://img.shields.io/travis/teambition/tws-auth.svg

[downloads-url]: https://npmjs.org/package/tws-auth
[downloads-image]: https://img.shields.io/npm/dm/tws-auth.svg?style=flat-square

