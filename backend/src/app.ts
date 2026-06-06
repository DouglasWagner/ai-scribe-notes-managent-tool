import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notesRouter } from "./routes/notes.js";
import { patientsRouter } from "./routes/patients.js";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/patients", patientsRouter);
app.use("/api/notes", notesRouter);

app.use(errorHandler);
