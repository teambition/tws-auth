'use strict'

const UaComposer = require('user-agent-composer')
const appRoot = require('app-root-path')
const appInfo = require(`${appRoot}/package.json`)
const pkg = require('../../package.json')

const UA = new UaComposer()
  .product(pkg.name, pkg.version)
  .ext(`Node.js/${process.version}`)
  .ext(`${appInfo.name}/${appInfo.version}`)
  .ext(`pid/${process.pid}`)
  .build()

module.exports = UA
