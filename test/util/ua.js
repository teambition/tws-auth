'use strict'
const tman = require('tman')
const assert = require('power-assert')
const UA = require('../../lib/util/ua')
const pkg = require('../../package.json')

tman.suite('UA', () => {
  tman.it('should ok', () => {
    assert.equal(typeof UA, 'string')
    assert.ok(UA.includes(`Node.js/${process.version}`))  // Node.js version
    assert.ok(UA.includes(`${pkg.name}/${pkg.version}`))  // auth name/version
    assert.ok(UA.includes(` ${pkg.name}/${pkg.version}`)) // process name/version (begin with a space)
    assert.ok(UA.includes(`pid/${process.pid}`)) // process pid
  })
})
