'use strict'

import authSrv from './service/auth'
import { Client, ClientOptions } from './client'

class Auth extends Client {
  readonly auth: Client & typeof authSrv
  constructor (options: ClientOptions) {
    super(options)

    this.auth = this.withService(authSrv)
  }
}

export default Auth
export * from './client'
