import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { text, order } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Todo text is required" },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        text: text.trim(),
        order: order ?? 0,
        projectId: id,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Failed to create todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
