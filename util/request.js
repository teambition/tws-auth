'use strict'
const createError = require('http-errors')

function assertRes ({ res }) {
  if (String(res.status).startsWith('2')) return res.data

  if (!res.data) throw createError(res.status)

  const { error, message, data } = res.data
  if (error) throw createError(res.status, error, { message, data })

  throw createError(res.status, String(res.data))
}

module.exports = { assertRes }
