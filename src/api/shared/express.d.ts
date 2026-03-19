import { UserData } from '@/core/services/authorization/auth.service.interfaces'

declare global {
  namespace Express {
    export interface Request {
      requestingUser?: UserData
    }
  }
}
