"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineX,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineCheckCircle,
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
}

export default function TodoSlideover({
  todo,
  projectId,
  onClose,
  onUpdate,
}: TodoSlideoverProps) {
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubText, setNewSubText] = useState("");
  const [adding, setAdding] = useState(false);

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

  // Check if all subtasks are done
  const allDone = subtasks.length > 0 && subtasks.every((s) => s.done);
  const doneCount = subtasks.filter((s) => s.done).length;

  return (
    <>
      {/* Overlay backdrop */}
      {todo && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] bg-[#0a0a0f] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${
          todo ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {todo && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <div className="min-w-0 flex-1">
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}
