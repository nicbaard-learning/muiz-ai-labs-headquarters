import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;

  const project = await prisma.project.findUnique({
    where: { slug: id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const document = await prisma.projectDocument.findFirst({
    where: { id: docId, projectId: project.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;

  const project = await prisma.project.findUnique({
    where: { slug: id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const document = await prisma.projectDocument.findFirst({
    where: { id: docId, projectId: project.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await prisma.projectDocument.delete({ where: { id: docId } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;

  const project = await prisma.project.findUnique({
    where: { slug: id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const existing = await prisma.projectDocument.findFirst({
    where: { id: docId, projectId: project.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { name, content } = await request.json();

  const updated = await prisma.projectDocument.update({
    where: { id: docId },
    data: {
      ...(name !== undefined && { name }),
      ...(content !== undefined && { content }),
    },
  });

  return NextResponse.json(updated);
}
