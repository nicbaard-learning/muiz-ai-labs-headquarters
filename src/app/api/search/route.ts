import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SearchResult {
  id: string;
  type: "project" | "todo" | "note";
  label: string;
  sublabel: string;
  href: string;
  matchField: string;
  matchReason: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const qLower = q.toLowerCase();

    // ── Search Projects ──────────────────────────────────────────────
    // Only search in plain-text fields (NOT JSON blobs techStack/techDetails)
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { shortName: { contains: q } },
          { description: { contains: q } },
          { techStack: { contains: q } },
          { deploymentNotes: { contains: q } },
          { runtimeNotes: { contains: q } },
          { siteUrl: { contains: q } },
          { clientName: { contains: q } },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        shortName: true,
        description: true,
        techStack: true,
        techDetails: true,
        deploymentNotes: true,
        runtimeNotes: true,
        siteUrl: true,
        clientName: true,
      },
      take: 10,
    });

    // ── Search Todos ────────────────────────────────────────────────
    const todos = await prisma.todo.findMany({
      where: { text: { contains: q } },
      include: {
        project: { select: { id: true, slug: true, shortName: true, name: true } },
      },
      take: 10,
    });

    // ── Search Notes ────────────────────────────────────────────────
    const notes = await prisma.note.findMany({
      where: { content: { contains: q } },
      include: {
        project: { select: { id: true, slug: true, shortName: true, name: true } },
      },
      take: 10,
    });

    // ── Format results ──────────────────────────────────────────────
    const results: SearchResult[] = [];

    for (const p of projects) {
      // Also check tech names (parsed from JSON, not raw string)
      let techNameMatch: string | null = null;
      try {
        const techDetails = JSON.parse(p.techDetails || "[]") as { name: string; category: string }[];
        for (const t of techDetails) {
          if (t.name.toLowerCase().includes(qLower)) {
            techNameMatch = t.name;
            break;
          }
        }
      } catch { /* ignore JSON parse errors */ }

      // Find which field matched and extract context
      const match = findMatch(p, qLower);
      // Use techNameMatch as fallback if no plain-text match found
      const reason = match
        ? `${match.field}: ${match.excerpt}`
        : techNameMatch
          ? `Tech: ${techNameMatch}`
          : `Matched field`;

      results.push({
        id: p.id,
        type: "project",
        label: p.name,
        sublabel: p.shortName,
        href: `/projects/${p.slug}`,
        matchField: match?.excerpt || techNameMatch || "",
        matchReason: reason,
      });
    }

    for (const t of todos) {
      const excerpt = excerptText(t.text, qLower);
      results.push({
        id: t.id,
        type: "todo",
        label: t.text,
        sublabel: `Task · ${t.project.shortName}`,
        href: `/projects/${t.project.slug}`,
        matchField: excerpt,
        matchReason: `Task: ${excerpt}`,
      });
    }

    for (const n of notes) {
      const excerpt = excerptText(n.content, qLower);
      results.push({
        id: n.id,
        type: "note",
        label: n.content.slice(0, 100),
        sublabel: `Note · ${n.project.shortName}`,
        href: `/projects/${n.project.slug}`,
        matchField: excerpt,
        matchReason: `Note: ${excerpt}`,
      });
    }

    // Sort: projects first, then todos, then notes
    results.sort((a, b) => {
      const order: Record<string, number> = { project: 0, todo: 1, note: 2 };
      return (order[a.type] ?? 9) - (order[b.type] ?? 9);
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Search failed", results: [] },
      { status: 500 }
    );
  }
}

interface FieldMatch {
  field: string;
  excerpt: string;
}

function findMatch(p: {
  name: string;
  shortName: string;
  description: string;
  deploymentNotes: string | null;
  runtimeNotes: string | null;
  siteUrl: string | null;
  clientName: string;
}, qLower: string): FieldMatch | null {
  const fields: [string, string][] = [
    ["Name", p.name],
    ["Short name", p.shortName],
    ["Description", p.description],
    ["Deployment", p.deploymentNotes || ""],
    ["Runtime", p.runtimeNotes || ""],
    ["Site URL", p.siteUrl || ""],
    ["Client", p.clientName],
  ];

  for (const [field, value] of fields) {
    if (!value) continue;
    const idx = value.toLowerCase().indexOf(qLower);
    if (idx !== -1) {
      const excerpt = excerptText(value, qLower);
      return { field, excerpt };
    }
  }

  return null;
}

function excerptText(text: string, qLower: string): string {
  const idx = text.toLowerCase().indexOf(qLower);
  if (idx === -1) return text.slice(0, 80);

  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + qLower.length + 40);
  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = "…" + excerpt;
  if (end < text.length) excerpt = excerpt + "…";
  return excerpt;
}
