'use strict'
const Service = require('./common')

class Auth extends Service {
  constructor (options) {
    super(options)
    this.options = options
  }

  authorize (_resourceId, resourceType) {
    return super.authorize(_resourceId, resourceType)
  }
}

module.exports = Auth
