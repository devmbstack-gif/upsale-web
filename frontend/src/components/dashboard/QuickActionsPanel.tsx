import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const actions = [
  {
    title: "Create QR offer",
    description: "Launch a discount or reward in minutes.",
    href: "/app/offers/new",
    cta: "Create offer",
  },
  {
    title: "Review customers",
    description: "See who scanned and redeemed recently.",
    href: "/app/customers",
    cta: "Open customers",
  },
  {
    title: "Send a deal",
    description: "Message a segment now or schedule WhatsApp.",
    href: "/app/deals",
    cta: "Open deals",
  },
];

export default function QuickActionsPanel() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Quick actions</h2>
        <p className="text-sm text-muted">Common tasks for your team</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action, i) => (
          <Reveal key={action.title} delay={(i % 3) as 0 | 1 | 2} variant="scale">
            <div className="card-interactive flex h-full flex-col p-5">
              <h3 className="font-medium text-foreground">{action.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{action.description}</p>
              <Button href={action.href} variant="secondary" className="mt-4 w-full">
                {action.cta}
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
