# Minimal Full-Stack Example (Next.js + SQLite)

## 0) Create project
```bash
# Node 18+ recommended
npx create-next-app@latest minimal-fullstack --typescript --eslint
cd minimal-fullstack
npm i @prisma/client prisma
npx prisma init --datasource-provider sqlite
```

## 1) Prisma (database)
`prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Todo {
  id        Int      @id @default(autoincrement())
  text      String
  done      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

Create the DB and client:
```bash
npx prisma migrate dev --name init
```

## 2) Backend API (server route)
Create `app/api/todos/route.ts`:
```ts
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
```

## 3) Frontend page (UI)
Replace `app/page.tsx`:
```tsx
"use client";
import { useEffect, useState } from "react";

type Todo = { id: number; text: string; done: boolean; createdAt: string };

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");

  async function load() {
    const res = await fetch("/api/todos");
    setTodos(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
    load();
  }

  async function toggle(id: number, done: boolean) {
    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
    load();
  }

  return (
    <main className="min-h-screen p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Minimal Full-Stack: Todos</h1>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Add a task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="border rounded px-3 py-2">Add</button>
      </form>

      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={t.done}
              onChange={(e) => toggle(t.id, e.target.checked)}
            />
            <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
              {t.text}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

## 4) Run it
```bash
npm run dev
# open http://localhost:3000
```
