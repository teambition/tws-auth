'use strict'

import { Client, ClientOptions } from './client'
import * as userSrv from './service/user'

class Auth extends Client {
  readonly user: Client & typeof userSrv
  constructor (options: ClientOptions) {
    super(options)

    this.user = this.withService(userSrv)
  }
}

export default Auth
export * from './client'
