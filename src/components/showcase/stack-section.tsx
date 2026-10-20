import Bun from "@thesvg/react/bun";
import Nextdotjs from "@thesvg/react/nextdotjs";
import ReactIcon from "@thesvg/react/react";
import ShadcnUi from "@thesvg/react/shadcn-ui";
import Tailwindcss from "@thesvg/react/tailwindcss";
import Typescript from "@thesvg/react/typescript";
import type { ComponentType, SVGProps } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { MotionSection } from "@/components/showcase/motion-section";
import { SectionHeading } from "@/components/showcase/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type StackIcon, site } from "@/resources/site";

const stackIcons = {
  bun: Bun,
  nextdotjs: Nextdotjs,
  react: ReactIcon,
  shadcn: ShadcnUi,
  tailwindcss: Tailwindcss,
  typescript: Typescript,
} satisfies Record<StackIcon, ComponentType<SVGProps<SVGSVGElement>>>;

function StackSection() {
  return (
    <MotionSection className="border-border/60 border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:py-20">
        <SectionHeading
          description="The runtime, framework, and tools every app starts with."
          title="The Stack"
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.stack.map((entry) => {
            const Icon = stackIcons[entry.icon];

            return (
              <li key={entry.name}>
                <Magnetic
                  className="h-full w-full"
                  strength={0.12}
                >
                  <Card
                    className="h-full transition-shadow hover:shadow-md"
                    size="sm"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Icon
                          aria-hidden="true"
                          className="size-8 shrink-0"
                        />
                        <CardTitle>{entry.name}</CardTitle>
                      </div>
                      {entry.version ? (
                        <CardAction>
                          <Badge variant="outline">v{entry.version}</Badge>
                        </CardAction>
                      ) : null}
                      <CardDescription>{entry.role}</CardDescription>
                    </CardHeader>
                  </Card>
                </Magnetic>
              </li>
            );
          })}
        </ul>
      </div>
    </MotionSection>
  );
}

export { StackSection };
