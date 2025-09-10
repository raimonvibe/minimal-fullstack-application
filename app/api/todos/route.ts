import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/todos -> list todos
export async function GET() {
  const todos = await prisma.todo.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(todos);
}

// POST /api/todos -> create todo { text }
export async function POST(req: Request) {
  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const todo = await prisma.todo.create({ data: { text } });
  return NextResponse.json(todo, { status: 201 });
}

// PATCH /api/todos -> toggle { id, done }
export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  const updated = await prisma.todo.update({ where: { id }, data: { done } });
  return NextResponse.json(updated);
}
