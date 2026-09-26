import { MongoMemoryServer } from 'mongodb-memory-server';

// Uses MONGODB_URI_TEST when provided (e.g. a local mongod or CI service); otherwise
// starts an in-memory MongoDB. Set MONGOMS_SYSTEM_BINARY to reuse a local mongod binary
// instead of downloading one.
let mongod;

export async function setup({ provide }) {
  if (process.env.MONGODB_URI_TEST) {
    provide('mongoUri', process.env.MONGODB_URI_TEST.replace(/\/[^/?]*(\?|$)/, '/$1'));
    return;
  }
  mongod = await MongoMemoryServer.create();
  provide('mongoUri', mongod.getUri());
}

export async function teardown() {
  if (mongod) await mongod.stop();
}
