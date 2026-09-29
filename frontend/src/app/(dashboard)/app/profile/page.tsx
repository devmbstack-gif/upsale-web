"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { useEffect, useState } from "react";

type Profile = {
  businessName?: string;
  category?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  city?: string;
  whatsapp?: string;
  supportEmail?: string;
  email?: string;
  plan?: string;
  description?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    country: "",
    currency: "",
    timezone: "",
    city: "",
    whatsapp: "",
    supportEmail: "",
    description: "",
  });

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/profile", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { profile: Profile };
      const p = data.profile ?? {};
      setProfile(p);
      setForm({
        businessName: p.businessName ?? "",
        category: p.category ?? "",
        country: p.country ?? "",
        currency: p.currency ?? "",
        timezone: p.timezone ?? "",
        city: p.city ?? "",
        whatsapp: p.whatsapp ?? "",
        supportEmail: p.supportEmail ?? p.email ?? "",
        description: p.description ?? "",
      });
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          category: form.category,
          country: form.country,
          currency: form.currency,
          timezone: form.timezone,
          city: form.city,
          whatsapp: form.whatsapp,
          supportEmail: form.supportEmail,
        }),
      });
      if (!res.ok) {
        setMessage("Could not save changes.");
        return;
      }
      const data = (await res.json()) as { profile: Profile };
      setProfile(data.profile);
      setMessage("Saved.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center text-sm text-muted">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Reveal>
        <div className="card-interactive space-y-6 p-6 md:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">Business details</h2>
            <p className="text-sm text-muted">Shown on offers and customer messages</p>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSave}>
            <Input
              label="Business name"
              name="name"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
            />
            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
            <Input
              label="Country"
              name="country"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
            <Input
              label="Currency"
              name="currency"
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            />
            <Input
              label="Timezone"
              name="timezone"
              value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              className="md:col-span-2"
            />
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <Input
              label="Support email"
              name="supportEmail"
              value={form.supportEmail}
              onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
            />
            <div className="md:col-span-2">
              <TextArea
                label="Public description"
                name="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {message ? <span className="text-sm text-muted">{message}</span> : null}
            </div>
          </form>
        </div>
      </Reveal>

      <Reveal delay={1}>
        <div className="card-interactive space-y-6 p-6 md:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">WhatsApp</h2>
            <p className="text-sm text-muted">Send offers and reminders via WhatsApp Business</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={form.whatsapp ? "active" : "paused"}>
              {form.whatsapp ? "Connected" : "Disabled"}
            </Badge>
          </div>
          <Input
            label="WhatsApp number"
            name="whatsapp"
            value={form.whatsapp}
            onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() => {
              void (async () => {
                setSaving(true);
                setMessage(null);
                try {
                  const res = await fetch("/api/profile", {
                    method: "PATCH",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ whatsapp: form.whatsapp }),
                  });
                  setMessage(res.ok ? "WhatsApp saved." : "Could not save.");
                } finally {
                  setSaving(false);
                }
              })();
            }}
          >
            Save WhatsApp
          </Button>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="card-interactive space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Subscription</h2>
              <p className="text-sm text-muted">Plan from your account</p>
            </div>
            <Badge variant="active">{profile.plan ?? "Free Trial"}</Badge>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Plan</dt>
              <dd className="mt-1 font-medium capitalize">{profile.plan ?? "Free Trial"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Account email</dt>
              <dd className="mt-1 font-medium">{profile.email ?? profile.supportEmail ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </Reveal>
    </div>
  );
}
