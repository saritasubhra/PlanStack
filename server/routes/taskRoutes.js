import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
