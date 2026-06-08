"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  HiArrowLeft,
  HiOutlineExternalLink,
  HiOutlineFolder,
} from "react-icons/hi";
import TechStackSection from "@/components/tech-stack-section";
import GlobalSearch from "@/components/global-search";
import TodoSection from "@/components/todo-section";
import NotesSection from "@/components/notes-section";
import LinksSection from "@/components/links-section";
import DocumentRepository from "@/components/document-repository";

interface TechItem {
  name: string;
  category: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface Todo {
  id: string;
  text: string;
  done: boolean;
  order: number;
  subtasks: string;
}

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
  deploymentNotes: string | null;
  runtimeNotes: string | null;
  notes: Note[];
  todos: Todo[];
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Project not found");
        const data = await res.json();
        setProject(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muiz-400 font-mono">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Project not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all duration-200 text-sm"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Headquarters
          </button>
        </div>
      </div>
    );
  }

  const techDetails: TechItem[] = JSON.parse(project.techDetails || "[]");
  const techStack: string[] = JSON.parse(project.techStack || "[]");

  const statusColor =
    project.status === "Active"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : "text-amber-400 bg-amber-400/10 border-amber-400/20";

  return (
    <div className="min-h-screen">

      {/* Header */}
      <header className="relative z-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-sm text-muiz-400 hover:text-white transition-colors"
            >
              <HiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Headquarters</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-center gap-4">
              <GlobalSearch />
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-accent/20">
                <img
                  src="/logo.webp"
                  alt="Muiz AI Labs"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Project Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Project Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-bold text-2xl font-mono glow-accent">
                {project.shortName[0]}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {project.name}
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm text-muiz-300">
                    {project.clientName}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muiz-500" />
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${statusColor}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {project.status}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muiz-500" />
                  <span className="text-xs font-mono text-muiz-400">
                    {project.slug.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              {project.siteUrl && (
                <a
                  href={project.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all duration-200 text-xs font-medium"
                >
                  <HiOutlineExternalLink className="w-3.5 h-3.5" />
                  Open Site
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main layout: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="glass rounded-2xl p-5 sm:p-6 animate-fade-in-up">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="cyber-dot" />
                Overview
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Tech Stack */}
            <div className="animate-fade-in-up">
              <TechStackSection techDetails={techDetails} />
            </div>

            {/* Deployment info */}
            {project.deploymentNotes && (
              <div className="animate-fade-in-up">
                <div className="glass rounded-2xl p-5 sm:p-6">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    Deployment
                  </h3>
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line font-mono text-[13px]">
                    {project.deploymentNotes}
                  </div>
                </div>
              </div>
            )}

            {/* Runtime requirements */}
            {project.runtimeNotes && (
              <div className="animate-fade-in-up">
                <div className="glass rounded-2xl p-5 sm:p-6">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    Runtime &amp; Requirements
                  </h3>
                  <ul className="space-y-1.5">
                    {project.runtimeNotes.split("\n").filter(l => l.trim()).map((line: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                        <span className="text-accent mt-1">›</span>
                        <span>{line.replace(/^[-•*]\s*/, "").trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="animate-fade-in-up">
              <LinksSection
                projectId={project.id}
                siteUrl={project.siteUrl}
                localDir={project.localDir}
              />
            </div>
          </div>

          {/* Right column - Interactive */}
          <div className="space-y-6">
            {/* Client info card */}
            <div className="glass rounded-2xl p-5 animate-fade-in-up">
              <h3 className="text-xs font-semibold text-muiz-400 uppercase tracking-wider mb-3">
                Client
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-400 font-bold text-sm">
                  EC
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {project.clientName}
                  </p>
                  <p className="text-[11px] text-muiz-300 font-mono">
                    {techStack.slice(0, 3).join(", ")}
                    {techStack.length > 3 && "..."}
                  </p>
                </div>
              </div>
            </div>

            {/* To-Do's */}
            <TodoSection
              projectId={project.id}
              initialTodos={project.todos}
            />

            {/* Notes */}
            <div className="animate-fade-in-up">
              <NotesSection
                projectId={project.id}
                initialNotes={project.notes}
              />
            </div>

            {/* Documents */}
            <DocumentRepository projectId={project.slug} />
          </div>
        </div>
      </main>
    </div>
  );
}
