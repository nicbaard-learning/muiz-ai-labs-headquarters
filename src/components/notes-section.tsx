"use client";

import { useState } from "react";
import { HiPlus, HiOutlineTrash } from "react-icons/hi";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export default function NotesSection({
  projectId,
  initialNotes,
}: {
  projectId: string;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);

  async function addNote() {
    if (!newNote.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [note, ...prev]);
        setNewNote("");
      }
    } catch (e) {
      console.error("Failed to add note", e);
    } finally {
      setAdding(false);
    }
  }

  async function deleteNote(noteId: string) {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to delete note", e);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span className="cyber-dot" />
        Notes
        <span className="text-xs font-mono text-muiz-400 ml-1">
          ({notes.length})
        </span>
      </h3>

      {/* Add note */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          rows={2}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-muiz-500 focus:outline-none focus:border-accent/50 transition-colors resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
          }}
        />
        <button
          onClick={addNote}
          disabled={adding || !newNote.trim()}
          className="self-end px-3 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-40 transition-all duration-200"
        >
          <HiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Notes list */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {notes.length === 0 && (
          <p className="text-sm text-muiz-500 text-center py-6">
            No notes yet. Add one above.
          </p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="group relative p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-200"
          >
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap pr-6">
              {note.content}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-mono text-muiz-500">
                {formatDate(note.createdAt)}
              </span>
            </div>
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-2 right-2 p-1 rounded text-muiz-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <HiOutlineTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
