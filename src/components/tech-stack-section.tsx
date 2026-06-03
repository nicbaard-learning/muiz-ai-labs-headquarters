"use client";

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
  SiFramer,
  SiPrisma,
  SiRender,
  SiAuth0,
  SiNodedotjs,
  SiJavascript,
  SiDocker,
  SiGit,
  SiGithubactions,
  SiPostman,
} from "react-icons/si";

interface TechItem {
  name: string;
  category: string;
}

function getTechIcon(tech: string, size = 22) {
  const t = tech.toLowerCase().trim();
  if (t === "flask") return <SiFlask size={size} />;
  if (t.includes("fastapi")) return <SiFastapi size={size} />;
  if (t.includes("next")) return <SiNextdotjs size={size} />;
  if (t.includes("python")) return <SiPython size={size} />;
  if (t === "react" || t === "react 19") return <SiReact size={size} />;
  if (t.includes("typescript")) return <SiTypescript size={size} />;
  if (t.includes("tailwind")) return <SiTailwindcss size={size} />;
  if (t.includes("bootstrap")) return <SiBootstrap size={size} />;
  if (t.includes("postgresql")) return <SiPostgresql size={size} />;
  if (t.includes("sqlite")) return <SiSqlite size={size} />;
  if (t.includes("jinja")) return <SiJinja size={size} />;
  if (t.includes("framer")) return <SiFramer size={size} />;
  if (t.includes("prisma")) return <SiPrisma size={size} />;
  if (t.includes("render")) return <SiRender size={size} />;
  if (t.includes("auth") || t.includes("jwt")) return <SiAuth0 size={size} />;
  if (t.includes("node")) return <SiNodedotjs size={size} />;
  if (t.includes("javascript")) return <SiJavascript size={size} />;
  if (t.includes("docker")) return <SiDocker size={size} />;
  if (t.includes("git")) return <SiGit size={size} />;
  if (t.includes("github")) return <SiGithubactions size={size} />;
  // Azure DevOps — no dedicated icon in react-icons/si
  if (t.includes("postman")) return <SiPostman size={size} />;
  return null;
}

function getTechColor(tech: string): string {
  const t = tech.toLowerCase().trim();
  if (t === "flask") return "text-gray-300";
  if (t.includes("fastapi")) return "text-emerald-400";
  if (t.includes("next")) return "text-white";
  if (t.includes("python")) return "text-yellow-400";
  if (t === "react" || t === "react 19") return "text-cyan-400";
  if (t.includes("typescript")) return "text-blue-400";
  if (t.includes("tailwind")) return "text-teal-400";
  if (t.includes("bootstrap")) return "text-purple-400";
  if (t.includes("postgresql")) return "text-blue-300";
  if (t.includes("sqlite")) return "text-sky-400";
  if (t.includes("jinja")) return "text-green-400";
  if (t.includes("framer")) return "text-pink-400";
  if (t.includes("prisma")) return "text-teal-300";
  if (t.includes("node")) return "text-green-500";
  if (t.includes("javascript")) return "text-yellow-300";
  if (t.includes("docker")) return "text-blue-500";
  if (t.includes("git")) return "text-orange-400";
  if (t.includes("github")) return "text-gray-200";
  if (t.includes("azure")) return "text-blue-400";
  if (t.includes("postman")) return "text-orange-400";
  return "text-muiz-300";
}

// Category color mapping
const categoryColors: Record<string, string> = {
  Backend: "border-l-blue-400",
  Frontend: "border-l-purple-400",
  Database: "border-l-emerald-400",
  Security: "border-l-red-400",
  DevOps: "border-l-amber-400",
  AI: "border-l-violet-400",
  Reporting: "border-l-cyan-400",
  Other: "border-l-gray-500",
};

const categoryBadgeColors: Record<string, string> = {
  Backend: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  Frontend: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  Database: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  Security: "bg-red-400/10 text-red-400 border-red-400/20",
  DevOps: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  AI: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  Reporting: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  Other: "bg-gray-400/10 text-gray-400 border-gray-400/20",
};

export default function TechStackSection({
  techDetails,
}: {
  techDetails: TechItem[];
}) {
  // Group by category
  const grouped: Record<string, TechItem[]> = {};
  for (const item of techDetails) {
    const cat = item.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span className="cyber-dot" />
        Tech Stack
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(grouped).map(([category, items]) => (
          <div
            key={category}
            className={`pl-3 border-l-2 ${categoryColors[category] || "border-l-gray-500"}`}
          >
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider mb-2 border ${categoryBadgeColors[category] || categoryBadgeColors["Other"]}`}
            >
              {category}
            </span>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const icon = getTechIcon(item.name);
                const color = getTechColor(item.name);
                return (
                  <span
                    key={item.name}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${color} bg-white/8 border border-white/10 hover:bg-white/12 transition-colors`}
                  >
                    {icon}
                    {item.name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {techDetails.length === 0 && (
        <p className="text-sm text-muiz-400">No tech stack data available.</p>
      )}
    </div>
  );
}
