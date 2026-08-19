import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://guptanikhil8424_db_user:RIGqlhsGX7FEikl8@cluster0.uxyfmlj.mongodb.net/?appName=Cluster0';
  try {
    console.log('[MongoDB] Connecting to database...');
    const conn = await mongoose.connect(uri, {
      dbName: 'foodmap',
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.log('[MongoDB] Server continuing in resilient mode...');
    return null;
  }
}
