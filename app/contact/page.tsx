import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-4">
      <h1 className="font-heading text-3xl font-semibold">Contact</h1>
      <p className="text-muted-foreground">
        Questions about the project or found a bug? Reach out below.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Get in touch</CardTitle>
        </CardHeader>
        <CardContent>
          <a href="mailto:hello@example.com" className="text-primary hover:underline">
            hello@example.com
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
