"use client";

import { useState } from "react";
import { HiExternalLink, HiFolder, HiPencil, HiCheck, HiX } from "react-icons/hi";

interface LinksSectionProps {
  projectId: string;
  siteUrl: string | null;
  localDir: string | null;
}

export default function LinksSection({
  projectId,
  siteUrl,
  localDir,
}: LinksSectionProps) {
  const [editingSite, setEditingSite] = useState(false);
  const [editingDir, setEditingDir] = useState(false);
  const [siteUrlState, setSiteUrlState] = useState(siteUrl || "");
  const [localDirState, setLocalDirState] = useState(localDir || "");
  const [pendingSite, setPendingSite] = useState(siteUrl || "");
  const [pendingDir, setPendingDir] = useState(localDir || "");

  async function saveSiteUrl() {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: pendingSite || null }),
      });
      if (res.ok) {
        setSiteUrlState(pendingSite);
        setEditingSite(false);
      }
    } catch (e) {
      console.error("Failed to update site URL", e);
    }
  }

  async function saveLocalDir() {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localDir: pendingDir || null }),
      });
      if (res.ok) {
        setLocalDirState(pendingDir);
        setEditingDir(false);
      }
    } catch (e) {
      console.error("Failed to update local dir", e);
    }
  }

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span className="cyber-dot" />
        Links &amp; Directories
      </h3>

      <div className="space-y-4">
        {/* Site URL */}
        <div>
          <label className="block text-[10px] font-medium text-muiz-400 uppercase tracking-wider mb-1.5">
            Site URL
          </label>
          <div className="flex items-center gap-2">
            {editingSite ? (
              <>
                <input
                  type="url"
                  value={pendingSite}
                  onChange={(e) => setPendingSite(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-muiz-500 focus:outline-none focus:border-accent/50 transition-colors"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveSiteUrl()}
                />
                <button
                  onClick={saveSiteUrl}
                  className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                >
                  <HiCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingSite(false);
                    setPendingSite(siteUrlState);
                  }}
                  className="p-1.5 rounded-lg text-muiz-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {siteUrlState ? (
                  <a
                    href={siteUrlState}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-accent hover:underline group"
                  >
                    <HiExternalLink className="w-4 h-4" />
                    <span className="truncate max-w-[300px]">
                      {siteUrlState.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                ) : (
                  <span className="text-sm text-muiz-500 italic">
                    Not set
                  </span>
                )}
                <button
                  onClick={() => {
                    setEditingSite(true);
                    setPendingSite(siteUrlState);
                  }}
                  className="p-1.5 rounded-lg text-muiz-400 hover:text-white hover:bg-white/5 transition-colors ml-auto"
                >
                  <HiPencil className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Local Directory */}
        <div>
          <label className="block text-[10px] font-medium text-muiz-400 uppercase tracking-wider mb-1.5">
            Local Directory
          </label>
          <div className="flex items-center gap-2">
            {editingDir ? (
              <>
                <input
                  type="text"
                  value={pendingDir}
                  onChange={(e) => setPendingDir(e.target.value)}
                  placeholder="D:\\projects\\..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-muiz-500 focus:outline-none focus:border-accent/50 transition-colors"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveLocalDir()}
                />
                <button
                  onClick={saveLocalDir}
                  className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                >
                  <HiCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingDir(false);
                    setPendingDir(localDirState);
                  }}
                  className="p-1.5 rounded-lg text-muiz-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {localDirState ? (
                  <span className="flex items-center gap-2 text-sm text-gray-200 font-mono">
                    <HiFolder className="w-4 h-4 text-amber-400" />
                    <span className="truncate max-w-[300px]">
                      {localDirState}
                    </span>
                  </span>
                ) : (
                  <span className="text-sm text-muiz-500 italic">
                    Not set
                  </span>
                )}
                <button
                  onClick={() => {
                    setEditingDir(true);
                    setPendingDir(localDirState);
                  }}
                  className="p-1.5 rounded-lg text-muiz-400 hover:text-white hover:bg-white/5 transition-colors ml-auto"
                >
                  <HiPencil className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
