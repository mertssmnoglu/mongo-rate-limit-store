import assert from 'node:assert'
import store from '../store'
import { Options as RateLimitOptions } from 'express-rate-limit'

before(() => {
  const options = {
    windowMs: 30 * 1000, // 30 seconds
  } as RateLimitOptions

  // Initialize the store before running the tests
  store.init(options)
})

describe('Initialization Tests', () => {
  it('Should initialize the store with the correct windowsMs', () => {
    assert.strictEqual(store.windowMs, 30 * 1000)
  })

  it('Should initialize the store with the correct prefix', () => {
    const defaultStorePrefix = 'mongo_rl_' // Same as ../store.ts
    assert.strictEqual(store.prefix, defaultStorePrefix)
  })
})

describe('Prefix Tests', () => {
  it('Should return the correct prefixed key', () => {
    const prefix = 'mongo_rl_'
    const key = 'test-key'
    const prefixedKey = store.prefixKey(key)

    assert.strictEqual(prefixedKey, prefix + key)
  })
})
