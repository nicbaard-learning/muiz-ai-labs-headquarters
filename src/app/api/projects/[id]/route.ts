import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
      },
      include: {
        notes: { orderBy: { createdAt: "desc" } },
        todos: { orderBy: { order: "asc" } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, shortName, clientName, description, techStack, techDetails, deploymentNotes, runtimeNotes, siteUrl, localDir, status } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(shortName !== undefined && { shortName }),
        ...(clientName !== undefined && { clientName }),
      ...(description !== undefined && { description }),
      ...(techStack !== undefined && { techStack }),
      ...(techDetails !== undefined && { techDetails }),
      ...(deploymentNotes !== undefined && { deploymentNotes }),
      ...(runtimeNotes !== undefined && { runtimeNotes }),
        ...(siteUrl !== undefined && { siteUrl }),
        ...(localDir !== undefined && { localDir }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
