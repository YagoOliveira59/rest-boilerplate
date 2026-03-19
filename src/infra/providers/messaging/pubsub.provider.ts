import { PubSub } from '@google-cloud/pubsub'
import { inject, singleton } from 'tsyringe'

import { IMessagingProvider, PublishMessageParams } from '@/core/providers/messaging/messaging.provider.interfaces'

import EnvConfig from '@/main/config/env.config'
import LoggerConfig from '@/main/config/logger.config'

/**
 * Google Cloud Pub/Sub messaging provider.
 *
 * Automatically uses the emulator when PUBSUB_EMULATOR_HOST is set (local dev).
 * In production, uses Application Default Credentials via GCP.
 *
 * TODO: Replace with SQS, RabbitMQ, or another broker if not using GCP.
 */
@singleton()
export default class PubSubProvider implements IMessagingProvider {
  private readonly pubsub: PubSub
  private readonly defaultTopic: string

  constructor(
    @inject(EnvConfig) private readonly envConfig: EnvConfig,
    @inject(LoggerConfig) private readonly loggerConfig: LoggerConfig
  ) {
    const { env } = this.envConfig

    this.defaultTopic = env.PUBSUB_EVENTS_TOPIC
    this.pubsub = new PubSub({
      projectId: env.PUBSUB_PROJECT_ID,
      ...(env.PUBSUB_EMULATOR_HOST && { apiEndpoint: env.PUBSUB_EMULATOR_HOST })
    })
  }

  public async publish<T>({ eventType, payload, requestingUserId, eventVersion, topicName }: PublishMessageParams<T>): Promise<string> {
    const { structured } = this.loggerConfig
    const topic = topicName ?? this.defaultTopic

    try {
      const message = {
        eventType,
        eventVersion: eventVersion ?? 1,
        payload,
        publishedAt: new Date().toISOString(),
        ...(requestingUserId && { requestingUserId })
      }

      const dataBuffer = Buffer.from(JSON.stringify(message))
      const messageId = await this.pubsub.topic(topic).publishMessage({
        data: dataBuffer,
        attributes: { eventType }
      })

      structured.serviceCall('Message published', {
        serviceName: 'pubsub',
        serviceOperation: 'publish',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(message as any)
      })

      return messageId
    } catch (error) {
      structured.error('Failed to publish message', error as Error, {
        serviceName: 'pubsub',
        serviceOperation: 'publish'
      })
      throw error
    }
  }
}
