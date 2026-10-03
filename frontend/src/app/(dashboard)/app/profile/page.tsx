"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, PasswordField, TextArea } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import ProfileLoading from "./loading";

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
  logoUrl?: string;
};

function broadcastLogo(logoUrl: string, businessName?: string) {
  window.dispatchEvent(
    new CustomEvent("upsale:logo", { detail: { logoUrl, businessName } }),
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
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
      setLogoUrl(p.logoUrl ?? "");
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

  async function onLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLogoError(null);
    setLogoMessage(null);

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setLogoError("Only PNG, JPG, or WebP images are allowed.");
      return;
    }
    if (file.size > 1_500_000) {
      setLogoError("Logo must be under 1.5 MB.");
      return;
    }

    setLogoBusy(true);
    try {
      const logoPreview = await readFileAsDataUrl(file);
      const res = await fetch("/api/profile/logo", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoPreview }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        logoUrl?: string;
        message?: string;
        profile?: Profile;
      };
      if (!res.ok || !data.ok) {
        setLogoError(data.message ?? "Could not update logo.");
        return;
      }
      const nextUrl = data.logoUrl ?? "";
      setLogoUrl(nextUrl);
      if (data.profile) setProfile(data.profile);
      broadcastLogo(nextUrl, form.businessName || profile?.businessName);
      setLogoMessage("Logo updated.");
    } catch {
      setLogoError("Could not update logo.");
    } finally {
      setLogoBusy(false);
    }
  }

  async function onRemoveLogo() {
    setLogoBusy(true);
    setLogoError(null);
    setLogoMessage(null);
    try {
      const res = await fetch("/api/profile/logo", {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        profile?: Profile;
      };
      if (!res.ok || !data.ok) {
        setLogoError(data.message ?? "Could not remove logo.");
        return;
      }
      setLogoUrl("");
      if (data.profile) setProfile(data.profile);
      broadcastLogo("", form.businessName || profile?.businessName);
      setLogoMessage("Logo removed.");
    } catch {
      setLogoError("Could not remove logo.");
    } finally {
      setLogoBusy(false);
    }
  }

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
      broadcastLogo(logoUrl, data.profile.businessName ?? form.businessName);
      setMessage("Saved.");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage(null);
    setPasswordError(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setPasswordError(data.message ?? "Could not update password.");
        return;
      }
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage(data.message ?? "Password updated.");
    } finally {
      setPasswordSaving(false);
    }
  }

  if (!profile) {
    return <ProfileLoading />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Reveal>
        <div className="card-interactive space-y-6 p-6 md:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">Business details</h2>
            <p className="text-sm text-muted">Shown on offers and customer messages</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-surface text-sm font-semibold text-brand-to">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Business logo" className="h-full w-full object-cover" />
              ) : (
                "Logo"
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">Business logo</p>
              <p className="text-xs text-muted">PNG, JPG, or WebP · under 1.5 MB</p>
              {logoError ? <p className="text-sm text-red-400">{logoError}</p> : null}
              {logoMessage ? <p className="text-sm text-muted">{logoMessage}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onLogoChange}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={logoBusy}
                onClick={() => fileRef.current?.click()}
              >
                {logoBusy ? "Updating…" : logoUrl ? "Change logo" : "Upload logo"}
              </Button>
              {logoUrl ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={logoBusy}
                  onClick={() => void onRemoveLogo()}
                >
                  Remove
                </Button>
              ) : null}
            </div>
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
        <div className="card-interactive space-y-6 p-6 md:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">Change password</h2>
            <p className="text-sm text-muted">
              Use your current password, then choose a new one (min 8 characters, 1 uppercase, 1 number).
            </p>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onChangePassword}>
            <PasswordField
              label="Current password"
              name="currentPassword"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
              }
              required
              wrapperClassName="md:col-span-2"
            />
            <PasswordField
              label="New password"
              name="newPassword"
              autoComplete="new-password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              required
            />
            <PasswordField
              label="Confirm new password"
              name="confirmPassword"
              autoComplete="new-password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              required
            />
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving ? "Updating…" : "Update password"}
              </Button>
              {passwordError ? (
                <span className="text-sm text-red-400">{passwordError}</span>
              ) : null}
              {passwordMessage ? (
                <span className="text-sm text-muted">{passwordMessage}</span>
              ) : null}
            </div>
          </form>
        </div>
      </Reveal>

      <Reveal delay={3}>
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
