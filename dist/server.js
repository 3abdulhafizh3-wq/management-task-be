import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pool from "./config/database.js";
import userRoutes from "./routes/users.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import { createClient } from "@supabase/supabase-js";
import commentsRoutes from "./routes/comments.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import projectMembersRouter from "./routes/project_members.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { apiReference } from "@scalar/express-api-reference";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const openapiSpec = require("../openapi.json");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : undefined;
const app = express();
const port = process.env.PORT || 3000;
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net", "https://scalar.com"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
        },
    },
}));
app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", tasksRoutes);
app.use("/comments", commentsRoutes);
app.use("/project_members", projectMembersRouter);
app.use("/auth", authRoutes);
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Format JSON tidak valid" });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
});
app.get("/", (req, res) => {
    res.json({
        message: "Halo, Ini adalah API Management Task",
        version: "1.0.0",
    });
});
app.get("/test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ time: result.rows[0].now });
    }
    catch (err) {
        console.error("Test DB Error:", err);
        res.status(500).json({ error: "Database connection failed: " + (err?.message || "unknown") });
    }
});
app.get("/debug-db", async (req, res) => {
    const hasDbUrl = Boolean(process.env.DATABASE_URL);
    const dbUrlPreview = process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')
        : 'NOT_SET';
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            status: "connected",
            hasDbUrl,
            dbUrlPreview,
            time: result.rows[0].now
        });
    }
    catch (err) {
        res.status(500).json({
            status: "error",
            hasDbUrl,
            dbUrlPreview,
            errorMessage: err.message,
            errorCode: err.code
        });
    }
});
app.use('/reference', apiReference({
    spec: {
        content: openapiSpec,
    },
    theme: 'solarized',
}));
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
        console.log(`Dokumentasi Scalar dapat diakses di http://localhost:${port}/reference`);
    });
}
export default app;
