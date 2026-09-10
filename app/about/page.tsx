import Link from 'next/link';
import { 
  Kanban, 
  ShieldCheck, 
  Workflow, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const highlights = [
    {
      icon: Kanban,
      title: 'Streamlined Kanban Workflow',
      description:
        'A lightweight workspace designed to keep focus sharp across To Do, In Progress, and Done without the overhead of heavy project tools.',
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control',
      description:
        'Built with granular security boundaries separating member workspace tasks from global administrator oversight and account management.',
    },
    {
      icon: Workflow,
      title: 'Collaborative Delegation',
      description:
        'Empowers team members to pick up open backlog items, reassign active workflows, and track ownership transparently in real time.',
    },
    {
      icon: Layers,
      title: 'Full-Stack Decoupled Architecture',
      description:
        'Engineered with a responsive Next.js client backed by an Express and MongoDB API layer with persistent auth and strict data validation.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Simplicity in Execution.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Task Board was created to eliminate workflow clutter. It offers teams an intuitive visual board to capture ideas, delegate responsibilities, and guide work from planning to completion without friction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border bg-card/50 transition-colors hover:bg-card">
            <CardContent className="p-6 space-y-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl border bg-muted/30 p-8 space-y-4">
        <h2 className="font-heading text-xl font-semibold">Behind the Build</h2>
        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
          Rather than wrapping complex enterprise features into an over-engineered interface, Task Board prioritizes speed, clarity, and rock-solid architectural fundamentals. From state synchronization and caching on the client to connection pooling and resilient security layers on the backend, every detail is focused on seamless usability.
        </p>
        <div className="pt-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard">
              Back to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}