// TODO: Update roles to match your authorization model
export type UserRole = 'ADMIN' | 'USER'

export interface UserData {
  userId: string
  userRole: UserRole
}

export interface AuthCheckInput {
  userId: string | undefined
  userRole: string | undefined
}
