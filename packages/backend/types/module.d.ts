import 'express'

declare module 'express' {
  interface Request {
    user?: IAuthUser
    accessToken: string
  }
}
