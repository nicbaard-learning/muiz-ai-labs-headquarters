"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/project-card";
import ProjectFormModal from "@/components/project-form-modal";
import GlobalTodoList from "@/components/global-todo-list";
import GlobalSearch from "@/components/global-search";
import { HiPlus, HiMenu, HiX } from "react-icons/hi";

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

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed to fetch projects", e);
    } finally {
      setLoading(false);
    }
  }

  // Get unique clients from projects
  const clients = [...new Set(projects.map((p) => p.clientName).filter(Boolean))];

  // Filter projects by selected client
  const filteredProjects = selectedClient
    ? projects.filter((p) => p.clientName === selectedClient)
    : projects;

  async function handleDeleteProject(projectId: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (e) {
      console.error("Failed to delete project", e);
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <header className="relative z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo + Title */}
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-accent/20">
                <img
                  src="/logo.webp"
                  alt="Muiz AI Labs"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Muiz AI Labs
                </h1>
                <p className="text-sm text-muiz-200 -mt-0.5">
                  Project Headquarters
                </p>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-4">
              <GlobalSearch />
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all duration-200 text-sm font-medium"
              >
                <HiPlus className="w-4 h-4" />
                New Project
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden text-muiz-300 hover:text-white p-2"
            >
              {menuOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="sm:hidden pb-4 border-t border-white/5 pt-4">
              <button
                onClick={() => {
                  setShowModal(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all duration-200 text-sm font-medium"
              >
                <HiPlus className="w-4 h-4" />
                New Project
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Client filter chips */}
        {!loading && projects.length > 0 && clients.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs font-mono text-muiz-400 uppercase tracking-wider mr-1">
              Client:
            </span>
            <button
              onClick={() => setSelectedClient(null)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedClient === null
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-muiz-300 border border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              All
            </button>
            {clients.map((client) => (
              <button
                key={client}
                onClick={() =>
                  setSelectedClient(selectedClient === client ? null : client)
                }
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedClient === client
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-muiz-300 border border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {client}
              </button>
            ))}
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muiz-400/50 to-transparent" />
          <span className="text-sm font-mono text-muiz-300 tracking-widest uppercase">
            {loading
              ? "Loading..."
              : `${filteredProjects.length} / ${projects.length} Project${projects.length !== 1 ? "s" : ""}`}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muiz-400/50 to-transparent" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl shimmer animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 text-muiz-400">⚡</div>
            <h2 className="text-xl font-semibold text-muiz-200 mb-2">
              {selectedClient
                ? `No projects for ${selectedClient}`
                : "No Projects Yet"}
            </h2>
            <p className="text-muiz-300 mb-6">
              {selectedClient
                ? "Try selecting a different client."
                : "Create your first project to get started."}
            </p>
            {!selectedClient && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all duration-200 font-medium"
              >
                <HiPlus className="w-5 h-5" />
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Project Cards — left 2/3 on desktop */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProjectCard
                      project={project}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Global Todo List — sticky side pane on desktop, below on mobile */}
            <div className="mt-8 lg:mt-0 lg:col-span-1">
              <div className="animate-fade-in-up lg:sticky lg:top-24">
                <GlobalTodoList clientFilter={selectedClient} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showModal && (
        <ProjectFormModal
          onClose={() => setShowModal(false)}
          onCreated={(project) => {
            setProjects((prev) => [...prev, project]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
