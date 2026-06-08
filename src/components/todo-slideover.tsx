"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineX,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi";

interface SubTask {
  id: string;
  text: string;
  done: boolean;
}

interface Todo {
  id: string;
  text: string;
  done: boolean;
  order: number;
  subtasks: string;
}

interface TodoSlideoverProps {
  todo: Todo | null;
  projectId: string;
  onClose: () => void;
  onUpdate: (updated: Todo) => void;
  /** All todos mode: shows all todos with expandable subtasks */
  allTodos?: Todo[];
  allTodosMode?: boolean;
  onTodosChange?: (todos: Todo[]) => void;
}

export default function TodoSlideover({
  todo,
  projectId,
  onClose,
  onUpdate,
  allTodos,
  allTodosMode,
  onTodosChange,
}: TodoSlideoverProps) {
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubText, setNewSubText] = useState("");
  const [adding, setAdding] = useState(false);
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null);

  const isOpen = !!(todo || allTodosMode);

  useEffect(() => {
    if (todo) {
      try {
        const parsed = JSON.parse(todo.subtasks || "[]");
        setSubtasks(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSubtasks([]);
      }
    }
  }, [todo]);

  // ─── Single todo mode: subtask management ──────────────────────

  async function saveSubtasks(updatedSubtasks: SubTask[]) {
    if (!todo) return;
    setSubtasks(updatedSubtasks);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/todos/${todo.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtasks: updatedSubtasks }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      }
    } catch (e) {
      console.error("Failed to update subtasks:", e);
    }
  }

  function addSubtask() {
    if (!newSubText.trim() || !todo) return;
    setAdding(true);
    const newSub: SubTask = {
      id: crypto.randomUUID(),
      text: newSubText.trim(),
      done: false,
    };
    const updated = [...subtasks, newSub];
    saveSubtasks(updated).then(() => {
      setNewSubText("");
      setAdding(false);
    });
  }

  function toggleSubtask(subId: string, done: boolean) {
    const updated = subtasks.map((s) =>
      s.id === subId ? { ...s, done } : s
    );
    saveSubtasks(updated);
  }

  function deleteSubtask(subId: string) {
    const updated = subtasks.filter((s) => s.id !== subId);
    saveSubtasks(updated);
  }

  const allDone = subtasks.length > 0 && subtasks.every((s) => s.done);
  const doneCount = subtasks.filter((s) => s.done).length;

  // ─── All todos mode: manage subtasks for any todo ──────────────

  function getSubtasksFromTodo(t: Todo): SubTask[] {
    try {
      const parsed = JSON.parse(t.subtasks || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async function toggleSubtaskForTodo(
    t: Todo,
    subId: string,
    done: boolean
  ) {
    const subs = getSubtasksFromTodo(t);
    const updated = subs.map((s) =>
      s.id === subId ? { ...s, done } : s
    );

    try {
      const res = await fetch(
        `/api/projects/${projectId}/todos/${t.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtasks: updated }),
        }
      );
      if (res.ok) {
        const serverTodo = await res.json();
        if (onTodosChange && allTodos) {
          const newTodos = allTodos.map((at) =>
            at.id === t.id ? serverTodo : at
          );
          onTodosChange(newTodos);
        }
      }
    } catch (e) {
      console.error("Failed to update subtask:", e);
    }
  }

  async function deleteSubtaskForTodo(t: Todo, subId: string) {
    const subs = getSubtasksFromTodo(t);
    const updated = subs.filter((s) => s.id !== subId);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/todos/${t.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtasks: updated }),
        }
      );
      if (res.ok) {
        const serverTodo = await res.json();
        if (onTodosChange && allTodos) {
          const newTodos = allTodos.map((at) =>
            at.id === t.id ? serverTodo : at
          );
          onTodosChange(newTodos);
        }
      }
    } catch (e) {
      console.error("Failed to delete subtask:", e);
    }
  }

  async function addSubtaskForTodo(t: Todo, text: string) {
    const subs = getSubtasksFromTodo(t);
    const newSub: SubTask = {
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
    };
    const updated = [...subs, newSub];

    try {
      const res = await fetch(
        `/api/projects/${projectId}/todos/${t.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtasks: updated }),
        }
      );
      if (res.ok) {
        const serverTodo = await res.json();
        if (onTodosChange && allTodos) {
          const newTodos = allTodos.map((at) =>
            at.id === t.id ? serverTodo : at
          );
          onTodosChange(newTodos);
        }
      }
    } catch (e) {
      console.error("Failed to add subtask:", e);
    }
  }

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          style={{ zIndex: 55 }}
          onClick={onClose}
        />
      )}

      {/* Slide-over panel — same exact approach as document viewer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[640px] lg:w-[800px] bg-[#0a0a0f] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 60 }}
      >
        {isOpen && (
          <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
            <div className="min-w-0 flex-1">
              {allTodosMode ? (
                <>
                  <h2 className="text-base font-semibold text-white font-mono">
                    All Tasks & Subtasks
                  </h2>
                  <p className="text-xs text-muiz-400 mt-0.5">
                    Manage tasks and their subtasks
                  </p>
                </>
              ) : todo ? (
                <>
                  <h2 className="text-base font-semibold text-white font-mono truncate">
                    {todo.text}
                  </h2>
                  <p className="text-xs text-muiz-400 mt-0.5 flex items-center gap-2">
                    <span>Checklist</span>
                    {subtasks.length > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muiz-500" />
                        <span className={allDone ? "text-emerald-400" : "text-muiz-300"}>
                          {doneCount}/{subtasks.length}
                          {allDone && " ✓ All done"}
                        </span>
                      </>
                    )}
                  </p>
                </>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muiz-400 hover:text-white hover:bg-white/10 transition-all ml-4"
              title="Close"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {allTodosMode && allTodos ? (
              <div className="space-y-3">
                {allTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <HiOutlineCheckCircle className="w-12 h-12 text-muiz-500 mx-auto mb-3" />
                    <p className="text-sm text-muiz-400">No tasks yet</p>
                  </div>
                ) : (
                  allTodos.map((t) => {
                    const subs = getSubtasksFromTodo(t);
                    const expanded = expandedTodo === t.id;
                    const allSubsDone = subs.length > 0 && subs.every((s) => s.done);
                    const subDoneCount = subs.filter((s) => s.done).length;
                    return (
                      <div key={t.id} className="rounded-xl border border-white/10 overflow-hidden">
                        {/* Todo header row */}
                        <button
                          onClick={() =>
                            setExpandedTodo(expanded ? null : t.id)
                          }
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                            t.done
                              ? "bg-white/[0.02]"
                              : "bg-white/[0.04] hover:bg-white/[0.06]"
                          }`}
                        >
                          {expanded ? (
                            <HiChevronDown className="w-4 h-4 text-muiz-400 shrink-0" />
                          ) : (
                            <HiChevronRight className="w-4 h-4 text-muiz-400 shrink-0" />
                          )}
                          <input
                            type="checkbox"
                            checked={t.done}
                            onChange={(e) => {
                              e.stopPropagation();
                              fetch(`/api/projects/${projectId}/todos/${t.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ done: e.target.checked }),
                              }).then((res) => {
                                if (res.ok) res.json().then((updated) => {
                                  if (onTodosChange && allTodos) {
                                    onTodosChange(
                                      allTodos.map((at) => (at.id === t.id ? updated : at))
                                    );
                                  }
                                });
                              });
                            }}
                          />
                          <span
                            className={`flex-1 text-sm font-medium ${
                              t.done
                                ? "text-muiz-500 line-through"
                                : "text-gray-200"
                            }`}
                          >
                            {t.text}
                          </span>
                          {subs.length > 0 && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                allSubsDone
                                  ? "text-emerald-400 bg-emerald-400/10"
                                  : "text-muiz-400 bg-white/5"
                              }`}
                            >
                              {subDoneCount}/{subs.length}
                            </span>
                          )}
                        </button>

                        {/* Expanded subtask area */}
                        {expanded && (
                          <div className="border-t border-white/5 px-4 py-3 bg-white/[0.02] space-y-2">
                            {/* Add subtask inline */}
                            <AddSubtaskInline
                              onAdd={(text) => addSubtaskForTodo(t, text)}
                            />

                            {subs.length === 0 ? (
                              <p className="text-xs text-muiz-500 text-center py-3">
                                No subtasks yet. Add one above.
                              </p>
                            ) : (
                              subs.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={sub.done}
                                    onChange={(e) =>
                                      toggleSubtaskForTodo(t, sub.id, e.target.checked)
                                    }
                                  />
                                  <span
                                    className={`flex-1 text-sm ${
                                      sub.done
                                        ? "text-muiz-500 line-through"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {sub.text}
                                  </span>
                                  <button
                                    onClick={() => deleteSubtaskForTodo(t, sub.id)}
                                    className="p-1 rounded text-muiz-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <HiOutlineTrash className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : todo ? (
              <>
                {/* Add subtask */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newSubText}
                    onChange={(e) => setNewSubText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                    placeholder="Add a subtask..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-muiz-500 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <button
                    onClick={addSubtask}
                    disabled={adding || !newSubText.trim()}
                    className="px-3 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-40 transition-all duration-200"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtask list */}
                {subtasks.length === 0 ? (
                  <div className="text-center py-12">
                    <HiOutlineCheckCircle className="w-12 h-12 text-muiz-500 mx-auto mb-3" />
                    <p className="text-sm text-muiz-400 mb-1">No subtasks yet</p>
                    <p className="text-xs text-muiz-500">
                      Break down this task into smaller steps above
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          sub.done
                            ? "bg-white/[0.02]"
                            : "bg-white/[0.04] hover:bg-white/[0.06]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={sub.done}
                          onChange={(e) => toggleSubtask(sub.id, e.target.checked)}
                        />
                        <span
                          className={`flex-1 text-sm transition-all duration-200 ${
                            sub.done
                              ? "text-muiz-500 line-through"
                              : "text-gray-200"
                          }`}
                        >
                          {sub.text}
                        </span>
                        <button
                          onClick={() => deleteSubtask(sub.id)}
                          className="p-1.5 rounded-lg text-muiz-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Delete subtask"
                        >
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Auto-complete indicator */}
                {subtasks.length > 0 && (
                  <div className={`mt-6 p-3 rounded-xl text-xs transition-all ${
                    allDone
                      ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                      : "bg-white/5 text-muiz-400 border border-white/10"
                  }`}>
                    {allDone
                      ? "All subtasks complete — main task is automatically checked off."
                      : `Complete all ${subtasks.length} subtask${subtasks.length !== 1 ? "s" : ""} to auto-check the main task.`}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
        )}
      </div>
    </>
  );
}

/** Small inline add-subtask form used in all-todos mode */
function AddSubtaskInline({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("");

  function handleSubmit() {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Add subtask..."
        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-muiz-500 focus:outline-none focus:border-accent/50 transition-colors"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="px-2.5 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-40 transition-all text-xs"
      >
        <HiOutlinePlus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
