"use client";

import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/Input";
import { type FormEvent, useState } from "react";

export default function AdminAccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/profile/password", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) { setError(data.message ?? "Could not change password."); return; }
      setMessage(data.message ?? "Password changed successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-2xl">
    <form onSubmit={submit} className="card-interactive space-y-5 p-6 md:p-8">
      <div><h2 className="font-display text-xl font-semibold">Change admin password</h2><p className="mt-1 text-sm text-muted">Use at least 8 characters with one uppercase letter and one number.</p></div>
      <PasswordField label="Current password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
      <PasswordField label="New password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
      <PasswordField label="Confirm new password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
      {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
      <Button type="submit" disabled={saving}>{saving ? "Changing password..." : "Change password"}</Button>
    </form>
  </div>;
}
