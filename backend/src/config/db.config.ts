import mongoose, { connect } from "mongoose";
import serverConfig from "./server.config";

export async function connectToDb() {
  try {
    await connect(serverConfig.DB_URL!);
    console.log("Db connected");

    const connection = mongoose.connection;

    connection.on("error", (err) => {
      console.log("Mongodb connection error", err);
    });

    connection.on("disconnected", () => {
      console.log("Mongodb Disconnected");
    });

    process.on("SIGINT", async () => {
      await connection.close();
      console.log("Mongodb connection closed");
      process.exit(0);
    });
  } catch (error) {
    console.log("Failed to connect to mongodb", error);
    process.exit(1);
  }
}
