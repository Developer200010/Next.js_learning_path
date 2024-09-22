import mongoose from "mongoose";

// data return from database, it is optional might have or not
type ConnectionObject = {
  isConnected?: number;
};
 
const connection: ConnectionObject = {};

async function dbConnection(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URL || "", {});

    connection.isConnected = db.connections[0].readyState; //optional

    console.log("db connection successfully");
  } catch (error) {
    console.log("db connection failed", error);
    process.exit(1);
  }
}

export default dbConnection;
