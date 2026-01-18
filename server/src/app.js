import express from "express"; 
import cors from "cors";
import dotenv from "dotenv";
import corsOptions from "./config/corsConfig.js";
import userRoutes from "./routes/userRoutes.js";
import sdGenRoutes from "./routes/sdGenRoutes.js";

// Load environment variablescle
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/sdgen", sdGenRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

export default app;