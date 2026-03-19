import { EventTypes } from '@/core/providers/messaging/event-types'
import { UserData } from '@/core/services/authorization/auth.service.interfaces'

export interface BasePayload {
  ip: string | undefined
  user: UserData | undefined
}

export interface PublishMessageParams<T> {
  eventType: EventTypes
  payload: T
  requestingUserId?: string
  eventVersion?: number
  topicName?: string
}

export interface IMessagingProvider {
  publish<T>(params: PublishMessageParams<T>): Promise<string>
}
