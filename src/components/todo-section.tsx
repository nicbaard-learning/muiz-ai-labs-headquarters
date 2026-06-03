"use client";

import { useState } from "react";
import { HiPlus, HiOutlineTrash } from "react-icons/hi";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  order: number;
}

export default function TodoSection({
  projectId,
  initialTodos,
}: {
  projectId: string;
  initialTodos: Todo[];
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  async function addTodo() {
    if (!newText.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newText.trim(),
          order: todos.length,
        }),
      });
      if (res.ok) {
        const todo = await res.json();
        setTodos((prev) => [...prev, todo]);
        setNewText("");
      }
    } catch (e) {
      console.error("Failed to add todo", e);
    } finally {
      setAdding(false);
    }
  }

  async function toggleTodo(todoId: string, done: boolean) {
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, done } : t))
    );
    try {
      await fetch(`/api/projects/${projectId}/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
    } catch (e) {
      console.error("Failed to toggle todo", e);
    }
  }

  async function deleteTodo(todoId: string) {
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
    try {
      await fetch(`/api/projects/${projectId}/todos/${todoId}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to delete todo", e);
    }
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="cyber-dot" />
          To-Do&apos;s
          <span className="text-xs font-mono text-muiz-400 ml-1">
            {activeCount}/{todos.length}
          </span>
        </h3>
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
      </div>

      {/* Add new todo */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-muiz-500 focus:outline-none focus:border-accent/50 transition-colors"
        />
        <button
          onClick={addTodo}
          disabled={adding || !newText.trim()}
          className="px-3 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-40 transition-all duration-200"
        >
          <HiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Todo list */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {filteredTodos.length === 0 && (
          <p className="text-sm text-muiz-500 text-center py-6">
            {filter === "all"
              ? "No tasks yet. Add one above."
              : filter === "active"
                ? "All done! 🎉"
                : "No completed tasks."}
          </p>
        )}
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              todo.done ? "bg-white/[0.02]" : "bg-white/[0.04] hover:bg-white/[0.06]"
            }`}
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={(e) => toggleTodo(todo.id, e.target.checked)}
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
              onClick={() => deleteTodo(todo.id)}
              className="p-1 rounded text-muiz-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <HiOutlineTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
