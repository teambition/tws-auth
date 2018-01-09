'use strict'
const createError = require('http-errors')

const isOk = (res) => res.statusCode >= 200 && res.statusCode < 300

function assertRes (res) {
  if (isOk(res)) return res.body

  // 追加额外的信息，方便调试
  // 注意，不要把调试信息直接返给客户端
  let err = createError(res.statusCode, res.statusMessage, {
    originalUrl: res.originalUrl,
    originalMethod: res.originalMethod,
    headers: res.headers,
    body: res.body,
    elapsedTime: res.elapsedTime || 0,
    timingPhases: res.timingPhases || {}
  })

  // 标准的 Teambition Web Service 错误响应应该包含 `error` 和 `message` 两个 string 属性
  // 其中 error 为错误码，形如 "InvalidPassword", "UserNotFound"，客户端可以根据该错误码进行 i18n 错误提示处理
  // message 则为英文版的详细错误提示
  if (res.body) {
    err.name = err.error = res.body.error || err.name
    if (res.body.message) err.message = res.body.message
  }
  throw err
}

// 该函数将被废弃
function assertResultOrError (res) {
  if (isOk(res)) {
    if (res.body && res.body.error) {
      throw createError(401, JSON.stringify(res.body), res.body)
    } else {
      return res.body ? res.body.result : undefined
    }
  }

  if (!res.body) throw createError(res.statusCode)
  throw createError(res.statusCode, JSON.stringify(res.body), res.body)
}

module.exports = { assertRes, assertResultOrError }
