import express from "express";
import dotenv from "dotenv";
import farmerRoutes from "./routes/farmerRoutes";
import authRoutes from "./routes/authRoutes";
import { sequelize, connectDB } from "./config/database";
import cors from "cors";
import "./models/associations";
import nfaMainRoutes from "./routes/nfaMainRoutes";
import listEndpoints from 'express-list-endpoints';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/nfa", nfaMainRoutes);

console.log("JWT_SECRET:", process.env.JWT_SECRET);


connectDB();
sequelize.sync().then(() => console.log("Tables synced..."));

console.log("all routes", listEndpoints(app));

app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
