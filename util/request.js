'use strict'
const statuses = require('statuses')
const TWSError = require('../error/tws_error')

function assertRes ({ res }) {
  if (String(res.status).startsWith('2')) return Promise.resolve(res.data)

  if (!res.data) {
    return Promise.reject(new TWSError(res.status, statuses[res.status]))
  }

  const { error, message, data } = res.data
  if (error) {
    return Promise.reject(new TWSError(res.status, error)
      .withMessage(message || '')
      .withData(data || null))
  }

  return Promise.reject(new TWSError(res.status, String(res.data)))
}

module.exports = { assertRes }
