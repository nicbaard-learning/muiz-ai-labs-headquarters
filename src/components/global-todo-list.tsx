"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HiCheckCircle, HiOutlineTrash } from "react-icons/hi";

interface TodoProject {
  id: string;
  slug: string;
  shortName: string;
  name: string;
  clientName: string;
}

interface Todo {
  id: string;
  text: string;
  done: boolean;
  order: number;
  project: TodoProject;
}

type FilterMode = "all" | "active" | "done";

const PROJECT_COLORS: Record<string, string> = {
  TPRM: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  GRC: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  SFR: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function GlobalTodoList({
  clientFilter,
}: {
  clientFilter: string | null;
}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>("active");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const router = useRouter();

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (e) {
      console.error("Failed to fetch todos", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function toggleTodo(todo: Todo, done: boolean) {
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, done } : t))
    );
    try {
      await fetch(`/api/projects/${todo.project.id}/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
    } catch (e) {
      console.error("Failed to toggle todo", e);
    }
  }

  async function deleteTodo(todo: Todo) {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    try {
      await fetch(`/api/projects/${todo.project.id}/todos/${todo.id}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to delete todo", e);
    }
  }

  // Get unique projects for filter
  const uniqueProjects = [...new Map(todos.map((t) => [t.project.shortName, t.project])).values()];

  // Apply filters
  const filteredTodos = todos.filter((t) => {
    if (filter === "active" && t.done) return false;
    if (filter === "done" && !t.done) return false;
    if (projectFilter !== "all" && t.project.shortName !== projectFilter) return false;
    if (clientFilter && t.project.clientName !== clientFilter) return false;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;

  // Group by project
  const grouped = filteredTodos.reduce<Record<string, Todo[]>>((acc, todo) => {
    const key = todo.project.shortName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(todo);
    return acc;
  }, {});

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(48,208,184,0.5)]" />
            Tasks
          </h2>
          <span className="text-xs font-mono text-muiz-400 ml-1">
            {activeCount} left
            {doneCount > 0 && ` · ${doneCount} done`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["all", "active", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider transition-colors ${
                  filter === f
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-muiz-400 hover:text-muiz-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {uniqueProjects.length > 1 && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muiz-300 text-[10px] font-medium uppercase tracking-wider focus:outline-none"
            >
              <option value="all">All</option>
              {uniqueProjects.map((p) => (
                <option key={p.shortName} value={p.shortName}>
                  {p.shortName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg shimmer" />
          ))}
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="text-center py-8">
          <HiCheckCircle className="w-10 h-10 text-muiz-500 mx-auto mb-2" />
          <p className="text-sm text-muiz-400">
            {todos.length === 0
              ? "No tasks yet."
              : filter === "active"
                ? "All done! 🎉"
                : filter === "done"
                  ? "No completed tasks."
                  : "No tasks match filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] lg:max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
          {Object.entries(grouped).map(([projectName, projectTodos]) => (
            <div key={projectName}>
              <button
                onClick={() => router.push(`/projects/${projectTodos[0].project.slug}`)}
                className="flex items-center gap-2 mb-1.5 px-1 group"
              >
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${
                    PROJECT_COLORS[projectName] || "text-muiz-300 bg-white/5 border-white/10"
                  }`}
                >
                  {projectName}
                </span>
                <span className="text-[10px] text-muiz-500 group-hover:text-muiz-400 transition-colors">
                  {projectTodos.filter((t) => !t.done).length} left
                </span>
              </button>

              <div className="space-y-1">
                {projectTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      todo.done
                        ? "bg-white/[0.02]"
                        : "bg-white/[0.03] hover:bg-white/[0.05]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={(e) => toggleTodo(todo, e.target.checked)}
                    />
                    <span
                      className={`flex-1 text-sm transition-all duration-200 ${
                        todo.done
                          ? "text-muiz-500 line-through"
                          : "text-gray-200"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo)}
                      className="p-1 rounded text-muiz-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Delete task"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
