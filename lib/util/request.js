'use strict'
const createError = require('http-errors')

const isOk = (res) => res.statusCode >= 200 && res.statusCode < 300

function assertRes (res) {
  if (isOk(res)) return res.body

  if (!res.body) throw createError(res.statusCode)
  throw createError(res.statusCode, `${res.body}`, res.body)
}

function assertResultWithError (res) {
  if (isOk(res)) {
    if (res.body && res.body.error) {
      throw createError(res.statusCode, `${res.body}`, res.body)
    } else {
      return res.body ? res.body.result : undefined
    }
  }

  if (!res.body) throw createError(res.statusCode)
  throw createError(res.statusCode, `${res.body}`, res.body)
}

module.exports = { assertRes, assertResultWithError }
