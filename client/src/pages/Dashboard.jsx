import { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Folder,
  Target,
  List,
  LayoutDashboard,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Flag,
  Check,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";

const demoTasks = [
  {
    id: 1,
    task: "Review design mockups",
    description: "Check the Figma file",
    dueDate: new Date(2026, 1, 2, 20, 17, 20),
    priority: 1,
    completed: false,
    project: "personal",
  },
  {
    id: 2,
    task: "Team standup",
    description: "",
    dueDate: new Date(), // TODAY
    priority: 4,
    completed: true,
    project: "work",
  },
  {
    id: 3,
    task: "Update documentation",
    description: "Add API endpoints",
    dueDate: new Date(2026, 1, 5, 20, 17, 20),
    priority: 2,
    completed: false,
    project: "personal",
  },
  {
    id: 4,
    task: "Implement authentication",
    description: "Add JWT-based login and signup flow",
    dueDate: new Date(),
    priority: 2,
    completed: false,
    project: "work",
  },
  {
    id: 5,
    task: "Fix dashboard bugs",
    description: "Resolve UI issues reported by QA",
    dueDate: new Date(2026, 1, 7, 20, 17, 20),
    priority: 3,
    completed: false,
    project: "work",
  },
  {
    id: 6,
    task: "Deploy backend service",
    description: "Deploy Node.js API on Render",
    dueDate: new Date(),
    priority: 1,
    completed: false,
    project: "work",
  },
];

const projects = [
  { id: "work", label: "Work" },
  { id: "personal", label: "Personal" },
];

const STORAGE_KEY = "planstack_tasks";

const getStoredTasks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    return JSON.parse(data).map((t) => ({
      ...t,
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
    }));
  } catch (e) {
    console.error("Storage read error", e);
    return [];
  }
};

const saveTasksToStorage = (tasks) => {
  const serializable = tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
};

export default function Dashboard() {
  const isSameCalendarDay = (date1, date2) => {
    if (!date1 || !date2) return false;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatDueDate = (date) => {
    if (!date) return "";

    const today = new Date();

    if (isSameCalendarDay(date, today)) return "Today";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };
  // --- UI States ---
  const [isDisplayPanelOpen, setIsDisplayPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // --- Task Form States ---
  const [tasks, setTasks] = useState(getStoredTasks);
  const [taskInput, setTaskInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState(null);
  const [project, setProject] = useState(null);

  // --- Popup States ---
  const [activePopup, setActivePopup] = useState(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const [activeFilter, setActiveFilter] = useState("all");

  const priorities = [
    { id: 1, label: "Priority 1", color: "text-red-500" },
    { id: 2, label: "Priority 2", color: "text-orange-500" },
    { id: 3, label: "Priority 3", color: "text-blue-500" },
    { id: 4, label: "Priority 4", color: "text-neutral-400" },
  ];

  const filteredTasks = tasks?.filter((task) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (activeFilter === "all") {
      return task;
    }

    if (activeFilter === "completed") {
      return task.completed;
    }

    if (activeFilter === "incomplete") {
      return !task.completed;
    }

    if (activeFilter === "today") {
      return !task.completed && isSameCalendarDay(task.dueDate, now);
    }

    if (activeFilter === "upcoming") {
      if (!task.completed && task.dueDate) {
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);

        return due > now; // 🔥 ONLY future dates
      }
      return false;
    }

    if (activeFilter === "work") {
      return task.project === "work";
    }

    if (activeFilter === "personal") {
      return task.project === "personal";
    }

    return true;
  });

  const todayTasks = tasks?.filter(
    (t) => isSameCalendarDay(t.dueDate, new Date()) && !t.completed,
  ).length;

  const completedToday = tasks?.filter(
    (t) => isSameCalendarDay(t.dueDate, new Date()) && t.completed,
  ).length;

  const getEmptyMessage = () => {
    switch (activeFilter) {
      case "today":
        return "No tasks for today";
      case "upcoming":
        return "No upcoming tasks";
      case "completed":
        return "No completed tasks";
      default:
        return "No items found";
    }
  };

  const closeForm = () => {
    setIsAdding(false);
    setTaskInput("");
    setDescInput("");
    setDueDate(null);
    setPriority(null);
    setActivePopup(null);
    setProject(null);
  };

  const handleAddTask = () => {
    const existing = getStoredTasks();

    let updated;

    if (editingTaskId) {
      // ⭐ UPDATE EXISTING TASK
      updated = existing.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              task: taskInput,
              description: descInput,
              dueDate: dueDate ? new Date(dueDate) : null,
              priority: priority || 4,
              project: project,
            }
          : t,
      );
    } else {
      // ⭐ CREATE NEW TASK
      const newTask = {
        id: Date.now(),
        task: taskInput,
        description: descInput,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 4,
        project: project,
        completed: false,
      };

      updated = [...existing, newTask];
    }

    saveTasksToStorage(updated);
    setTasks(updated);
    setEditingTaskId(null);
    resetForm();
  };

  const resetForm = () => {
    setTaskInput("");
    setDescInput("");
    setDueDate(null);
    setPriority(null);
    setIsAdding(false);
    setActivePopup(null);
    setProject(null);
  };

  const toggleComplete = (id) => {
    const existing = getStoredTasks();

    const updated = existing.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );

    saveTasksToStorage(updated); // 🔥 WRITE
    setTasks(updated); // 🔥 REFRESH
  };

  const renderCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 🔥 normalize today (important)

    const todayStr = today.toDateString();

    const days = [];

    // blank offsets
    for (let i = 0; i < offset; i++) {
      days.push(<div key={`blank-${i}`} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      dateObj.setHours(0, 0, 0, 0);

      const isToday = todayStr === dateObj.toDateString();
      const isPast = dateObj < today; // 🔥 disable logic

      days.push(
        <div
          key={d}
          className={`text-[11px] p-1.5 rounded-full text-center transition-colors
          ${
            isPast
              ? "text-neutral-600 cursor-not-allowed opacity-40"
              : "cursor-pointer hover:bg-cyan-400 hover:text-black text-white"
          }
          ${isToday ? "bg-red-500 text-white" : ""}
        `}
          onClick={() => {
            if (isPast) return; // 🔥 block selection

            const selectedDate = new Date(year, month, d);
            setDueDate(selectedDate);
            setActivePopup(null);
          }}
        >
          {d}
        </div>,
      );
    }

    return days;
  };

  const handleEditTask = (task) => {
    setTaskInput(task.task);
    setDescInput(task.description || "");
    setDueDate(task.dueDate || null);
    setPriority(task.priority || null);
    setProject(task.project || null);

    setEditingTaskId(task.id); // ⭐ remember which task is editing
    setIsAdding(true);
  };

  const handleDeleteTask = (id) => {
    const existing = getStoredTasks();

    const updated = existing.filter((t) => t.id !== id);

    saveTasksToStorage(updated); // 🔥 WRITE
    setTasks(updated); // 🔥 REFRESH UI
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans antialiased">
      <div className="flex h-screen overflow-hidden">
        {/* ===== SIDEBAR ===== */}
        <aside className="w-[270px] bg-[#0a0a0a] p-6 border-r border-[#1a1a1a] flex flex-col gap-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="bg-cyan-400 text-black w-8 h-8 rounded-lg flex items-center justify-center font-black">
              <Check size={18} strokeWidth={3} />
            </div>
            <span className="text-lg font-bold tracking-tight">PlanStack</span>
          </div>

          <button
            className="bg-cyan-400 text-black py-3 px-4 rounded-lg text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-cyan-500 transition-all w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={18} strokeWidth={2.5} /> Add Task
          </button>

          <nav className="flex flex-col gap-1">
            <NavItem
              active={activeFilter === "all"}
              icon={<Clock size={18} />}
              label="All"
              onClick={() => setActiveFilter("all")}
            />

            <NavItem
              active={activeFilter === "today"}
              icon={<Calendar size={18} />}
              label="Today"
              badge={
                tasks.filter(
                  (t) =>
                    !t.completed && isSameCalendarDay(t.dueDate, new Date()),
                ).length
              }
              onClick={() => setActiveFilter("today")}
            />

            <NavItem
              active={activeFilter === "upcoming"}
              icon={<Clock size={18} />}
              label="Upcoming"
              onClick={() => setActiveFilter("upcoming")}
            />

            <NavItem
              active={activeFilter === "completed"}
              icon={<CheckCircle2 size={18} />}
              label="Completed"
              onClick={() => setActiveFilter("completed")}
            />

            <NavItem
              active={activeFilter === "incomplete"}
              icon={<AlertCircle size={18} />}
              label="Incomplete"
              onClick={() => setActiveFilter("incomplete")}
            />
          </nav>

          <div className="mt-4">
            <h4 className="text-[11px] font-bold text-[#525252] tracking-wider mb-3 px-3 uppercase">
              Projects
            </h4>
            <ProjectItem
              active={activeFilter === "work"}
              icon={<Folder size={16} />}
              label="Work"
              count={tasks?.filter((t) => t.project === "work").length}
              onClick={() => setActiveFilter("work")}
            />

            <ProjectItem
              active={activeFilter === "personal"}
              icon={<Folder size={16} />}
              label="Personal"
              count={tasks?.filter((t) => t.project === "personal").length}
              onClick={() => setActiveFilter("personal")}
            />
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 p-8 md:px-12 overflow-y-auto bg-black">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Today</h1>
              <p className="flex items-center gap-1.5 text-[#737373] text-sm font-medium mt-2">
                <Target size={14} className="text-cyan-400" />
                {todayTasks} tasks today · {completedToday} completed
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 border border-cyan-400 bg-cyan-400 text-black py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-cyan-500 transition-all"
                onClick={() => setIsAdding(true)}
              >
                <Plus size={20} /> Add task
              </button>
              <button
                className="flex items-center gap-2 bg-transparent border border-cyan-400 text-cyan-400 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-cyan-400/10 transition-all"
                onClick={() => setIsDisplayPanelOpen(!isDisplayPanelOpen)}
              >
                <List size={18} /> Display
              </button>
            </div>
          </div>

          <div
            className={`flex flex-col ${viewMode === "board" ? "gap-3 mt-4" : "gap-0"}`}
          >
            {/*  TASK EXAMPLE */}
            {filteredTasks.length === 0 ? (
              <div className="py-2 text-sm text-[#737373]">
                {getEmptyMessage()}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-5 rounded-xl transition-all cursor-pointer group ${
                    viewMode === "board"
                      ? "bg-[#0f0f0f] border border-[#1f1f1f] shadow-lg hover:-translate-y-0.5"
                      : "border-b border-[#1a1a1a] hover:bg-white/5"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      task.completed
                        ? "bg-cyan-400 border-cyan-400"
                        : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {task.completed && (
                      <Check size={14} className="text-black stroke-[3px]" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div
                      className={`text-[15px] font-medium leading-relaxed ${
                        task.completed ? "line-through text-neutral-500" : ""
                      }`}
                    >
                      {task.task}
                    </div>

                    <div className="flex items-center gap-4 text-[13px] text-[#737373]">
                      {task.dueDate && (
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <Clock size={14} /> {formatDueDate(task.dueDate)}
                        </span>
                      )}

                      {task.priority && (
                        <span className="flex items-center gap-1.5">
                          🚩 P{task.priority}
                        </span>
                      )}

                      {task.project && (
                        <span className="flex items-center gap-1.5">
                          <Folder size={14} /> {task.project}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1.5 rounded-md bg-green-400/10 text-green-300 hover:bg-green-400/20 transition"
                      title="Edit task"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* QUICK ADD SECTION */}
            <div className="mt-4 relative">
              {isAdding && (
                <>
                  {" "}
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]" />
                  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#181818] border border-[#262626] rounded-xl p-4 max-w-[500px] w-[92%] shadow-2xl z-[999]">
                    <div className="flex justify-between text-[12px] font-bold text-[#a3a3a3] mb-3">
                      <span>Quick Add Task</span>
                      <button
                        className="hover:text-white"
                        onClick={() => setIsAdding(false)}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <input
                        className="w-full bg-[#242424] border border-[#333] rounded-lg p-2 text-sm text-white focus:border-cyan-400 outline-none"
                        type="text"
                        placeholder="What needs to be done?"
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        autoFocus
                      />
                      <input
                        className="w-full bg-[#242424] border border-[#333] rounded-lg p-2 text-[12px] text-[#a3a3a3] focus:border-cyan-400 outline-none"
                        type="text"
                        placeholder="Description (optional)"
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2 mt-2">
                      {dueDate && (
                        <div className="bg-orange-500/10 text-orange-200 border border-orange-500/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                          <Calendar size={10} /> {formatDueDate(dueDate)}
                        </div>
                      )}
                      {priority && (
                        <div className="bg-cyan-400/10 text-cyan-200 border border-cyan-400/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                          <Flag size={10} /> P{priority}
                        </div>
                      )}
                      {project && (
                        <div className="bg-purple-500/10 text-purple-200 border border-purple-500/20 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                          <Folder size={10} /> {project}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-4 relative">
                      <div className="flex gap-2">
                        <ActionBtn
                          icon={<Calendar size={14} />}
                          label="Due date"
                          onClick={() =>
                            setActivePopup(
                              activePopup === "calendar" ? null : "calendar",
                            )
                          }
                        />
                        <ActionBtn
                          icon={<Flag size={14} />}
                          label="Priority"
                          onClick={() =>
                            setActivePopup(
                              activePopup === "priority" ? null : "priority",
                            )
                          }
                        />
                        <ActionBtn
                          icon={<Folder size={14} />}
                          label="Project"
                          onClick={() =>
                            setActivePopup(
                              activePopup === "project" ? null : "project",
                            )
                          }
                        />
                      </div>

                      {/* CALENDAR POPUP */}
                      {activePopup === "calendar" && (
                        <div className="absolute bottom-full mb-2 left-0 bg-[#181818] border border-[#333] rounded-xl p-3 w-[240px] z-50 shadow-2xl">
                          <div className="flex justify-between items-center mb-3 px-1 text-sm font-semibold">
                            <span>
                              {currentCalendarDate.toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setCurrentCalendarDate(
                                    new Date(
                                      currentCalendarDate.setMonth(
                                        currentCalendarDate.getMonth() - 1,
                                      ),
                                    ),
                                  )
                                }
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  setCurrentCalendarDate(
                                    new Date(
                                      currentCalendarDate.setMonth(
                                        currentCalendarDate.getMonth() + 1,
                                      ),
                                    ),
                                  )
                                }
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-neutral-500 mb-1">
                            <span>M</span>
                            <span>T</span>
                            <span>W</span>
                            <span>T</span>
                            <span>F</span>
                            <span>S</span>
                            <span>S</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {renderCalendarDays()}
                          </div>
                        </div>
                      )}

                      {/* PRIORITY POPUP */}
                      {activePopup === "priority" && (
                        <div className="absolute bottom-full mb-2 left-[85px] bg-[#181818] border border-[#333] rounded-xl w-[160px] z-50 shadow-2xl overflow-hidden">
                          {priorities.map((p) => (
                            <div
                              key={p.id}
                              className="p-2.5 text-xs text-[#a3a3a3] hover:bg-[#242424] hover:text-white cursor-pointer flex items-center justify-between"
                              onClick={() => {
                                setPriority(p.id);
                                setActivePopup(null);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Flag size={14} className={p.color} /> {p.label}
                              </div>
                              {priority === p.id && (
                                <Check size={14} className="text-red-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* PROJECT POPUP */}
                      {activePopup === "project" && (
                        <div className="absolute bottom-full mb-2 left-[160px] bg-[#181818] border border-[#333] rounded-xl w-[160px] z-50 shadow-2xl overflow-hidden">
                          {projects.map((p) => (
                            <div
                              key={p.id}
                              className="p-2.5 text-xs text-[#a3a3a3] hover:bg-[#242424] hover:text-white cursor-pointer flex items-center justify-between"
                              onClick={() => {
                                setProject(p.id);
                                setActivePopup(null);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                📁 {p.label}
                              </div>
                              {project === p.id && (
                                <Check size={14} className="text-red-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-5">
                      <button
                        className="text-[13px] text-[#a3a3a3] hover:text-white"
                        onClick={closeForm}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddTask}
                        className="bg-cyan-400 text-black px-4 py-2 rounded-lg text-[13px] font-bold"
                      >
                        Add task
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* ===== DISPLAY PANEL ===== */}
        <aside
          className={`bg-[#0f0f0f] border-l border-[#1a1a1a] transition-all duration-300 ease-in-out flex flex-col gap-6 overflow-hidden ${isDisplayPanelOpen ? "w-[280px] p-6" : "w-0 p-0"}`}
        >
          <div>
            <label className="block text-[12px] font-semibold text-[#525252] mb-3 uppercase tracking-wider">
              Layout
            </label>
            <div className="flex flex-col gap-2">
              <LayoutOpt
                active={viewMode === "list"}
                onClick={() => setViewMode("list")}
                icon={<List size={18} />}
                label="List"
              />
              <LayoutOpt
                active={viewMode === "board"}
                onClick={() => setViewMode("board")}
                icon={<LayoutDashboard size={18} />}
                label="Board"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#525252] mb-3 uppercase tracking-wider">
              Sort
            </label>
            <select className="w-full bg-[#1a1a1a] border border-[#262626] text-white p-2.5 rounded-lg text-sm outline-none">
              <option>Smart</option>
              <option>Due Date</option>
              <option>Priority</option>
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- Internal Tailwind Components ---
const NavItem = ({ active, icon, label, badge, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
      active
        ? "bg-[#1a1a1a] text-cyan-400"
        : "text-[#737373] hover:bg-[#1a1a1a] hover:text-white"
    }`}
  >
    {icon}
    <span className="flex-1">{label}</span>

    {badge && (
      <span className="bg-cyan-400 text-black text-[12px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
        {badge}
      </span>
    )}
  </div>
);

const ProjectItem = ({ active, icon, label, count, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center mb-1 gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${
      active
        ? "bg-[#1a1a1a] text-cyan-400"
        : "text-[#737373] hover:bg-[#1a1a1a] hover:text-white"
    }`}
  >
    {icon}
    <span className="flex-1">{label}</span>

    {count !== undefined && (
      <span className="text-[13px] text-[#525252]">{count}</span>
    )}
  </div>
);

const ActionBtn = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="bg-[#242424] border border-transparent text-[#a3a3a3] py-1.5 px-2.5 rounded-lg text-[11px] hover:text-white transition-colors flex items-center gap-1.5"
  >
    {icon} {label}
  </button>
);

const LayoutOpt = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-2.5 rounded-xl border transition-all text-sm font-medium ${active ? "border-cyan-400 text-white bg-cyan-400/5" : "border-transparent text-[#737373] hover:bg-[#1a1a1a]"}`}
  >
    {icon} {label}
  </button>
);
