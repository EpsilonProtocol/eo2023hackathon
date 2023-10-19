import mongoose from "mongoose";

export const establishConnection = async () => {
  const DB_URL = process.env["MONGODB_URL"];

  if (!DB_URL) throw Error("No DB Connection URL");
  else console.log(`Connecting to DB at ${DB_URL}`);

  await mongoose.connect(DB_URL).then(() => console.log(`Successfully connected to ${DB_URL}`));
};
