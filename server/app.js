import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/tasks", taskRoutes);

export default app;
