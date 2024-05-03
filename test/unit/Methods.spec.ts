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

const data = {
  increment: {
    insert: 'incr-test-' + Math.random().toString(36).substring(7),
    update: 'incr-test',
  },
  decrement: {
    insert: 'decr-test-' + Math.random().toString(36).substring(7),
  },
  resetKey: 'reset-test',
}

describe('Initialization Tests', () => {
  it('Should initialize the store with the correct windowsMs', () => {
    assert.strictEqual(store.windowMs, 30 * 1000)
  })

  it('Should initialize the store with the correct prefix', () => {
    const defaultStorePrefix = 'mongo_rl_' // Same as ../store.ts
    assert.strictEqual(store.prefix, defaultStorePrefix)
  })
})

describe('Increment Tests', () => {
  it('Should create a document with 1 totalHits', async () => {
    const testKey = data.increment.insert
    const result = await store.increment(testKey)
    if (result) {
      assert.strictEqual(result.totalHits, 1)
    }
  })

  it('Should increment the current document by 1', async () => {
    const testKey = data.increment.update
    const oldHit = await store.get(testKey)
    const increasedHit = await store.increment(testKey)

    const expectedHits = oldHit ? oldHit.totalHits + 1 : 1
    assert.strictEqual(increasedHit.totalHits, expectedHits)
  })
})

describe('Decrement Tests', () => {
  it('Should create a document with -1 totalHits', async () => {
    const testKey = data.decrement.insert
    const oldHit = await store.get(testKey)
    assert.ok(!oldHit) // Ensure the document does not exist
    await store.decrement(testKey)

    const reducedHit = await store.get(testKey)
    if (!reducedHit) {
      assert.fail('Unable to create decreased document')
    }

    assert.strictEqual(reducedHit.totalHits, -1)
  })

  it('Should decrement the current document by 1', async () => {
    const testKey = data.decrement.insert // Use the same key as the previous test
    const oldHit = await store.get(testKey)
    assert.ok(oldHit) // Ensure the document exists
    await store.decrement(testKey)

    const decreasedHit = await store.get(testKey)
    if (!decreasedHit) {
      // This should not happen
      assert.fail('Unexpected error occurred')
    }

    const expectedHits = oldHit.totalHits - 1
    assert.strictEqual(decreasedHit.totalHits, expectedHits)
  })
})

describe('Reset Tests', () => {
  it('Should reset the key to 0 totalHits', async () => {
    const testKey = data.resetKey
    const oldHit = await store.get(testKey)
    if (!oldHit) {
      // Create a document to reset
      await store.increment(testKey)
    }

    await store.resetKey(testKey)
    const resetHit = await store.get(testKey)
    if (!resetHit) {
      assert.fail('Unable to reset key')
    }

    assert.strictEqual(resetHit.totalHits, 0)
  })

  it('Should reset all keys to 0 totalHits', async () => {
    const testKeys = [data.increment.insert, data.decrement.insert, data.resetKey]
    for (const key of testKeys) {
      // Test at least 3 keys to ensure the resetAll method works
      const oldHit = await store.get(key)
      if (!oldHit) {
        // Create a document to reset
        await store.increment(key)
      }

      await store.resetAll()
      const resetHit = await store.get(key)
      if (!resetHit) {
        assert.fail('Unable to reset all keys')
      }

      assert.strictEqual(resetHit.totalHits, 0)
    }
  })
})
