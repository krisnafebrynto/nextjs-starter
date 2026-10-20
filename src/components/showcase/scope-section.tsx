import { CheckIcon, type LucideIcon, MinusIcon } from "lucide-react";
import { MotionSection } from "@/components/showcase/motion-section";
import { SectionHeading } from "@/components/showcase/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const included = [
  "Next.js App Router with Cache Components and Partial Prefetching",
  "React 19 with the React Compiler",
  "Bun for installs, scripts, and the runtime",
  "TypeScript 7 in strict mode",
  "Tailwind CSS 4 and shadcn/ui primitives",
  "Motion with reduced-motion support",
  "Biome and Ultracite for linting and formatting",
  "GitHub Actions CI for linting, types, and builds",
] as const;

const notIncluded = [
  "Authentication and user accounts",
  "Database and ORM",
  "Payments and billing",
  "Internationalization",
  "Analytics",
  "Content management system",
  "Email and transactional messages",
] as const;

interface ScopeListProps {
  icon: LucideIcon;
  items: readonly string[];
}

function ScopeList({ icon: Icon, items }: ScopeListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          className="flex items-start gap-3 text-muted-foreground transition-colors hover:text-foreground"
          key={item}
        >
          <Icon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <span className="text-sm leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ScopeSection() {
  return (
    <MotionSection className="border-border/60 border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:py-20">
        <SectionHeading
          description="The v1.0 scope keeps the starter app-agnostic. Add application services when your app needs them."
          title="What Ships"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Included</CardTitle>
              <CardAction>
                <Badge variant="secondary">Shipped</Badge>
              </CardAction>
              <CardDescription>Everything the starter ships and maintains.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScopeList
                icon={CheckIcon}
                items={included}
              />
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Not Included</CardTitle>
              <CardAction>
                <Badge variant="outline">Out Of Scope</Badge>
              </CardAction>
              <CardDescription>Deliberately left to your app.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScopeList
                icon={MinusIcon}
                items={notIncluded}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MotionSection>
  );
}

export { ScopeSection };
