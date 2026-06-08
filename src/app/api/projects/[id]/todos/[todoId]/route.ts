import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; todoId: string }> }
) {
  const { todoId } = await params;
  try {
    const body = await request.json();
    const { done, text, order, subtasks } = body;

    // If subtasks are provided, check if all are done to auto-complete parent
    let updatedDone = done;
    if (subtasks !== undefined) {
      const parsedSubtasks = typeof subtasks === "string" ? JSON.parse(subtasks) : subtasks;
      if (Array.isArray(parsedSubtasks) && parsedSubtasks.length > 0) {
        updatedDone = parsedSubtasks.every((s: { done: boolean }) => s.done);
      }
    }

    const todo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        ...(done !== undefined && { done }),
        ...(text !== undefined && { text }),
        ...(order !== undefined && { order }),
        ...(subtasks !== undefined && {
          subtasks: typeof subtasks === "string" ? subtasks : JSON.stringify(subtasks),
          done: updatedDone,
        }),
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("Failed to update todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; todoId: string }> }
) {
  const { todoId } = await params;
  try {
    await prisma.todo.delete({ where: { id: todoId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
