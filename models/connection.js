import { Sequelize } from "sequelize";
import userModel from "./users.js";

const connectionString = process.env.DATABASE_URL;

export const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});

export const User = sequelize.define(userModel.tableName, userModel.schema);

async function sync() {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL (Neon)");

    await sequelize.sync();
  } catch (error) {
    console.error("Error:", error);
  }
}

sync();
