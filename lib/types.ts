import type { MongoClientOptions } from 'mongodb'

export type MongoStoreOptions = {
  windowMs: number
  prefix: string
  url: string
  clientOptions: MongoClientOptions | undefined
  collectionName: string
}
