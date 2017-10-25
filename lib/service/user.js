'use strict'

const { assertResultOrError } = require('../util/request')

module.exports = {
  verifyCookie: function (cookie, signature) {
    return this.requestWithSelfToken(
      'POST',
      '/v1/users/verify/cookie',
      { cookie, signed: signature },
      assertResultOrError
    )
  },

  verifyToken: function (tokenToVerify) {
    return this.requestWithSelfToken(
      'POST',
      '/v1/users/verify/token',
      { token: tokenToVerify },
      assertResultOrError
    )
  },

  getById: function (_userId) {
    return this.requestWithSelfToken(
      'GET',
      `/v1/users/${_userId}`,
      null
    )
  },

  getByEmail: function (email) {
    return this.requestWithSelfToken(
      'GET',
      '/v1/users:getByEmail',
      { email }
    )
  },

  batchGetbyIds: function (_ids) {
    return this.requestWithSelfToken(
      'POST',
      '/v1/users:BatchGetByIDs',
      { ids: _ids }
    )
  }
}
