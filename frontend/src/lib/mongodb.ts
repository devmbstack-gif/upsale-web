import mongoose from "mongoose";

function requireMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB Atlas connection string to frontend/.env.local.");
  }
  if (/127\.0\.0\.1|localhost/i.test(uri)) {
    throw new Error("MONGODB_URI must point to MongoDB Atlas (local database URIs are not allowed).");
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const mongoUri = requireMongoUri();

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri).then((m) => {
      console.log("MongoDB connected");
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
