import type { MongoClientOptions } from 'mongodb'

/**
 * The options for the MongoDB store.
 */
export type MongoStoreOptions = {
  /**
   * Window in milliseconds to limiting the requests.
   */
  windowMs: number
  /**
   * The prefix to use for each key.
   */
  prefix: string
  /**
   * The MongoDB URI to connect to.
   */
  uri: string
  /**
   * The name of the collection to store rate limit data.
   */
  collectionName: string
  /**
   * The options for the MongoDB client.
   */
  clientOptions: MongoClientOptions | undefined
  /**
   * If true, the store will use local keys to store rate limit data instead of the default global keys.
   */
  localKeys?: boolean | undefined
  /**
   * Create a TTL index on the reset time field to have MongoDB automatically remove expired rate limit data.
   */
  createTtlIndex?: boolean | undefined
}
