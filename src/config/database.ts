import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "erbdb",
  "erbadmin",
  "admin@NSE#256",
  {
    host: "localhost",
    dialect: "mysql"
  }
);

export const connectDB = async () => {
  // try {
  //   await sequelize.authenticate();
  //   console.log("Database - MySQL connected....");
  // } catch (error) {
  //   console.error("DB Error:", error);
  // }
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync({ alter: true });
    console.log("All models synchronized...");

  } catch (error) {
    console.error("Unable to start server:", error);
  }
};
