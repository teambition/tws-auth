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

const client = new Client({
  host: 'https://auth.teambitionapis.com',
  appId: '78f95e92c06a546f7dab7327',
  appSecret: 'app_secret',
  resourceType: 'app'
})

(async funciton () {
  let { access_token } = await client.auth.authorize()
  console.log(access_token)
})(console.error)
```
