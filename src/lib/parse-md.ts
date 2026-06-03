export interface TechItem {
  name: string;
  category: string;
}

export interface ParsedProject {
  name: string;
  description: string;
  techStack: string[];
  techDetails: TechItem[];
  deploymentNotes: string | null;
  runtimeNotes: string | null;
  siteUrl: string | null;
}

const TECH_CATEGORIES: Record<string, string> = {
  "Python": "Backend",
  "Flask": "Backend",
  "SQLAlchemy": "Backend",
  "Flask-Login": "Security",
  "Flask-WTF": "Backend",
  "Bootstrap 5": "Frontend",
  "Bootstrap": "Frontend",
  "Jinja2": "Frontend",
  "Jinja": "Frontend",
  "JavaScript": "Frontend",
  "PostgreSQL": "Database",
  "PostgreSQL 15+": "Database",
  "SQLite": "Database",
  "ReportLab": "Reporting",
  "FastAPI": "Backend",
  "Next.js": "Frontend",
  "Next.js 16": "Frontend",
  "React": "Frontend",
  "React 19": "Frontend",
  "TypeScript": "Frontend",
  "Tailwind CSS": "Frontend",
  "Tailwind CSS 4": "Frontend",
  "Framer Motion": "Frontend",
  "Pydantic v2": "Backend",
  "Alembic": "Database",
  "pandas": "Backend",
  "openpyxl": "Backend",
  "JWT": "Security",
  "JWT-based authentication": "Security",
  "RBAC": "Security",
  "CSRF": "Security",
  "Node.js": "Backend",
  "Gunicorn": "DevOps",
  "Uvicorn": "DevOps",
};

function processTechLine(content: string, contextCategory: string, data: { techStack: string[]; techDetails: TechItem[] }) {
  const parts = content.split(/[,;]/).map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    let cleanPart = part.replace(/\([^)]*\)/g, "").trim();
    cleanPart = cleanPart.replace(/^-\s*/, "").trim();
    if (!cleanPart || cleanPart.length < 2) continue;
    if (cleanPart.match(/^(backend|frontend|database|security|reporting|ai|data import|migrations)\s*:?$/i)) continue;
    if (cleanPart.length > 40) continue;

    if (!data.techStack.includes(cleanPart)) {
      let category = contextCategory;
      for (const [knownTech, knownCategory] of Object.entries(TECH_CATEGORIES)) {
        if (cleanPart.toLowerCase().includes(knownTech.toLowerCase())) {
          category = knownCategory;
          break;
        }
      }
      data.techStack.push(cleanPart);
      data.techDetails.push({ name: cleanPart, category });
    }
  }
}

export function parseMdContent(content: string): ParsedProject {
  const lines = content.split("\n");
  const data: { techStack: string[]; techDetails: TechItem[] } = {
    techStack: [],
    techDetails: [],
  };

  let currentSection = "";
  let projectName = "";
  let descriptionLines: string[] = [];
  let techStackLines: string[] = [];
  let runtimeLines: string[] = [];
  let deploymentLines: string[] = [];
  let inDescription = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (line.startsWith("# ")) {
      projectName = line.replace("# ", "").trim();
      inDescription = true;
      currentSection = "description";
      continue;
    }

    if (line.startsWith("## ") || line.startsWith("### ")) {
      const sectionName = trimmed.toLowerCase();
      if (sectionName.includes("tech stack")) {
        currentSection = "techstack";
        inDescription = false;
        continue;
      } else if (sectionName.includes("runtime") || sectionName.includes("setup")) {
        currentSection = "runtime";
        inDescription = false;
        continue;
      } else if (sectionName.includes("deployment")) {
        currentSection = "deployment";
        inDescription = false;
        continue;
      } else if (sectionName.includes("current state")) {
        currentSection = "state";
        inDescription = false;
        continue;
      }
      inDescription = false;
      continue;
    }

    if (currentSection === "description" && trimmed && !line.startsWith("#")) {
      descriptionLines.push(trimmed);
    } else if (currentSection === "techstack" && trimmed) {
      techStackLines.push(trimmed);
    } else if (currentSection === "runtime" && trimmed) {
      runtimeLines.push(trimmed);
    } else if (currentSection === "deployment" && trimmed) {
      deploymentLines.push(trimmed);
    }
  }

  // Extract technologies
  let currentCategory = "Other";
  for (const line of techStackLines) {
    if (line.endsWith(":") || line.match(/^[-:]\s*\w+:/)) {
      const catMatch = line.match(/[-:]\s*(\w+):/);
      if (catMatch) {
        const catName = catMatch[1].toLowerCase();
        if (catName === "backend") currentCategory = "Backend";
        else if (catName === "frontend") currentCategory = "Frontend";
        else if (catName === "database") currentCategory = "Database";
        else if (catName === "security") currentCategory = "Security";
        else if (catName === "reporting") currentCategory = "Reporting";
        else if (catName === "ai" || catName === "ai integration") currentCategory = "AI";
        else if (catName === "data import") currentCategory = "Backend";
        else if (catName === "migrations") currentCategory = "Database";
        else currentCategory = "Other";
      }
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const afterColon = line.slice(colonIdx + 1).trim();
        if (afterColon) processTechLine(afterColon, currentCategory, data);
      }
    } else if (line.startsWith("- ")) {
      const techContent = line.replace(/^-\s*/, "").trim();
      processTechLine(techContent, currentCategory, data);
    }
  }

  // Deduplicate
  const uniqueTechs = [...new Set(data.techStack)];
  const uniqueTechDetails: TechItem[] = [];
  const seen = new Set<string>();
  for (const item of data.techDetails) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      uniqueTechDetails.push(item);
    }
  }

  // Extract site URL from deployment notes
  let siteUrl: string | null = null;
  const fullDeployment = deploymentLines.join(" ");
  const urlMatch = fullDeployment.match(/https?:\/\/[^\s)]+/);
  if (urlMatch) siteUrl = urlMatch[0];

  return {
    name: projectName,
    description: descriptionLines.join(" ").trim(),
    techStack: uniqueTechs,
    techDetails: uniqueTechDetails,
    deploymentNotes: deploymentLines.length > 0 ? deploymentLines.join("\n").trim() : null,
    runtimeNotes: runtimeLines.length > 0 ? runtimeLines.join("\n").trim() : null,
    siteUrl,
  };
}
