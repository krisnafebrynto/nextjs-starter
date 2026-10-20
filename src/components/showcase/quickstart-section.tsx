import { MotionSection } from "@/components/showcase/motion-section";
import { QuickstartCopyButton } from "@/components/showcase/quickstart-copy-button";
import { SectionHeading } from "@/components/showcase/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickstartCommand {
  command: string;
  label: string;
}

const quickstartCommands: readonly QuickstartCommand[] = [
  {
    command: "bun install",
    label: "Install dependencies",
  },
  {
    command: "bun run dev",
    label: "Start the dev server",
  },
];

function QuickstartRow({ step }: { step: QuickstartCommand }) {
  return (
    <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-muted-foreground text-sm">{step.label}</span>
      <QuickstartCopyButton command={step.command} />
    </li>
  );
}

function QuickstartSection() {
  return (
    <MotionSection className="border-border/60 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
        <SectionHeading
          description="Create an app from the template, then run two commands from its directory."
          title="Quickstart"
        />
        <Card>
          <CardHeader>
            <CardTitle>Run The Commands</CardTitle>
            <CardDescription>Run these commands from the app directory.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3">
              {quickstartCommands.map((step) => (
                <QuickstartRow
                  key={step.command}
                  step={step}
                />
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </MotionSection>
  );
}

export { QuickstartSection };
