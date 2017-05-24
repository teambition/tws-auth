'use strict'
const statuses = require('statuses')
const TWSError = require('../error/tws_error')

function assertRes ({ res }) {
  if (String(res.status).startsWith('2')) return res.data

  if (!res.data) {
    throw new TWSError(res.status, statuses[res.status])
  }

  const { error, message, data } = res.data
  if (error) {
    throw new TWSError(res.status, error)
      .withMessage(message || '')
      .withData(data || null)
  }

  throw new TWSError(res.status, String(res.data))
}

module.exports = { assertRes }
