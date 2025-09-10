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
