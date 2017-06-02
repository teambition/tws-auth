'use strict'
const urllib = require('urllib')
const co = require('co')
const { assertRes } = require('../util/request')

class Service {
  constructor (options) {
    this.options = options
  }

  _requestWithToken (method, url, data, token, assertFunc = assertRes) {
    return co(function * () {
      return assertFunc(yield urllib.request(url, {
        method,
        data,
        contentType: 'json',
        dataType: 'json',
        ca: this.options.rootCert,
        key: this.options.privateKey,
        cert: this.options.certChain,
        timeout: this.options.timeout,
        headers: { Authorization: `Bearer ${token}` }
      }))
    }.bind(this))
  }
}

module.exports = Service
