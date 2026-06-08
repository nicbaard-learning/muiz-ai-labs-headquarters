"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineUpload,
} from "react-icons/hi";
import MDViewer from "./md-viewer";

interface Document {
  id: string;
  name: string;
  createdAt: string;
}

interface DocumentFull extends Document {
  content: string;
}

export default function DocumentRepository({
  projectId,
}: {
  projectId: string;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error("Failed to load documents:", e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function openDocument(doc: Document) {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/documents/${doc.id}`
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedDoc(data);
      }
    } catch (e) {
      console.error("Failed to open document:", e);
    }
  }

  async function deleteDocument(docId: string) {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/documents/${docId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        if (selectedDoc?.id === docId) setSelectedDoc(null);
      }
    } catch (e) {
      console.error("Failed to delete document:", e);
    }
  }

  async function uploadFile(file: File) {
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".md") && !fileName.endsWith(".markdown")) {
      alert("Please select a .md or .markdown file.");
      return;
    }

    setUploading(true);
    try {
      const content = await file.text();
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          content,
        }),
      });
      if (res.ok) {
        const doc = await res.json();
        setDocuments((prev) => [doc, ...prev]);
        setShowUpload(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Upload failed");
      }
    } catch (e) {
      console.error("Failed to upload file:", e);
      alert("Failed to read file. Make sure it's a valid text file.");
    } finally {
      setUploading(false);
    }
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  // ─── Slide-over overlay for viewing a document ──────────────────────
  return (
    <>
      {/* Overlay backdrop */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-overlay bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedDoc(null)}
        />
      )}

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 right-0 z-slideover h-full w-full sm:w-[640px] lg:w-[800px] bg-[#0a0a0f] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${
          selectedDoc ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedDoc && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-white font-mono truncate">
                  {selectedDoc.name}
                </h2>
                <p className="text-xs text-muiz-400 mt-0.5">
                  {new Date(selectedDoc.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => deleteDocument(selectedDoc.id)}
                  className="p-2 rounded-lg text-muiz-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Delete document"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 rounded-lg text-muiz-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Close"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="bg-white/5 rounded-xl p-6 sm:p-8">
                <MDViewer content={selectedDoc.content} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Sidebar widget ──────────────────────────────────── */}
      <div className="glass rounded-2xl p-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            Documents
          </h3>
          <button
            onClick={() => {
              setShowUpload(!showUpload);
              if (!showUpload) setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown"
          onChange={handleFilePick}
          className="hidden"
        />

        {/* Upload zone */}
        {showUpload && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`mb-4 p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
              dragOver
                ? "border-accent bg-accent/10"
                : "border-white/10 bg-white/5 hover:border-accent/40 hover:bg-white/8"
            }`}
          >
            {uploading ? (
              <div className="py-4">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muiz-400">Uploading...</p>
              </div>
            ) : (
              <>
                <HiOutlineUpload className="w-10 h-10 text-muiz-400 mx-auto mb-3" />
                <p className="text-sm text-white font-medium mb-1">
                  Click to select or drag a file here
                </p>
                <p className="text-xs text-muiz-400">
                  .md or .markdown files only
                </p>
              </>
            )}
          </div>
        )}

        {/* Document list */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <HiOutlineDocumentText className="w-10 h-10 text-muiz-400 mx-auto mb-2" />
            <p className="text-sm text-muiz-400">No documents yet</p>
            <p className="text-xs text-muiz-500 mt-1">
              Upload a Markdown file to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => openDocument(doc)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <HiOutlineDocumentText className="w-5 h-5 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate font-mono">
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-muiz-400">
                      {new Date(doc.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(doc.id);
                  }}
                  className="p-1.5 rounded-lg text-muiz-400 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
