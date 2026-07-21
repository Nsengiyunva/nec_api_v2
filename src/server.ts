import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import payrollRoutes from "./routes/payrollRoute";
import staffRoutes from "./routes/staffRoutes";
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

// app.use(
//   "/api/external",
//   createProxyMiddleware({
//     target: "https://necapi.erb.go.ug",
//     changeOrigin: true,
//     pathRewrite: { "^/api/external": "/api" },
//   })
// );

app.use("/api/auth", authRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/staff", staffRoutes);

connectDB();
sequelize.sync().then(() => console.log("Tables synced..."));
console.log("all routes", listEndpoints(app));
app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));












/**
 * exportDocuments.ts
 *
 * Streams rows out of the `documents` table and writes each `file`
 * (base64, optionally a full data: URI) back out to disk as a real file.
 *
 * Usage:
 *   npx ts-node exportDocuments.ts
 *   npx ts-node exportDocuments.ts --requisition_id=123
 *   npx ts-node exportDocuments.ts --id=45
 *
 * Requires: npm install mysql2
 */

// import mysql from "mysql2/promise";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";

// // ── Config ──────────────────────────────────────────────────
// const DB_CONFIG = {
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "your_database",
// };

// const OUTPUT_DIR = path.resolve(__dirname, "exported-documents");
// const BATCH_SIZE = 25; // rows fetched/written per batch — keeps memory sane

// // ── Helpers ─────────────────────────────────────────────────

// /** Strips a "data:<mime>;base64," prefix if present, returns raw base64. */
// function stripDataUriPrefix(value: string): string {
//   const match = value.match(/^data:([^;]+);base64,(.*)$/s);
//   return match ? match[2] : value;
// }

// /** Best-effort extension from the stored `type` / `name` fields. */
// function resolveExtension(type: string, name: string): string {
//   const fromName = path.extname(name || "").replace(".", "");
//   if (fromName) return fromName;

//   const mimeMap: Record<string, string> = {
//     "application/pdf": "pdf",
//     "application/msword": "doc",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
//     "application/vnd.ms-excel": "xls",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
//     "image/png": "png",
//     "image/jpeg": "jpg",
//   };
//   return mimeMap[type] || "bin";
// }

// /** Makes a filesystem-safe filename, de-duplicated with the row id. */
// function safeFileName(id: number, name: string, ext: string): string {
//   const base = (name || `document-${id}`)
//     .replace(/\.[^/.]+$/, "") // strip existing extension, we control it
//     .replace(/[^a-z0-9_\-]+/gi, "_")
//     .slice(0, 150);
//   return `${id}_${base}.${ext}`;
// }

// // ── Main ────────────────────────────────────────────────────
// async function main() {
//   const args = process.argv.slice(2).reduce<Record<string, string>>((acc, arg) => {
//     const [k, v] = arg.replace(/^--/, "").split("=");
//     if (k && v) acc[k] = v;
//     return acc;
//   }, {});

//   await mkdir(OUTPUT_DIR, { recursive: true });

//   const conn = await mysql.createConnection(DB_CONFIG);

//   try {
//     const where: string[] = [];
//     const params: any[] = [];

//     if (args.id) {
//       where.push("id = ?");
//       params.push(args.id);
//     }
//     if (args.requisition_id) {
//       where.push("requisition_id = ?");
//       params.push(args.requisition_id);
//     }
//     if (args.userid) {
//       where.push("userid = ?");
//       params.push(args.userid);
//     }

//     const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

//     const [countRows] = await conn.query<any[]>(
//       `SELECT COUNT(*) AS total FROM documents ${whereClause}`,
//       params
//     );
//     const total = countRows[0].total as number;
//     console.log(`Found ${total} document row(s) to export.`);

//     let offset = 0;
//     let exported = 0;
//     let failed = 0;

//     while (offset < total) {
//       const [rows] = await conn.query<any[]>(
//         `SELECT id, name, type, size, file
//          FROM documents
//          ${whereClause}
//          ORDER BY id
//          LIMIT ? OFFSET ?`,
//         [...params, BATCH_SIZE, offset]
//       );

//       for (const row of rows) {
//         try {
//           if (!row.file) {
//             console.warn(`  [skip] id=${row.id} has no file data`);
//             continue;
//           }

//           const raw = stripDataUriPrefix(String(row.file).trim());
//           const buffer = Buffer.from(raw, "base64");

//           // Sanity check — a real PDF starts with %PDF (25 50 44 46)
//           if (
//             row.type?.toLowerCase().includes("pdf") &&
//             buffer.slice(0, 4).toString() !== "%PDF"
//           ) {
//             console.warn(
//               `  [warn] id=${row.id} does not look like a valid PDF after decoding — saving anyway for inspection`
//             );
//           }

//           const ext = resolveExtension(row.type, row.name);
//           const fileName = safeFileName(row.id, row.name, ext);
//           const outPath = path.join(OUTPUT_DIR, fileName);

//           await writeFile(outPath, buffer);
//           exported++;
//           console.log(`  [ok] id=${row.id} -> ${fileName} (${buffer.length} bytes)`);
//         } catch (err: any) {
//           failed++;
//           console.error(`  [fail] id=${row.id}: ${err.message}`);
//         }
//       }

//       offset += BATCH_SIZE;
//     }

//     console.log(`\nDone. Exported ${exported}, failed ${failed}, total considered ${total}.`);
//     console.log(`Output directory: ${OUTPUT_DIR}`);
//   } finally {
//     await conn.end();
//   }
// }

// main().catch((err) => {
//   console.error("Fatal error:", err);
//   process.exit(1);
// });