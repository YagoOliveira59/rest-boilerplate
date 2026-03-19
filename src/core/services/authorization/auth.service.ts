import { AuthCheckError, AuthValidationDataError } from '@/core/services/authorization/auth.service.errors'
import { AuthCheckInput, UserData, UserRole } from '@/core/services/authorization/auth.service.interfaces'

/**
 * Authorization service.
 *
 * Validates that incoming requests have valid user identity and the required role.
 * Reads headers injected by an upstream gateway after JWT validation.
 *
 * TODO: Adapt role names and validation logic to your own auth strategy.
 */
export default class AuthService {
  public readonly userId: string
  public readonly userRole: UserRole

  private readonly VALID_ROLES: UserRole[] = ['ADMIN', 'USER']

  constructor({ userId, userRole }: AuthCheckInput) {
    if (!userId || !userRole) {
      throw new AuthValidationDataError('Missing required auth headers: x-jwt-user or x-jwt-role')
    }

    if (!this.VALID_ROLES.includes(userRole as UserRole)) {
      throw new AuthValidationDataError(`Invalid user role: ${userRole}`)
    }

    this.userId = userId
    this.userRole = userRole as UserRole
  }

  /** Only ADMIN users are allowed */
  public checkAuthorization(): void {
    if (this.userRole !== 'ADMIN') {
      throw new AuthCheckError(`Access denied: role '${this.userRole}' is not ADMIN`)
    }
  }

  /** ADMIN or USER are allowed */
  public checkAuthorizationWithUserAccess(): UserData {
    if (this.userRole !== 'ADMIN' && this.userRole !== 'USER') {
      throw new AuthCheckError(`Access denied: role '${this.userRole}' is not ADMIN or USER`)
    }

    return { userId: this.userId, userRole: this.userRole }
  }
}
