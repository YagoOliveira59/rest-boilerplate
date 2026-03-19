import { NextFunction, Request, Response } from 'express'

import { ErrorCode } from '@/api/errors/error-code'
import { ForbiddenError, UnauthorizedError } from '@/api/errors/http-errors'

import AuthService from '@/core/services/authorization/auth.service'
import { AuthCheckError, AuthValidationDataError } from '@/core/services/authorization/auth.service.errors'

/**
 * Authentication middleware.
 *
 * Reads user identity from JWT headers injected by an upstream gateway/proxy:
 *   - x-jwt-user: the user's ID
 *   - x-jwt-role: the user's role
 *
 * TODO: Adapt this to your own authentication mechanism (Firebase, JWT secret, etc.)
 *
 * @param allowUserRole - if true, accepts USER and ADMIN roles; if false, ADMIN only
 */
const checkAuth = (req: Request, next: NextFunction, allowUserRole: boolean) => {
  try {
    const userId = req.headers['x-jwt-user'] as string | undefined
    const userRole = req.headers['x-jwt-role'] as string | undefined

    const authService = new AuthService({ userId, userRole })
    if (allowUserRole) {
      authService.checkAuthorizationWithUserAccess()
    } else {
      authService.checkAuthorization()
    }

    req.requestingUser = { userId: authService.userId, userRole: authService.userRole }
    return next()
  } catch (error) {
    if (error instanceof AuthValidationDataError) {
      const unauthorizeError = new UnauthorizedError(
        { validationError: error },
        'Invalid requesting user data headers (id or role)',
        ErrorCode.AUTH_INVALID_REQUESTING_USER_DATA
      )
      return next(unauthorizeError)
    }

    if (error instanceof AuthCheckError) {
      const forbiddenError = new ForbiddenError(
        { authorizationError: error },
        allowUserRole ? 'User role is not ADMIN or USER' : 'User role is not ADMIN',
        ErrorCode.AUTH_ACCESS_PERMISSION_DENIED
      )
      return next(forbiddenError)
    }

    return next(error)
  }
}

/** Requires ADMIN role */
export const checkAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => checkAuth(req, next, false)

/** Requires ADMIN or USER role */
export const checkAuthWithUserAccessMiddleware = (req: Request, _res: Response, next: NextFunction) =>
  checkAuth(req, next, true)
