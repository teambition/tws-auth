# tws-auth

[![Build Status](https://travis-ci.org/teambition/tws-auth.svg?branch=master)](https://travis-ci.org/teambition/tws-auth)

Node.js SDK of TWS (Teambition Web Service) authorization service. It is also a base TWS client module.

## Installation

```bash
npm install tws-auth
```

## Usage

```js
const Auth = require('tws-auth')

;(async function () {
  const auth = new Auth({
    host: 'https://auth.teambitionapis.com',
    appId: '78f95e92c06a546f7dab7327',
    appSecrets: ['app_secret_new', 'app_secret_old']
  })

  console.log(await auth.authorize('59291f0178af6230601abecc', 'self'))
})()
```

## API

### Class Client

```js
const Client = require('tws-auth').Client
```

#### new Client({ appId, appSecret, [host, timeout, cacheStore, rootCert, privateKey, certChain] })

- appId `String` : The ID of your TWS application.
- appSecret: `String` : The secret password of your TWS application.
- appSecrets: `[]String` : The secret passwords of your TWS application.
- host `String` : Optional, host URL of TWS authorization service, by default is `'https://auth.teambitionapis.com'`.
- timeout `Number` : Optional, requst timeout in milliseconds, by default is `2000`.
- cacheStore `Object` : Optional, the cache store for TWS access token, if provided, it should be an instance of `require('tws-auth/cache/store')` .
- rootCert `Buffer` : Optional, the client root certificate.
- privateKey `Buffer` : Optional, the client certificate private key.
- certChain `Buffer` : Optional, the client certificate cert chain.

#### Class Method: client.withObject(srvPrototype)
Creates a new service from service prototype base on the client.

```js
const sdk = new Auth(options)
const sdk.user = sdk.withObject(Auth.user)
// const sdk.mySrv = sdk.withObject(mySrvPrototype)
```

#### Class Method: client.signToken(payload, options)

#### Class Method: client.decodeToken(token, options)

#### Class Method: client.verifyToken(token, options)

#### Class Method: client.requestWithToken(method, url, data, tokens, assertFunc = assertRes)

#### Class Method: client.requestWithToken(options)

#### Class Method: client.requestWithSelfToken(method, url, data, assertFunc = assertRes)

#### Class Method: client.requestWithSelfToken(options)

#### Class Method: client.authorize(_grantorId, grantorType)

### Class Auth

```js
const Auth = require('tws-auth')
// Extends Client: class Auth extends Client {}
```

#### Class Methods: Same as Client Class

#### Auth.user

User service prototype.

#### Auth.Client

Client class.

#### Auth.Store

Store class.

#### Auth.RedisStore

RedisStore class.

#### Auth.MemoryStore

MemoryStore class.

#### Auth.assertRes

assertRes function.

### User service methods

#### auth.user.verifyCookie(cookie, signature)

#### auth.user.verifyToken(accessToken)

#### auth.user.getById(_userId)

#### auth.user.getByEmail(email)

#### auth.user.batchGetbyIds(_ids)
