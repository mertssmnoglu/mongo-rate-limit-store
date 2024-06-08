import assert from 'node:assert'
import store from '../store'

describe('DB Connection Tests', () => {
  it('Should close the database connection', async () => {
    await store
      .closeConnection()
      .then(() => {
        assert.ok(true)
      })
      .catch(() => {
        assert.fail('Unable to close the database connection')
      })
  })
})
