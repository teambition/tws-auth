'use strict'
/// <reference types="type.d.ts" />

import appRoot from 'app-root-path'
import Composer from 'user-agent-composer'

const appInfo: any = require(`${appRoot}/package.json`)
const pkg: any = require('../package.json')

export const UA: string = new Composer()
  .product(pkg.name, pkg.version)
  .ext(`Node.js/${process.version}`)
  .ext(`${appInfo.name}/${appInfo.version}`)
  .build()
