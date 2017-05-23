'use strict'

class TWSError extends Error {
  constructor (status, error) {
    super(error)
    this.status = status
    this.error = error
  }

  withMessage (message) {
    this.message = message
    return this
  }

  withData (data) {
    this.data = data
    return this
  }
}

module.exports = TWSError
