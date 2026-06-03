"use client";

import { useState, useRef } from "react";
import { HiX, HiUpload, HiDocumentText, HiLightningBolt } from "react-icons/hi";

interface Project {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  clientName: string;
  description: string;
  techStack: string;
  techDetails: string;
  status: string;
  siteUrl: string | null;
  localDir: string | null;
}

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

type Tab = "quick" | "advanced";

export default function ProjectFormModal({ onClose, onCreated }: Props) {
  const [tab, setTab] = useState<Tab>("quick");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Add fields
  const [quickName, setQuickName] = useState("");
  const [quickShortName, setQuickShortName] = useState("");
  const [quickClient, setQuickClient] = useState("Excellenta Cyber");
  const [mdFile, setMdFile] = useState<File | null>(null);
  const [mdFileName, setMdFileName] = useState("");

  // Advanced fields
  const [advForm, setAdvForm] = useState({
    name: "",
    shortName: "",
    clientName: "Excellenta Cyber",
    description: "",
    techStack: "",
    siteUrl: "",
    localDir: "",
    status: "Active",
  });

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setMdFile(file);
      setMdFileName(file.name);

      // Try to derive short name from filename
      const nameMatch = file.name.match(/PROJECT_DETAILS_(\w+)/i);
      if (nameMatch) {
        setQuickShortName(nameMatch[1].toUpperCase());
      }
    }
  }

  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = quickName.trim();
    const shortName = quickShortName.trim();

    if (!name) {
      setError("Project name is required");
      return;
    }
    if (!shortName) {
      setError("Short name is required (e.g., TPRM)");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let mdContent: string | undefined;

      // Read MD file if provided
      if (mdFile) {
        mdContent = await mdFile.text();
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          shortName,
          clientName: quickClient || "Excellenta Cyber",
          mdContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      const project = await res.json();
      onCreated(project);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdvancedSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!advForm.name.trim() || !advForm.shortName.trim()) {
      setError("Project name and short name are required");
      return;
    }

    setSubmitting(true);
    setError("");

    const techArray = advForm.techStack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const techDetails = techArray.map((t) => ({
      name: t,
      category: "Other",
    }));

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...advForm,
          techStack: JSON.stringify(techArray),
          techDetails: JSON.stringify(techDetails),
          siteUrl: advForm.siteUrl || null,
          localDir: advForm.localDir || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      const project = await res.json();
      onCreated(project);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg glass rounded-2xl overflow-hidden animate-fade-in-up glow-accent">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
          <h2 className="text-lg font-bold text-white">New Project</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muiz-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6 sm:px-8">
          <button
            onClick={() => { setTab("quick"); setError(""); }}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              tab === "quick"
                ? "text-accent border-accent"
                : "text-muiz-400 border-transparent hover:text-muiz-300"
            }`}
          >
            <HiLightningBolt className="w-4 h-4" />
            Quick Add
          </button>
          <button
            onClick={() => { setTab("advanced"); setError(""); }}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              tab === "advanced"
                ? "text-accent border-accent"
                : "text-muiz-400 border-transparent hover:text-muiz-300"
            }`}
          >
            <HiDocumentText className="w-4 h-4" />
            Advanced
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Quick Add Tab */}
        {tab === "quick" && (
          <form onSubmit={handleQuickSubmit} className="p-6 sm:p-8 space-y-4">
            <p className="text-xs text-muiz-400 leading-relaxed">
              Enter a name and optionally upload a project MD file. The description,
              tech stack, and other details will be extracted automatically.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Excellenta TPRM"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                  Short Name
                </label>
                <input
                  type="text"
                  value={quickShortName}
                  onChange={(e) => setQuickShortName(e.target.value.toUpperCase())}
                  placeholder="TPRM"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                Client Name
              </label>
              <input
                type="text"
                value={quickClient}
                onChange={(e) => setQuickClient(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                MD Project File (optional)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  mdFile
                    ? "border-accent/40 bg-accent/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {mdFile ? (
                  <div className="text-center">
                    <HiDocumentText className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-sm text-white font-medium">{mdFileName}</p>
                    <p className="text-[11px] text-muiz-400 mt-0.5">
                      Click to change file
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMdFile(null);
                        setMdFileName("");
                      }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <HiUpload className="w-8 h-8 text-muiz-400 mx-auto mb-2" />
                    <p className="text-sm text-muiz-300 font-medium">
                      Upload MD file
                    </p>
                    <p className="text-[11px] text-muiz-500 mt-0.5">
                      Drag and drop or click to browse
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick add note */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <HiLightningBolt className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="text-[11px] text-muiz-400 leading-relaxed">
                The MD file should contain a <span className="text-muiz-200 font-mono"># Title</span> heading,
                a <span className="text-muiz-200 font-mono">## Tech Stack</span> section, and optionally
                <span className="text-muiz-200 font-mono"> ## Deployment</span> section. Fields you don&apos;t
                fill will be populated from the parsed file.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-muiz-300 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-50 transition-all duration-200 text-sm font-medium"
              >
                {submitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        )}

        {/* Advanced Tab */}
        {tab === "advanced" && (
          <form onSubmit={handleAdvancedSubmit} className="p-6 sm:p-8 space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  value={advForm.name}
                  onChange={(e) =>
                    setAdvForm({ ...advForm, name: e.target.value })
                  }
                  placeholder="Excellenta TPRM"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                  Short Name
                </label>
                <input
                  type="text"
                  value={advForm.shortName}
                  onChange={(e) =>
                    setAdvForm({ ...advForm, shortName: e.target.value.toUpperCase() })
                  }
                  placeholder="TPRM"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                Client Name
              </label>
              <input
                type="text"
                value={advForm.clientName}
                onChange={(e) =>
                  setAdvForm({ ...advForm, clientName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={advForm.description}
                onChange={(e) =>
                  setAdvForm({ ...advForm, description: e.target.value })
                }
                rows={3}
                placeholder="Project overview..."
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={advForm.techStack}
                onChange={(e) =>
                  setAdvForm({ ...advForm, techStack: e.target.value })
                }
                placeholder="Python, Flask, Bootstrap, SQLite"
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                  Site URL
                </label>
                <input
                  type="url"
                  value={advForm.siteUrl}
                  onChange={(e) =>
                    setAdvForm({ ...advForm, siteUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                  Local Directory
                </label>
                <input
                  type="text"
                  value={advForm.localDir}
                  onChange={(e) =>
                    setAdvForm({ ...advForm, localDir: e.target.value })
                  }
                  placeholder="D:\\projects\\..."
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-muiz-400 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muiz-300 mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                value={advForm.status}
                onChange={(e) =>
                  setAdvForm({ ...advForm, status: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-accent/50 transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Early Development">Early Development</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-muiz-300 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-50 transition-all duration-200 text-sm font-medium"
              >
                {submitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
