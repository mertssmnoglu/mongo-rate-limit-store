import assert from 'node:assert'
import store from '../store'

describe('Store Compatibility', () => {
  // Required methods
  it('Should have *increment* public method', () => {
    assert.ok(typeof store.increment === 'function')
  })
  it('Should have *decrement* public method', () => {
    assert.ok(typeof store.decrement === 'function')
  })
  it('Should have *resetKey* public method', () => {
    assert.ok(typeof store.resetKey === 'function')
  })

  // Optional methods
  it('Should optionally have *init* public method', () => {
    assert.ok(store.init === undefined || typeof store.init === 'function')
  })
  it('Should optionally have *get* public method', () => {
    assert.ok(store.get === undefined || typeof store.get === 'function')
  })
  it('Should optionally have *resetAll* public method', () => {
    assert.ok(store.resetAll === undefined || typeof store.resetAll === 'function')
  })

  // Optional properties
  it('Should optionally have *prefix* property', () => {
    assert.ok(store.prefix === undefined || typeof store.prefix === 'string')
  })
  it('Should optionally have *localKeys* property', () => {
    assert.ok(store.localKeys === undefined || typeof store.localKeys === 'boolean')
  })
})
