'use strict'
const tman = require('tman')
const assert = require('power-assert')
const TWSError = require('../../error/tws_error')

tman.suite('error - tws_error', function () {
  let error
  tman.beforeEach(function () {
    error = new TWSError(200, 'error')
  })

  tman.it('should extend Error', function () {
    assert(error instanceof Error)
  })

  tman.it('should init with status and error', function () {
    assert(error.status === 200)
    assert(error.error === 'error')
  })

  tman.it('should add given message', function () {
    error.withMessage('test_message')
    assert(error.message === 'test_message')
  })

  tman.it('should add given data', function () {
    error.withData({ key: 'test_data' })
    assert(error.data.key === 'test_data')
  })
})
