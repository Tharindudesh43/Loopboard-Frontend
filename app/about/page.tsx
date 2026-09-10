export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-4">
      <h1 className="font-heading text-3xl font-semibold">About Task Board</h1>
      <p className="text-muted-foreground">
        Task Board is a small Trello-style app for organizing work across three
        stages — To Do, Doing, and Done. Anyone can create a task and pick up
        unassigned work; admins can see the whole board, reassign tasks, and
        manage accounts.
      </p>
      <p className="text-muted-foreground">
        It was built as a technical assignment to demonstrate a full-stack
        application: a Next.js frontend, an Express and MongoDB backend, and
        role-based access control enforced on both sides.
      </p>
    </div>
  );
}
