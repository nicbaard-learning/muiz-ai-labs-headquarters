import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseMdContent } from "@/lib/parse-md";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      shortName,
      clientName,
      description,
      techStack,
      techDetails,
      mdContent,
      siteUrl,
      localDir,
      status,
    } = body;

    let finalName = name;
    let finalShortName = shortName;
    let finalDescription = description;
    let finalTechStack = techStack;
    let finalTechDetails = techDetails;
    let finalSiteUrl = siteUrl;
    let finalDeployment = null;
    let finalRuntime = null;

    // If MD content was provided, parse it to populate fields
    if (mdContent) {
      const parsed = parseMdContent(mdContent);

      if (!finalName && parsed.name) {
        // Try to derive short name from the parsed name
        // e.g., "PROJECT_DETAILS_TPRM" -> "TPRM", "Excellenta TPRM" -> "TPRM"
        const nameMatch =
          parsed.name.match(/PROJECT_DETAILS_(\w+)/i) ||
          parsed.name.match(/Excellenta\s+(\w+)/i);
        if (nameMatch) {
          finalShortName = finalShortName || nameMatch[1].toUpperCase();
        }
      }

      finalName = finalName || parsed.name || "Untitled Project";
      finalShortName = finalShortName || "NEW";
      finalDescription = finalDescription || parsed.description;
      finalTechStack = finalTechStack || JSON.stringify(parsed.techStack);
      finalTechDetails = finalTechDetails || JSON.stringify(parsed.techDetails);
      finalSiteUrl = finalSiteUrl || parsed.siteUrl;
      finalDeployment = parsed.deploymentNotes;
      finalRuntime = parsed.runtimeNotes;
    }

    if (!finalName || !finalShortName) {
      return NextResponse.json(
        { error: "Project name and short name are required" },
        { status: 400 }
      );
    }

    const slug = finalShortName.toLowerCase().replace(/[^a-z0-9]/g, "-");

    // Check uniqueness
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `A project with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    const project = await prisma.project.create({
      data: {
        slug,
        name: finalName,
        shortName: finalShortName.toUpperCase(),
        clientName: clientName || "Excellenta Cyber",
        description: finalDescription || "",
        techStack: finalTechStack || "[]",
        techDetails: finalTechDetails || "[]",
        deploymentNotes: finalDeployment,
        runtimeNotes: finalRuntime,
        siteUrl: finalSiteUrl || null,
        localDir: localDir || null,
        status: status || "Active",
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
