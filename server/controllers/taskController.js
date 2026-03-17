import prisma from "../db/prismaClient.js";

export const createTask = async (req, res) => {
  try {
    const { task, description, dueDate, priority, project } = req.body;

    const newTask = await prisma.task.create({
      data: {
        task,
        description,
        dueDate: new Date(dueDate),
        priority,
        project,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { dueDate: "asc" },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const updatedTask = await prisma.task.update({
      where: { id: BigInt(taskId) },
      data: req.body,
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    await prisma.task.delete({
      where: { id: BigInt(taskId) },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
