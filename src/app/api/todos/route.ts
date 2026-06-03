import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      include: {
        project: {
          select: {
            id: true,
            slug: true,
            shortName: true,
            name: true,
            clientName: true,
          },
        },
      },
      orderBy: [{ done: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}
