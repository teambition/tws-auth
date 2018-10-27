'use strict'

import authSrv from './service/auth'
import { Client, ClientOptions } from './client'

/**
 * Auth client with some teambition auth service method.
 * It is a typical example that how to create custom service client with Client.
 * You may need to create your teambition web service client with some useful method.
 */
class TWS extends Client {
  readonly authSrv: Client & typeof authSrv
  constructor (options: ClientOptions) {
    super(options)

    this.authSrv = this.withService(authSrv)
  }
}

export default TWS
export { TWS }
export * from './client'
