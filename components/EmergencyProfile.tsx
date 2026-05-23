"use client";

import type { EmergencyProfile } from "@/lib/types";

type Props = {
  profile: EmergencyProfile;
  onChange: (profile: EmergencyProfile) => void;
  disabled?: boolean;
};

export function EmergencyProfileForm({ profile, onChange, disabled }: Props) {
  const update = (field: keyof EmergencyProfile, value: string) => {
    onChange({ ...profile, [field]: value });
  };

  return (
    <section className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-red-400">
          Emergency Profile
        </p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100">
          Caller Information
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pre-fill details the AI can relay if you cannot speak.
        </p>
      </div>

      <div className="space-y-3">
        <Field
          label="Name"
          value={profile.name}
          onChange={(v) => update("name", v)}
          disabled={disabled}
        />
        <Field
          label="Location"
          value={profile.location}
          onChange={(v) => update("location", v)}
          disabled={disabled}
        />
        <Field
          label="Emergency type"
          value={profile.emergencyType}
          onChange={(v) => update("emergencyType", v)}
          disabled={disabled}
        />
        <Field
          label="Medical notes"
          value={profile.medicalNotes}
          onChange={(v) => update("medicalNotes", v)}
          disabled={disabled}
          multiline
        />
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 disabled:opacity-50";

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <input
          type="text"
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </label>
  );
}
