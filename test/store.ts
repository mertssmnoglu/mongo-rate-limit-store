import MongoStore from '../lib'

const store = new MongoStore({
  windowMs: 60000,
  clientOptions: undefined,
  collectionName: 'rateLimit-test',
  prefix: 'mongo_rl_',
  uri: 'mongodb://localhost:27017',
})

// Export the store instance for testing
export default store
