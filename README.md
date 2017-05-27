# tws-auth
[![Build Status](https://travis-ci.org/teambition/tws-auth.svg?branch=master)](https://travis-ci.org/teambition/tws-auth)

Node.js SDK of TWS (Teambition Web Service) authorization service.

## Installation

```
npm install tws-auth
```

## Usage

```js
const Client = require('tws-auth')

;(async function () {
  const client = new Client({
    host: 'https://auth.teambitionapis.com',
    appId: '78f95e92c06a546f7dab7327',
    appSecret: 'app_secret',
  })

  console.log(await client.auth.authorize('59291f0178af6230601abecc', 'app'))
})(console.error)
```

## API

### Class Client

#### new Client({ appId, appSecret, [host, timeout, cacheStore] })

- appId `String` : The ID of your TWS application.
- appSecret: `String` : The secret password of your TWS application.
- host `String` : Host URL of TWS authorization service, by default is `'https://auth.teambitionapis.com'`.
- timeout `Number` : Requst timeout in milliseconds, by default is `2000`.
- cacheStore `Object` : Optional, the cache store for TWS access token, if provided, it should be an instance of require('tws-auth/cache/store') .

#### Authorization methods

##### Class Method: client.auth.authorize(_resourceId, resourceType)
