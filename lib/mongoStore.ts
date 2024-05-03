import { MongoStoreOptions } from './types'
import {
  Store,
  Options as RateLimitOptions,
  IncrementResponse,
  ClientRateLimitInfo,
} from 'express-rate-limit'
import {
  MongoClient,
  MongoClientOptions,
  Db,
  Collection,
  Document,
  UpdateFilter,
  FindOneAndUpdateOptions,
} from 'mongodb'

/**
 * A Store implementation to store rate limit data in MongoDB.
 */
class MongoStore implements Store {
  /**
   * The MongoDB client.
   */
  private client!: MongoClient

  /**
   * MongoDB database property.
   */
  private _db!: Db

  /**
   * MongoDB collection property.
   */
  private _collection!: Collection<Document>

  /**
   * Window in milliseconds to limiting the requests.
   */
  windowMs!: number

  /**
   * The prefix to use for each key.
   */
  prefix!: string

  /**
   * The MongoDB URI to connect to.
   */
  uri!: string

  /**
   * The name of the collection to store rate limit data.
   */
  collectionName!: string

  /**
   * The options for the MongoDB client.
   */
  clientOptions?: MongoClientOptions | undefined

  /**
   * If true, the store will use local keys to store rate limit data instead of the default global keys.
   */
  localKeys?: boolean | undefined

  /**
   * Create a TTL index on the reset time field to have MongoDB automatically remove expired rate limit data.
   */
  createTtlIndex!: boolean

  /**
   * @param options The options for the store.
   */
  constructor(options: MongoStoreOptions) {
    this.windowMs = options.windowMs
    this.prefix = options.prefix ?? 'mongo_rl_'
    this.uri = options.uri
    this.clientOptions = options.clientOptions
    this.collectionName = options.collectionName ?? 'rateLimit'
    this.localKeys = options.localKeys ?? false
    this.createTtlIndex = options.createTtlIndex ?? true
  }

  /**
   *
   * @param options The options for the Rate Limiter.
   */

  init(options: RateLimitOptions): void {
    this.windowMs = options.windowMs
    this.client = this.createClient(this.uri, this.clientOptions)
    this.client.connect()
    this._db = this.client.db('rateLimit')
    this._collection = this._db.collection(this.collectionName)
    if (this.createTtlIndex) {
      this._collection.createIndex({ resetTime: 1 }, { expireAfterSeconds: 0 })
    }
  }

  /**
   *
   * @param uri The MongoDB URI to connect to.
   * @param options The options for the MongoDB client.
   * @returns MongoClient instance.
   */
  private createClient(uri: string, options?: MongoClientOptions): MongoClient {
    return new MongoClient(uri, options)
  }

  /**
   * Prefixes the key with the store's prefix.
   * @param key The key to prefix.
   * @returns The prefixed key.
   */
  prefixKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   *
   * @param key The key to get the rate limit data for.
   * @returns ClientRateLimitInfo object or undefined if the key is not found.
   */
  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const data = await this._collection.findOne({ key: this.prefixKey(key) })

    if (!data) {
      return undefined
    }

    return {
      resetTime: new Date(data.resetTime),
      totalHits: data.totalHits,
    }
  }

  /**
   *
   * @param key The key to increment the rate limit data for.
   * @returns IncrementResponse object.
   */
  async increment(key: string): Promise<IncrementResponse> {
    const record = await this._collection.findOne({ key: this.prefixKey(key) })

    if (!record) {
      const data = await this._collection.findOneAndUpdate(
        { key: this.prefixKey(key) },
        {
          $set: {
            key: this.prefixKey(key),
            totalHits: 1,
            resetTime: new Date(Date.now() + this.windowMs),
          },
        },
        { upsert: true, returnDocument: 'after' },
      )

      return { resetTime: new Date(data?.resetTime), totalHits: data?.totalHits }
    }
    const data = await this._collection.findOneAndUpdate(
      { key: this.prefixKey(key) },
      {
        $inc: { totalHits: 1 },
        $set: { resetTime: new Date(Date.now() + this.windowMs) },
      },
      { returnDocument: 'after' },
    )

    return { resetTime: new Date(data?.resetTime), totalHits: data?.totalHits }
  }

  /**
   *
   * @param key The key to decrement the rate limit data for.
   */
  async decrement(key: string): Promise<void> {
    try {
      const record = await this._db
        .collection(this.collectionName)
        .findOne({ key: this.prefixKey(key) })

      let updateQuery: UpdateFilter<Document> = {}
      let findOneAndUpdateOptions: FindOneAndUpdateOptions = {}

      if (!record) {
        updateQuery.$set = {
          key: this.prefixKey(key),
          totalHits: -1,
          resetTime: new Date(Date.now() + this.windowMs),
        }
        findOneAndUpdateOptions = { upsert: true, returnDocument: 'after' }
      } else {
        updateQuery = {
          $inc: { totalHits: -1 },
          $set: { resetTime: new Date(Date.now() + this.windowMs) },
        }
        findOneAndUpdateOptions = { returnDocument: 'after' }
      }
      // Execute the query
      await this._collection.findOneAndUpdate(
        { key: this.prefixKey(key) },
        updateQuery,
        findOneAndUpdateOptions,
      )
    } catch (error) {
      throw new Error('Failed to decrement key')
    }
  }
  /**
   *
   * @param key The key to reset the rate limit data for.
   */
  async resetKey(key: string): Promise<void> {
    try {
      await this._collection.findOneAndUpdate(
        { key: this.prefixKey(key) },
        { $set: { totalHits: 0 } },
      )
    } catch (error) {
      throw new Error('Failed to reset key')
    }
  }

  /**
   * Resets all rate limit data.
   */
  async resetAll(): Promise<void> {
    try {
      await this._collection.updateMany({}, { $set: { totalHits: 0 } })
    } catch (error) {
      throw new Error('Failed to reset all keys')
    }
  }

  /**
   * Closes the MongoDB connection.
   * @param force If true, force close the connection. Optional.
   */
  async closeConnection(force?: boolean): Promise<void> {
    try {
      await this.client.close(force)
    } catch (error) {
      throw new Error('Failed to close connection')
    }
  }
}

export default MongoStore
