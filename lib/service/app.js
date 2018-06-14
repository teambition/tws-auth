'use strict'

const { assertResultOrError } = require('../util/request')

module.exports = {
  // 暂不对第三方应用开放
  verifyToken: function (accessToken) {
    return this.requestWithSelfToken(
      'POST',
      '/v1/apps/verify/token',
      { token: accessToken },
      assertResultOrError
    )
  }
}
