import { createClient, RedisClientType } from 'redis'
import { inject, singleton } from 'tsyringe'

import { CacheKeyProps, CacheSaveProps, ICacheProvider } from '@/core/providers/cache/cache.provider.interfaces'

import EnvConfig from '@/main/config/env.config'
import LoggerConfig from '@/main/config/logger.config'

@singleton()
export default class RedisProvider implements ICacheProvider {
  private client: RedisClientType
  private static readonly DEFAULT_TTL: number = 300

  constructor(
    @inject(EnvConfig) private readonly envConfig: EnvConfig,
    @inject(LoggerConfig) private readonly loggerConfig: LoggerConfig
  ) {
    this.client = createClient({ url: this.envConfig.env.REDIS_URL })

    const { structured } = this.loggerConfig

    this.client.on('error', (error) => structured.error('Redis Client Error', error as Error, { serviceName: 'redis' }))
    this.client.on('connect', () =>
      structured.serviceCall('Redis connected', { serviceName: 'redis', serviceOperation: 'connect' })
    )
    this.client.on('reconnecting', () =>
      structured.serviceCall('Redis reconnecting', { serviceName: 'redis', serviceOperation: 'reconnect' })
    )
    this.client.on('end', () =>
      structured.serviceCall('Redis connection closed', { serviceName: 'redis', serviceOperation: 'disconnect' })
    )
  }

  public async connect(): Promise<void> {
    if (!this.client.isReady) {
      await this.client.connect()
    }
  }

  public encodeValue<valueT>(rawValue: valueT): string {
    return JSON.stringify(rawValue)
  }

  public decodeValue<valueT>(encodedValue: string): valueT {
    return JSON.parse(encodedValue)
  }

  public async cacheSave<valueT>({
    key,
    prefix,
    value,
    ttl = RedisProvider.DEFAULT_TTL
  }: CacheSaveProps<valueT>): Promise<string | null> {
    const { structured } = this.loggerConfig
    const fullKey = `${prefix}:${key}`

    if (this.client.isReady) {
      try {
        const encodedValue = this.encodeValue<valueT>(value)
        return this.client.set(fullKey, encodedValue, { EX: ttl })
      } catch (error) {
        structured.error('Failed to encode value for caching', error as Error, {
          serviceName: 'redis',
          serviceOperation: 'cache.set',
          cacheKey: fullKey
        })
        return null
      }
    }

    structured.warn('Redis client not ready, skipping cache save', {
      serviceName: 'redis',
      cacheKey: fullKey
    })
    return null
  }

  public async cacheRead<valueT>({ key, prefix }: CacheKeyProps): Promise<valueT | null> {
    const { structured } = this.loggerConfig
    const fullKey = `${prefix}:${key}`

    if (this.client.isReady) {
      const encodedValue = await this.client.get(fullKey)
      if (!encodedValue) return null

      try {
        return this.decodeValue<valueT>(encodedValue)
      } catch (error) {
        structured.error('Failed to decode cached value from Redis', error as Error, {
          serviceName: 'redis',
          serviceOperation: 'cache.get',
          cacheKey: fullKey
        })
        return null
      }
    }

    structured.warn('Redis client not ready, skipping cache read', {
      serviceName: 'redis',
      cacheKey: fullKey
    })
    return null
  }
}
