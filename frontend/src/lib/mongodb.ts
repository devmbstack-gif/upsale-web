import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/upsale";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };

function cache() {
  if (!globalCache.mongooseCache) {
    globalCache.mongooseCache = { conn: null, promise: null };
  }
  return globalCache.mongooseCache;
}

export async function connectDB() {
  const store = cache();
  if (store.conn) return store.conn;
  if (!store.promise) {
    store.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  }
  store.conn = await store.promise;
  return store.conn;
}
