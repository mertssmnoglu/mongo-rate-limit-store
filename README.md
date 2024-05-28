# Mongo Rate Limit Store

MongoDB store implementation for [express-rate-limit](https://npmjs.com/package/express-rate-limit) package.

This project is fork of the [rate-limit-mongo](https://npmjs.com/package/rate-limit-mongo)

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM Dependency Graph][npm-dependency-graph-image]][npm-dependency-graph-url]

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

MongoStore class is suitable with the express-rate-limit's `Store` interface. You can check the offical documentation about creating custom stores for express-rate-limit from [here][creating-a-store].

## License

[MIT License](./LICENSE)

<!-- References -->

[npm-downloads-image]: https://badgen.net/npm/dm/mongo-rate-limit-store
[npm-url]: https://npmjs.org/package/mongo-rate-limit-store
[npm-version-image]: https://badgen.net/npm/v/mongo-rate-limit-store
[npm-install-size-image]: https://packagephobia.com/badge?p=mongo-rate-limit-store
[npm-install-size-url]: https://packagephobia.com/result?p=mongo-rate-limit-store
[npm-dependency-graph-image]: https://img.shields.io/badge/dependency%20graph-00ddff
[npm-dependency-graph-url]: https://npmgraph.js.org/?q=mongo-rate-limit-store
[creating-a-store]: https://express-rate-limit.mintlify.app/guides/creating-a-store
