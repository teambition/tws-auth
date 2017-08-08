'use strict'
const createError = require('http-errors')

function assertRes (res) {
  if (String(res.statusCode).startsWith('2')) return res.body

  if (!res.body) throw createError(res.statusCode)

  const { error, message, data } = res.body
  if (error) throw createError(res.statusCode, error, { message, data })

  throw createError(res.statusCode, String(res.body))
}

function assertResultWithError (res) {
  if (String(res.statusCode).startsWith('2')) return res.body.result

  if (!res.body) throw createError(res.statusCode)

  const { result, error } = res.body
  if (!error) return result

  throw createError(res.statusCode, error.error, { message: error.message })
}

module.exports = { assertRes, assertResultWithError }
