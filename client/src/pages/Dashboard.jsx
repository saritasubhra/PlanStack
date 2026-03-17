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

/* ── demo data (unchanged) ── */
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
    dueDate: new Date(),
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
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      tasks.map((t) => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
      })),
    ),
  );
};

/* ── priority metadata (unchanged) ── */
const PM = {
  1: {
    label: "Urgent",
    dot: "#b5451b",
    chip: "rgba(181,69,27,0.1)",
    text: "#b5451b",
  },
  2: {
    label: "High",
    dot: "#a07c1e",
    chip: "rgba(160,124,30,0.1)",
    text: "#a07c1e",
  },
  3: {
    label: "Medium",
    dot: "#2e6b8a",
    chip: "rgba(46,107,138,0.1)",
    text: "#2e6b8a",
  },
  4: {
    label: "Low",
    dot: "#8a9a8e",
    chip: "rgba(138,154,142,0.1)",
    text: "#8a9a8e",
  },
};

const initialState = {
  task: "",
  description: "",
  dueDate: null,
  priority: null,
  project: null,
};

export default function Dashboard() {
  /* ── helpers (unchanged) ── */
  const isSameCalendarDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const a = new Date(d1),
      b = new Date(d2);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };
  const formatDueDate = (date) => {
    if (!date) return "";
    if (isSameCalendarDay(date, new Date())) return "Today";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  /* ── state (unchanged) ── */
  const [isDisplayPanelOpen, setIsDisplayPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tasks, setTasks] = useState(getStoredTasks);
  const [activePopup, setActivePopup] = useState(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("all");

  const [formData, setFormData] = useState(initialState);

  function handleFormData(e) {
    setFormData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  }

  const priorities = [
    { id: 1, label: "Priority 1" },
    { id: 2, label: "Priority 2" },
    { id: 3, label: "Priority 3" },
    { id: 4, label: "Priority 4" },
  ];

  /* ── derived (unchanged) ── */
  const filteredTasks = tasks?.filter((task) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (activeFilter === "all") return task;
    if (activeFilter === "completed") return task.completed;
    if (activeFilter === "incomplete") return !task.completed;
    if (activeFilter === "today")
      return !task.completed && isSameCalendarDay(task.dueDate, now);
    if (activeFilter === "upcoming") {
      if (!task.completed && task.dueDate) {
        const d = new Date(task.dueDate);
        d.setHours(0, 0, 0, 0);
        return d > now;
      }
      return false;
    }
    if (activeFilter === "work") return task.project === "work";
    if (activeFilter === "personal") return task.project === "personal";
    return true;
  });

  const todayTasks = tasks?.filter(
    (t) => isSameCalendarDay(t.dueDate, new Date()) && !t.completed,
  ).length;
  const completedToday = tasks?.filter(
    (t) => isSameCalendarDay(t.dueDate, new Date()) && t.completed,
  ).length;

  const getEmptyMessage = () =>
    ({
      today: "Nothing scheduled for today",
      upcoming: "No upcoming tasks",
      completed: "No completed tasks",
    })[activeFilter] ?? "No tasks found";

  const closeForm = () => {
    setIsAdding(false);
    setFormData(initialState);
    setActivePopup(null);
  };

  const resetForm = () => {
    setFormData(initialState);
    setIsAdding(false);
    setActivePopup(null);
  };

  const handleAddTask = () => {
    const existing = getStoredTasks();

    const updated = editingTaskId
      ? existing.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                task: formData.task,
                description: formData.description,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
                priority: formData.priority || 4,
                project: formData.project,
              }
            : t,
        )
      : [
          ...existing,
          {
            id: Date.now(),
            task: formData.task,
            description: formData.description,
            dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
            priority: formData.priority || 4,
            project: formData.project,
            completed: false,
          },
        ];

    saveTasksToStorage(updated);
    setTasks(updated);
    setEditingTaskId(null);
    setFormData(initialState);
    setIsAdding(false);
    setActivePopup(null);
  };

  const toggleComplete = (id) => {
    const existing = getStoredTasks();
    const updated = existing.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    saveTasksToStorage(updated);
    setTasks(updated);
  };

  const renderCalendarDays = () => {
    const year = currentCalendarDate.getFullYear(),
      month = currentCalendarDate.getMonth();
    const offset = (() => {
      const f = new Date(year, month, 1).getDay();
      return f === 0 ? 6 : f - 1;
    })();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toDateString();
    const days = [];
    for (let i = 0; i < offset; i++) days.push(<div key={`b-${i}`} />);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      dateObj.setHours(0, 0, 0, 0);
      const isToday = todayStr === dateObj.toDateString();
      const isPast = dateObj < today;
      days.push(
        <div
          key={d}
          onClick={() => {
            if (isPast) return;
            setFormData((prev) => ({
              ...prev,
              dueDate: new Date(year, month, d),
            }));
            setActivePopup(null);
          }}
          className={[
            "text-[11px] py-1.5 px-1 rounded-full text-center transition-colors select-none",
            isPast
              ? "opacity-30 cursor-not-allowed text-[#999]"
              : "cursor-pointer",
            isToday ? "bg-[#2d5a3d] text-white! font-semibold" : "",
            !isPast && !isToday ? "text-[#2c3a2f] hover:bg-[#2d5a3d]/10" : "",
          ].join(" ")}
        >
          {d}
        </div>,
      );
    }
    return days;
  };

  const handleEditTask = (task) => {
    setFormData({
      task: task.task,
      description: task.description || "",
      dueDate: task.dueDate || null,
      priority: task.priority || null,
      project: task.project || null,
    });

    setEditingTaskId(task.id);
    setIsAdding(true);
  };
  const handleDeleteTask = (id) => {
    const existing = getStoredTasks(),
      updated = existing.filter((t) => t.id !== id);
    saveTasksToStorage(updated);
    setTasks(updated);
  };

  const filterLabel =
    {
      all: "All Tasks",
      today: "Today",
      upcoming: "Upcoming",
      completed: "Completed",
      incomplete: "Incomplete",
      work: "Work",
      personal: "Personal",
    }[activeFilter] ?? "Tasks";

  return (
    <>
      {/* minimal <style> — only font import + pseudo-selectors Tailwind can't express */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        .font-serif-ps { font-family: 'Instrument Serif', serif; }
        .font-sans-ps  { font-family: 'DM Sans', sans-serif; }
        .ps-scroll::-webkit-scrollbar       { width: 3px; }
        .ps-scroll::-webkit-scrollbar-thumb { background: #cfd8d1; border-radius: 99px; }
        .ps-input::placeholder { color: #8a9a8e; }
        .ps-input:focus        { border-color: #2d5a3d; box-shadow: 0 0 0 3px rgba(45,90,61,0.1); }
      `}</style>

      <div className="font-sans-ps bg-[#f3f5f2] text-[#1c2b20] min-h-screen">
        <div className="flex h-screen overflow-hidden">
          {/* ═══ SIDEBAR ═══ */}
          <aside className="w-63 shrink-0 flex flex-col bg-[#e8ede9] border-r border-[#2d5a3d]/10 px-3.5 py-5 overflow-y-auto ps-scroll">
            {/* logo */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center bg-[#2d5a3d] text-white shrink-0">
                <Check size={15} strokeWidth={3} />
              </div>
              <span className="font-serif-ps text-[22px] text-[#1c2b20] tracking-[0.01em]">
                PlanStack
              </span>
            </div>

            {/* add button */}
            <button
              className={`addBtn w-full mb-4.5`}
              onClick={() => setIsAdding(true)}
            >
              <Plus size={15} strokeWidth={2.5} /> Add Task
            </button>

            {/* nav items */}
            <div className="flex flex-col gap-0.5">
              {[
                { id: "all", icon: <Clock size={14} />, label: "All Tasks" },
                {
                  id: "today",
                  icon: <Calendar size={14} />,
                  label: "Today",
                  badge: tasks.filter(
                    (t) =>
                      !t.completed && isSameCalendarDay(t.dueDate, new Date()),
                  ).length,
                },
                {
                  id: "upcoming",
                  icon: <Clock size={14} />,
                  label: "Upcoming",
                },
                {
                  id: "completed",
                  icon: <CheckCircle2 size={14} />,
                  label: "Completed",
                },
                {
                  id: "incomplete",
                  icon: <AlertCircle size={14} />,
                  label: "Incomplete",
                },
              ].map(({ id, icon, label, badge }) => {
                const on = activeFilter === id;
                return (
                  <div
                    key={id}
                    onClick={() => setActiveFilter(id)}
                    className={`navBase ${on ? "bg-[#2d5a3d] text-white" : "text-[#4a5e4f] hover:bg-[#dde4de] hover:text-[#1c2b20]"}`}
                  >
                    <span className={on ? "text-white" : "text-[#8a9a8e]"}>
                      {icon}
                    </span>
                    <span className="flex-1">{label}</span>
                    {badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.75 py-px rounded-full text-white ${on ? "bg-white/25" : "bg-[#2d5a3d]"}`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* divider */}
            <div className="h-px bg-[#2d5a3d]/10 my-3.5" />

            {/* projects */}
            <p className="secLabel">Projects</p>
            {[
              { id: "work", label: "Work" },
              { id: "personal", label: "Personal" },
            ].map(({ id, label }) => {
              const on = activeFilter === id;
              return (
                <div
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`navBase ${on ? "bg-[#2d5a3d] text-white" : "text-[#4a5e4f] hover:bg-[#dde4de] hover:text-[#1c2b20]"}`}
                >
                  <span className={on ? "text-white" : "text-[#8a9a8e]"}>
                    <Folder size={14} />
                  </span>
                  <span className="flex-1">{label}</span>
                  <span
                    className={`text-[11px] ${on ? "text-white/60" : "text-[#8a9a8e]"}`}
                  >
                    {tasks.filter((t) => t.project === id).length}
                  </span>
                </div>
              );
            })}
          </aside>

          {/* ═══ MAIN ═══ */}
          <main className="flex-1 bg-[#f3f5f2] overflow-y-auto px-10 py-8 ps-scroll">
            {/* header */}
            <div className="flex justify-between items-start mb-7">
              <div>
                <h1 className="font-serif-ps text-[32px] text-[#1c2b20] leading-[1.1] m-0">
                  {filterLabel}
                </h1>
                <p className="flex items-center gap-1.5 text-[#8a9a8e] text-[13px] mt-1.5 mb-0">
                  <Target size={13} className="text-[#2d5a3d]" />
                  {todayTasks} tasks today · {completedToday} completed
                </p>
              </div>
              <div className="flex gap-2">
                <button className="addBtn" onClick={() => setIsAdding(true)}>
                  <Plus size={15} /> Add task
                </button>
                <button
                  className="flex items-center gap-1.5 px-4 py-2.25 rounded-lg text-[13px] font-medium bg-transparent text-[#4a5e4f] border border-[#2d5a3d]/10 cursor-pointer transition-all hover:bg-[#dde4de] hover:text-[#1c2b20]"
                  onClick={() => setIsDisplayPanelOpen(!isDisplayPanelOpen)}
                >
                  <List size={15} /> Display
                </button>
              </div>
            </div>

            {/* task list */}
            <div
              className={`flex flex-col ${viewMode === "board" ? "gap-3" : "gap-0"}`}
            >
              {filteredTasks.length === 0 ? (
                <div className="py-10 text-center text-[#8a9a8e] text-[14px]">
                  <div className="text-2xl mb-2 text-[#cfd8d1]">◈</div>
                  {getEmptyMessage()}
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const pm = PM[task.priority] ?? PM[4];
                  return (
                    <div
                      key={task.id}
                      className={
                        viewMode === "board"
                          ? "bg-white border border-[#2d5a3d]/10 rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(28,43,32,0.08)]"
                          : "flex items-start gap-3 px-2 py-3.5 border-b border-[#2d5a3d]/10 last:border-b-0 rounded-md transition-colors hover:bg-[#2d5a3d]/4"
                      }
                    >
                      <div className="flex items-start gap-3 w-full">
                        {/* checkbox */}
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className={`w-4.5 h-4.5 rounded-full border-[1.5px] shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-all ${
                            task.completed
                              ? "bg-[#2d5a3d] border-[#2d5a3d]"
                              : "border-[#8a9a8e] bg-transparent"
                          }`}
                        >
                          {task.completed && (
                            <Check size={11} color="#fff" strokeWidth={3} />
                          )}
                        </button>

                        {/* content */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-[14px] font-medium leading-[1.4] ${task.completed ? "line-through text-[#8a9a8e]" : "text-[#1c2b20]"}`}
                          >
                            {task.task}
                          </div>
                          {task.description && (
                            <div className="text-[12px] text-[#8a9a8e] mt-0.5">
                              {task.description}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {task.dueDate && (
                              <span
                                className="chipCls"
                                style={{
                                  background: "rgba(45,90,61,0.08)",
                                  color: "#2d5a3d",
                                }}
                              >
                                <Clock size={10} />{" "}
                                {formatDueDate(task.dueDate)}
                              </span>
                            )}
                            {task.priority && (
                              <span
                                className="chipCls"
                                style={{ background: pm.chip, color: pm.text }}
                              >
                                <span
                                  className="w-1.75 h-1.75 rounded-full shrink-0 inline-block"
                                  style={{ background: pm.dot }}
                                />
                                {pm.label}
                              </span>
                            )}
                            {task.project && (
                              <span
                                className="chipCls"
                                style={{
                                  background: "rgba(28,43,32,0.06)",
                                  color: "#4a5e4f",
                                }}
                              >
                                <Folder size={10} /> {task.project}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* actions */}
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1.25 rounded-md border border-[#2d5a3d]/10 bg-transparent cursor-pointer text-[#8a9a8e] transition-all hover:bg-[#dde4de] hover:text-[#1c2b20]"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.25 rounded-md border border-[#b5451b]/15 bg-transparent cursor-pointer text-[#b5451b] opacity-45 transition-opacity hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* ── MODAL ── */}
              <div className="relative mt-4">
                {isAdding && (
                  <>
                    {/* overlay */}
                    <div
                      className="fixed inset-0 bg-[#1c2b20]/40 backdrop-blur-sm z-998"
                      onClick={() => setIsAdding(false)}
                    />
                    {/* modal panel */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f3f5f2] border border-[#2d5a3d]/10 rounded-2xl p-6 max-w-120 w-[92%] shadow-[0_20px_60px_rgba(28,43,32,0.15)] z-999">
                      {/* header */}
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-serif-ps text-[17px] text-[#1c2b20] m-0">
                          {editingTaskId ? "Edit Task" : "New Task"}
                        </h3>
                        <button
                          onClick={() => setIsAdding(false)}
                          className="bg-transparent border-none cursor-pointer text-[#8a9a8e] p-1 hover:text-[#1c2b20] transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* inputs */}
                      <div className="flex flex-col gap-2.5">
                        <input
                          className="inputCls"
                          type="text"
                          placeholder="What needs to be done?"
                          name="task"
                          value={formData.task}
                          onChange={handleFormData}
                          autoFocus
                        />
                        <input
                          className={`inputCls text-[12px]!`}
                          type="text"
                          placeholder="Description (optional)"
                          name="description"
                          value={formData.description}
                          onChange={handleFormData}
                        />
                      </div>

                      {/* selected tags */}
                      {(formData.dueDate ||
                        formData.priority ||
                        formData.project) && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {formData.dueDate && (
                            <span
                              className="chipCls"
                              style={{
                                background: "rgba(45,90,61,0.1)",
                                color: "#2d5a3d",
                              }}
                            >
                              <Calendar size={10} />{" "}
                              {formatDueDate(formData.dueDate)}
                            </span>
                          )}
                          {formData.priority && (
                            <span
                              className="chipCls"
                              style={{
                                background: PM[formData.priority].chip,
                                color: PM[formData.priority].text,
                              }}
                            >
                              <Flag size={10} /> P{formData.priority}
                            </span>
                          )}
                          {formData.project && (
                            <span
                              className="chipCls"
                              style={{
                                background: "rgba(28,43,32,0.06)",
                                color: "#4a5e4f",
                              }}
                            >
                              <Folder size={10} /> {formData.project}
                            </span>
                          )}
                        </div>
                      )}

                      {/* action bar + popups */}
                      <div className="relative mt-3.5">
                        <div className="flex gap-1.5">
                          <button
                            className="actionChip"
                            onClick={() =>
                              setActivePopup(
                                activePopup === "calendar" ? null : "calendar",
                              )
                            }
                          >
                            <Calendar size={12} /> Due date
                          </button>
                          <button
                            className="actionChip"
                            onClick={() =>
                              setActivePopup(
                                activePopup === "priority" ? null : "priority",
                              )
                            }
                          >
                            <Flag size={12} /> Priority
                          </button>
                          <button
                            className="actionChip"
                            onClick={() =>
                              setActivePopup(
                                activePopup === "project" ? null : "project",
                              )
                            }
                          >
                            <Folder size={12} /> Project
                          </button>
                        </div>

                        {/* calendar popup */}
                        {activePopup === "calendar" && (
                          <div className={`popupCls left-0 w-60`}>
                            <div className="flex justify-between items-center mb-2.5">
                              <span className="text-[12px] font-semibold text-[#1c2b20]">
                                {currentCalendarDate.toLocaleString("default", {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                              <div className="flex gap-1.5">
                                {[
                                  [<ChevronLeft size={13} />, -1],
                                  [<ChevronRight size={13} />, 1],
                                ].map(([icon, dir], i) => (
                                  <button
                                    key={i}
                                    onClick={() =>
                                      setCurrentCalendarDate(
                                        new Date(
                                          currentCalendarDate.setMonth(
                                            currentCalendarDate.getMonth() +
                                              dir,
                                          ),
                                        ),
                                      )
                                    }
                                    className="bg-transparent border-none cursor-pointer text-[#4a5e4f] p-0.5 hover:text-[#1c2b20] transition-colors"
                                  >
                                    {icon}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 mb-1">
                              {["M", "T", "W", "T", "F", "S", "S"].map(
                                (d, i) => (
                                  <div
                                    key={i}
                                    className="text-[10px] text-center text-[#8a9a8e] font-semibold"
                                  >
                                    {d}
                                  </div>
                                ),
                              )}
                            </div>
                            <div className="grid grid-cols-7 gap-0.5">
                              {renderCalendarDays()}
                            </div>
                          </div>
                        )}

                        {/* priority popup */}
                        {activePopup === "priority" && (
                          <div className={`popupCls left-25 w-40`}>
                            {priorities.map((p) => (
                              <div
                                key={p.id}
                                className="popupRow"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    priority: p.id,
                                  }));
                                  setActivePopup(null);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-1.75 h-1.75 rounded-full shrink-0 inline-block"
                                    style={{ background: PM[p.id].dot }}
                                  />
                                  {p.label}
                                </div>
                                {formData.priority === p.id && (
                                  <Check size={12} className="text-[#2d5a3d]" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* project popup */}
                        {activePopup === "project" && (
                          <div className={`popupCls left-50 w-37.5`}>
                            {projects.map((p) => (
                              <div
                                key={p.id}
                                className="popupRow"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    project: p.id,
                                  }));
                                  setActivePopup(null);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Folder size={12} /> {p.label}
                                </div>
                                {formData.project === p.id && (
                                  <Check size={12} className="text-[#2d5a3d]" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* footer */}
                      <div className="flex justify-end gap-2.5 mt-5">
                        <button
                          onClick={closeForm}
                          className="bg-transparent border-none cursor-pointer text-[13px] text-[#8a9a8e] hover:text-[#1c2b20] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          className={`addBtn px-5! py-2!`}
                          onClick={handleAddTask}
                        >
                          {editingTaskId ? "Save Changes" : "Add Task"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>

          {/* ═══ DISPLAY PANEL ═══ */}
          <aside
            className={`bg-[#e8ede9] border-l border-[#2d5a3d]/10 shrink-0 flex flex-col gap-5 overflow-hidden transition-all duration-300 ${isDisplayPanelOpen ? "w-[256px] px-4 py-6" : "w-0 p-0"}`}
          >
            {isDisplayPanelOpen && (
              <>
                <div>
                  <p className="secLabel">Layout</p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { mode: "list", icon: <List size={14} />, label: "List" },
                      {
                        mode: "board",
                        icon: <LayoutDashboard size={14} />,
                        label: "Board",
                      },
                    ].map(({ mode, icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] font-medium border cursor-pointer transition-all ${
                          viewMode === mode
                            ? "border-[#2d5a3d] text-[#2d5a3d] bg-[#2d5a3d]/5"
                            : "border-[#2d5a3d]/10 text-[#4a5e4f] bg-transparent hover:bg-[#dde4de]"
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="secLabel">Sort</p>
                  <select className="w-full px-3 py-2 rounded-lg text-[13px] bg-[#dde4de] border border-[#2d5a3d]/10 text-[#1c2b20] outline-none font-sans-ps">
                    <option>Smart</option>
                    <option>Due Date</option>
                    <option>Priority</option>
                  </select>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
