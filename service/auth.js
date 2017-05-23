'use strict'
const urllib = require('urllib')
const jwt = require('jsonwebtoken')
const { assertRes } = require('../util/request')

class Auth {
  constructor (options) {
    this.options = options
  }

  authorize () {
    const token = jwt.sign({
      _appId: this.options.appId
    }, this.options.appSecret)

    return urllib.request(`${this.options.host}/v1/apps/authorize`, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        _appId: this.options.appId,
        resourceId: this.options.appId,
        resourceType: this.options.resourceType,
        name: 'tws-auth',
        grantType: 'client_credentials'
      },
      headers: { Authorization: `Bearer ${token}` }
    }).then(assertRes)
  }
}

module.exports = Auth
