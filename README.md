# Mongo Rate Limit Store

MongoDB store implementation for [express-rate-limit](https://npmjs.com/package/express-rate-limit) package.

This project is fork of the [rate-limit-mongo](https://npmjs.com/package/rate-limit-mongo)

## Install

```bash
npm install mongo-rate-limit-store
```

## Getting Started

```typescript
import { rateLimit } from 'express-rate-limit'
import MongoStore from 'mongo-rate-limit-store'

const limiter = rateLimit({
  store: new MongoStore({
    windowsMs: 15 * 60 * 1000,
    prefix: 'mongo_rl_',
    uri: 'mongodb://localhost:27017',
  }),
  max: 100,
  // should match the windowMs
  windowMs: 15 * 60 * 1000,
})

//  apply to all requests
app.use(limiter)
```

## Implementation

MongoStore class is suitable with the express-rate-limit's `Store` interface. You can check the offical documentation about creating custom stores for express-rate-limit from [here](https://express-rate-limit.mintlify.app/guides/creating-a-store).

## License

MIT Lisence
