import { prisma } from "@/lib/prisma";

interface TechItem {
  name: string;
  category: string;
}

interface ProjectSeed {
  slug: string;
  shortName: string;
  name: string;
  clientName: string;
  description: string;
  techStack: string[];
  techDetails: TechItem[];
  deploymentNotes: string | null;
  runtimeNotes: string | null;
  siteUrl: string | null;
  status: string;
}

interface TodoSeed {
  projectSlug: string;
  text: string;
  done: boolean;
  order: number;
}

const projects: ProjectSeed[] = [
  {
    slug: "tprm",
    shortName: "TPRM",
    name: "PROJECT_DETAILS_TPRM",
    clientName: "Excellenta Cyber",
    description:
      "Excellenta TPRM is a multi-tenant third-party risk management platform that helps organizations manage vendor relationships from onboarding to offboarding in one secure workflow. The system supports vendor due diligence, questionnaire management, risk scoring, document handling, approvals, audit visibility, and reporting, while keeping each client organization's data isolated. It is designed for practical, day-to-day risk operations, giving business, procurement, and risk teams a shared workspace to make faster and better-informed decisions about third-party risk.",
    techStack: [
      "Flask (Python)",
      "SQLAlchemy",
      "Flask-Login",
      "Flask-WTF",
      "Bootstrap 5",
      "Jinja2 templates",
      "vanilla JavaScript",
      "SQLite",
      "PostgreSQL",
      "ReportLab",
      "Groq",
      "Python 3.8+",
      "Azure DevOps",
      "Hetzner",
    ],
    techDetails: [
      { name: "Flask (Python)", category: "Backend" },
      { name: "SQLAlchemy", category: "Backend" },
      { name: "Flask-Login", category: "Security" },
      { name: "Flask-WTF", category: "Backend" },
      { name: "Bootstrap 5", category: "Frontend" },
      { name: "Jinja2 templates", category: "Frontend" },
      { name: "vanilla JavaScript", category: "Frontend" },
      { name: "SQLite", category: "Database" },
      { name: "PostgreSQL", category: "Database" },
      { name: "ReportLab", category: "Reporting" },
      { name: "Groq", category: "AI" },
      { name: "Python 3.8+", category: "Backend" },
      { name: "Azure DevOps", category: "DevOps" },
      { name: "Hetzner", category: "DevOps" },
    ],
    deploymentNotes:
      "Deployment follows a Git-driven flow through Azure DevOps and then onto Hetzner infrastructure:\n\n- Source control is maintained in Git.\n- Code changes are pushed to Azure DevOps repositories as the central integration point.\n- From Azure DevOps, the deployment workflow is promoted to the Hetzner-hosted environment.\n- Hetzner runs the production instance of the Excellenta TPRM platform.",
    runtimeNotes:
      "- Python 3.8+\n- Virtual environment support (venv recommended)\n- Git\n- Environment variable configuration for application secrets, database connection, SMTP email delivery, and AI/external service keys",
    siteUrl: null,
    status: "Active",
  },
  {
    slug: "grc",
    shortName: "GRC",
    name: "PROJECT_DETAILS_GRC",
    clientName: "Excellenta Cyber",
    description:
      "Excellenta GRC is a multi-tenant cybersecurity governance, risk, and compliance platform built from the ground up around the ExcelCyber Capability Model. It provides organisations with a structured framework to assess, track, and improve their cybersecurity posture across three top-level domains: Govern, Risk & Assure; Protect & Defend; and Identity & Data.",
    techStack: [
      "FastAPI (Python 3.12+)",
      "SQLAlchemy 2.0",
      "JWT-based authentication",
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "shadcn/ui",
      "Framer Motion",
      "SQLite",
      "PostgreSQL",
      "Node.js 20+",
      "Python 3.12+",
    ],
    techDetails: [
      { name: "FastAPI (Python 3.12+)", category: "Backend" },
      { name: "SQLAlchemy 2.0", category: "Backend" },
      { name: "JWT-based authentication", category: "Security" },
      { name: "Next.js 16", category: "Frontend" },
      { name: "React 19", category: "Frontend" },
      { name: "TypeScript", category: "Frontend" },
      { name: "Tailwind CSS 4", category: "Frontend" },
      { name: "shadcn/ui", category: "Frontend" },
      { name: "Framer Motion", category: "Frontend" },
      { name: "SQLite", category: "Database" },
      { name: "PostgreSQL", category: "Database" },
      { name: "Node.js 20+", category: "Backend" },
      { name: "Python 3.12+", category: "Backend" },
    ],
    deploymentNotes:
      "There is currently no deployment path. The project runs locally only. When deployment is eventually pursued, the intended architecture will follow a similar pattern to other Excellenta services: backend deployed as a Python ASGI service (uvicorn/gunicorn), frontend as Next.js static assets or standalone mode, database migrated to PostgreSQL, environment configured via environment variables.",
    runtimeNotes:
      "- Python 3.12+\n- Node.js 20+ (tested with v24)\n- No database server required for local development (SQLite)\n- Environment variables: DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES",
    siteUrl: null,
    status: "Early Development",
  },
  {
    slug: "sfr",
    shortName: "SFR",
    name: "PROJECT_DETAILS_SFR",
    clientName: "Excellenta Cyber",
    description:
      "Excellenta SFR (Shared Framework Repository) is a standalone compliance data service that centralizes, normalizes, and exposes metadata about security, privacy, and risk frameworks. The system supports canonical framework definitions (e.g., NIST, ISO, SOC 2, GDPR), cross-framework control mappings, assessment objectives, evidence requirements, compensating controls, and jurisdiction/business-model applicability rules.",
    techStack: [
      "FastAPI (Python)",
      "SQLAlchemy 2.0",
      "Pydantic v2",
      "Jinja2 templates",
      "Bootstrap 5",
      "vanilla JavaScript",
      "custom CSS",
      "PostgreSQL 15+",
      "pandas",
      "openpyxl",
      "Alembic",
      "Gunicorn",
      "Uvicorn",
      "Python 3.12+",
    ],
    techDetails: [
      { name: "FastAPI (Python)", category: "Backend" },
      { name: "SQLAlchemy 2.0", category: "Backend" },
      { name: "Pydantic v2", category: "Backend" },
      { name: "Jinja2 templates", category: "Frontend" },
      { name: "Bootstrap 5", category: "Frontend" },
      { name: "vanilla JavaScript", category: "Frontend" },
      { name: "custom CSS", category: "Frontend" },
      { name: "PostgreSQL 15+", category: "Database" },
      { name: "pandas", category: "Backend" },
      { name: "openpyxl", category: "Backend" },
      { name: "Alembic", category: "Database" },
      { name: "Gunicorn", category: "DevOps" },
      { name: "Uvicorn", category: "DevOps" },
      { name: "Python 3.12+", category: "Backend" },
    ],
    deploymentNotes:
      "Deployment follows a Git-driven flow through GitHub and onto Render:\n\n- Source control is maintained in Git (GitHub: nicbaard-learning/excellenta-sfr).\n- Code changes are pushed to the GitHub repository as the central integration point.\n- From GitHub, Render auto-deploys via connected repository and blueprint configuration (render.yaml).",
    runtimeNotes:
      "- Python 3.12+\n- Virtual environment support (venv recommended)\n- Git\n- PostgreSQL 15+\n- Environment variables: DATABASE_URL, MCP_API_KEY, application title/version metadata, allowed host/origin lists",
    siteUrl: null,
    status: "Active",
  },
  {
    slug: "prayforgreg",
    shortName: "PRAYFORGREG",
    name: "Pray For Greg",
    clientName: "Private",
    description:
      "A direct prayer roster and support coordinator web application for Greg's community, featuring interactive calendars, media uploads, Web-Push notifications, and WhatsApp integrations.",
    techStack: [
      "Node.js with Express",
      "tsx type-stripping runtime",
      "web-push notifications protocol",
      "React 19",
      "Vite",
      "Tailwind CSS v4",
      "Motion",
      "lucide-react vector iconography",
      "Automatic base64 media conversion",
    ],
    techDetails: [
      { name: "Node.js with Express", category: "Backend" },
      { name: "React 19", category: "Frontend" },
      { name: "Vite", category: "Other" },
      { name: "Tailwind CSS v4", category: "Frontend" },
      { name: "Motion", category: "Other" },
      { name: "lucide-react", category: "Frontend" },
      { name: "tsx", category: "Other" },
      { name: "web-push", category: "Other" },
    ],
    deploymentNotes:
      "Managed via Google Cloud Run (containerized) with Firestore for database storage and Nginx reverse-proxy.",
    runtimeNotes:
      "- Node.js 18+/20+\n- VAPID keys for web-push notifications\n- Firebase configuration\n- Listens on port 3000\n- Roster scheduler\n- Clickable support wall\n- Media hosting via Firebase Cloud Storage\n- Instant push alerts\n- WhatsApp integration",
    siteUrl: null,
    status: "Active",
  },
];

const todos: TodoSeed[] = [
  {
    projectSlug: "tprm",
    text: "Complete authentication change",
    done: false,
    order: 0,
  },
  {
    projectSlug: "tprm",
    text: "Complete vendor onboarding from vendor side",
    done: false,
    order: 1,
  },
];

const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "clientName" TEXT NOT NULL DEFAULT 'Excellenta Cyber',
    "description" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "techDetails" TEXT NOT NULL,
    "deploymentNotes" TEXT,
    "runtimeNotes" TEXT,
    "siteUrl" TEXT,
    "localDir" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug")`,
  `CREATE TABLE IF NOT EXISTS "Note" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Todo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
  )`,
];

export async function GET() {
  try {
    const results: string[] = [];

    // Create tables if they don't exist (Prisma CLI's db push doesn't support libsql:// URLs)
    results.push("Creating tables...");
    for (const sql of CREATE_TABLES_SQL) {
      await prisma.$executeRawUnsafe(sql);
    }
    results.push("✅ Tables created");

    // Seed projects
    for (const p of projects) {
      await prisma.project.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          shortName: p.shortName,
          clientName: p.clientName,
          description: p.description,
          techStack: JSON.stringify(p.techStack),
          techDetails: JSON.stringify(p.techDetails),
          deploymentNotes: p.deploymentNotes,
          runtimeNotes: p.runtimeNotes,
          siteUrl: p.siteUrl,
          status: p.status,
        },
        create: {
          slug: p.slug,
          shortName: p.shortName,
          name: p.name,
          clientName: p.clientName,
          description: p.description,
          techStack: JSON.stringify(p.techStack),
          techDetails: JSON.stringify(p.techDetails),
          deploymentNotes: p.deploymentNotes,
          runtimeNotes: p.runtimeNotes,
          siteUrl: p.siteUrl,
          status: p.status,
        },
      });
      results.push(`✅ ${p.shortName} (${p.slug})`);
    }

    // Seed todos — clear existing first, then create fresh (prevents duplicates)
    await prisma.todo.deleteMany();
    for (const t of todos) {
      const project = await prisma.project.findUnique({
        where: { slug: t.projectSlug },
      });
      if (!project) {
        results.push(`⚠️  Todo skipped — project "${t.projectSlug}" not found`);
        continue;
      }
      await prisma.todo.create({
        data: {
          projectId: project.id,
          text: t.text,
          done: t.done,
          order: t.order,
        },
      });
      results.push(`  📋 Todo: "${t.text}"`);
    }

    return new Response(
      `<html><body style="font-family:system-ui;padding:2rem;max-width:600px;margin:0 auto">
        <h1>✅ Database Seeded!</h1>
        <pre style="background:#f5f5f5;padding:1rem;border-radius:8px">${results.join("\n")}</pre>
        <p><a href="/">Go to homepage</a></p>
      </body></html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      `<html><body style="font-family:system-ui;padding:2rem;">
        <h1>❌ Seed Failed</h1>
        <pre style="background:#fee;padding:1rem;border-radius:8px">${message}</pre>
      </body></html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
