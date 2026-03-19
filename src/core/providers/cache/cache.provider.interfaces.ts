export interface CacheKeyProps {
  key: string
  prefix: string
}

export interface CacheSaveProps<valueT> extends CacheKeyProps {
  value: valueT
  ttl?: number
}

export interface ICacheProvider {
  connect(): Promise<void>
  encodeValue<valueT>(rawValue: valueT): string
  decodeValue<valueT>(encodedValue: string): valueT
  cacheSave<valueT>({ key, prefix, value, ttl }: CacheSaveProps<valueT>): Promise<string | null>
  cacheRead<valueT>({ key, prefix }: CacheKeyProps): Promise<valueT | null>
}
