// import express from "express";
// import dotenv from "dotenv";
// import authRoutes from "./routes/authRoutes";
// import payrollRoutes from "./routes/payrollRoute";
// import { sequelize, connectDB } from "./config/database";
// import cors from "cors";
// import helmet from 'helmet';
// import listEndpoints from 'express-list-endpoints';

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(helmet.contentSecurityPolicy({
//     directives: {
//       connectSrc: ["'self'", "https://necapi.erb.go.ug"],
//     }
//   }));
// app.use(express.json());


// app.use("/api/auth", authRoutes);
// app.use("/api/payroll", payrollRoutes);


// connectDB();
// sequelize.sync().then(() => console.log("Tables synced..."));

// console.log("all routes", listEndpoints(app));

// app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));


// server.ts
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import payrollRoutes from "./routes/payrollRoute";
import { sequelize, connectDB } from "./config/database";
import cors from "cors";
import helmet from "helmet";
import listEndpoints from "express-list-endpoints";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://mis.nec.go.ug",
  credentials: true,
}));

app.use(helmet.contentSecurityPolicy({
  directives: {
    connectSrc: ["'self'"],   // no longer needs necapi.erb.go.ug since frontend calls /proxy/*
  },
}));

app.use(express.json());

// Proxy /api/external/* → https://necapi.erb.go.ug/api/*
app.use(
  "/api/external",
  createProxyMiddleware({
    target: "https://necapi.erb.go.ug",
    changeOrigin: true,
    pathRewrite: { "^/api/external": "/api" },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/payroll", payrollRoutes);

connectDB();
sequelize.sync().then(() => console.log("Tables synced..."));
console.log("all routes", listEndpoints(app));
app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));