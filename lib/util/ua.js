'use strict'

const UaComposer = require('user-agent-composer')
const pkg = require('../../package.json')

const UA = new UaComposer()
  .product(pkg.name, pkg.version)
  .ext(`Node.js/${process.version}`)
  .ext(`${process.env.npm_package_name}/${process.env.npm_package_version}`)
  .ext(`pid/${process.pid}`)
  .build()

module.exports = UA
