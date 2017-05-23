'use strict'
const tman = require('tman')
const TWSError = require('../../error/tws_error')

tman.suite('error - tws_error', function () {
  let error
  tman.beforeEach(function () {
    error = new TWSError(200, 'error')
  })

  tman.it('should extend Error', function () {
    ;(error instanceof Error).should.be.true()
  })

  tman.it('should init with status and error', function () {
    error.status.should.equal(200)
    error.error.should.equal('error')
  })

  tman.it('should add given message', function () {
    error.withMessage('test_message')
    error.message.should.equal('test_message')
  })

  tman.it('should add given data', function () {
    error.withData({ key: 'test_data' })
    error.data.key.should.equal('test_data')
  })
})
