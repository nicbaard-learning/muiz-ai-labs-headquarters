"use client";

import Link from "next/link";
import { HiArrowRight, HiOutlineTrash } from "react-icons/hi";
import {
  SiFlask,
  SiFastapi,
  SiNextdotjs,
  SiPython,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiBootstrap,
  SiPostgresql,
  SiSqlite,
  SiJinja,
} from "react-icons/si";

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
}

function getTechIcon(tech: string, size = 18) {
  const t = tech.toLowerCase();
  if (t === "flask") return <SiFlask size={size} />;
  if (t.includes("fastapi")) return <SiFastapi size={size} />;
  if (t.includes("next")) return <SiNextdotjs size={size} />;
  if (t.includes("python")) return <SiPython size={size} />;
  if (t === "react") return <SiReact size={size} />;
  if (t.includes("typescript")) return <SiTypescript size={size} />;
  if (t.includes("tailwind")) return <SiTailwindcss size={size} />;
  if (t.includes("bootstrap") || t === "bootstrap") return <SiBootstrap size={size} />;
  if (t.includes("postgresql") || t === "postgresql") return <SiPostgresql size={size} />;
  if (t.includes("sqlite") || t === "sqlite") return <SiSqlite size={size} />;
  if (t.includes("jinja")) return <SiJinja size={size} />;
  return null;
}

function getTechColor(tech: string): string {
  const t = tech.toLowerCase();
  if (t === "flask") return "text-gray-300";
  if (t.includes("fastapi")) return "text-emerald-400";
  if (t.includes("next")) return "text-white";
  if (t.includes("python")) return "text-yellow-400";
  if (t === "react") return "text-cyan-400";
  if (t.includes("typescript")) return "text-blue-400";
  if (t.includes("tailwind")) return "text-teal-400";
  if (t.includes("bootstrap")) return "text-purple-400";
  if (t.includes("postgresql")) return "text-blue-300";
  if (t.includes("sqlite")) return "text-sky-400";
  if (t.includes("jinja")) return "text-green-400";
  return "text-muiz-300";
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: () => void;
}) {
  const techs: string[] = JSON.parse(project.techStack || "[]");
  const statusColor =
    project.status === "Active"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : "text-amber-400 bg-amber-400/10 border-amber-400/20";

  return (
    <Link
      href={`/projects/${project.slug}`}
      prefetch={true}
      className="group block cursor-pointer"
    >
      {/* Card */}
      <div className="relative glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] glow-accent">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg font-mono">
              {project.shortName[0]}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white group-hover:text-accent transition-colors">
                {project.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${statusColor} mt-1`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {project.status}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg text-muiz-400 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Delete project"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed mb-5 line-clamp-3">
          {truncate(project.description, 160)}
        </p>

        {/* Tech tags */}
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {techs.slice(0, 6).map((tech) => {
              const icon = getTechIcon(tech, 14);
              const color = getTechColor(tech);
              return (
                <span
                  key={tech}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${color} bg-white/8 border border-white/10`}
                >
                  {icon}
                  {tech}
                </span>
              );
            })}
            {techs.length > 6 && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] text-muiz-300 bg-white/8">
                +{techs.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-[11px] font-mono text-muiz-400 tracking-wider uppercase">
            {project.clientName}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0">
            View Details
            <HiArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
