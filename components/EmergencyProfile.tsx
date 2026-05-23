"use client";

import { detectLocationLabel } from "@/lib/detect-location";
import type { EmergencyProfile } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

const LOCATION_MANUAL_KEY = "silentsos-location-manual";

type Props = {
  profile: EmergencyProfile;
  onChange: (profile: EmergencyProfile) => void;
  disabled?: boolean;
};

export function EmergencyProfileForm({ profile, onChange, disabled }: Props) {
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "detecting" | "error"
  >("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const autoDetectAttempted = useRef(false);

  const update = (field: keyof EmergencyProfile, value: string) => {
    if (field === "location") {
      localStorage.setItem(LOCATION_MANUAL_KEY, "true");
    }
    onChange({ ...profile, [field]: value });
  };

  const runLocationDetect = useCallback(async () => {
    if (disabled) return;

    setLocationStatus("detecting");
    setLocationError(null);

    const result = await detectLocationLabel();
    if (result.ok) {
      localStorage.setItem(LOCATION_MANUAL_KEY, "false");
      onChange({ ...profile, location: result.label });
      setLocationStatus("idle");
      return;
    }

    setLocationError(result.error);
    setLocationStatus("error");
  }, [disabled, onChange, profile]);

  useEffect(() => {
    if (disabled || autoDetectAttempted.current) return;
    if (localStorage.getItem(LOCATION_MANUAL_KEY) === "true") return;
    if (profile.location.trim()) return;

    autoDetectAttempted.current = true;
    void runLocationDetect();
  }, [disabled, profile.location, runLocationDetect]);

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
          placeholder="Your name"
        />
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Location
            </span>
            <button
              type="button"
              onClick={() => void runLocationDetect()}
              disabled={disabled || locationStatus === "detecting"}
              className="text-xs text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locationStatus === "detecting" ? "Detecting…" : "Use my location"}
            </button>
          </div>
          <input
            type="text"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 disabled:opacity-50"
            value={profile.location}
            onChange={(e) => update("location", e.target.value)}
            disabled={disabled}
            placeholder={
              locationStatus === "detecting"
                ? "Detecting your location…"
                : "City, district — or tap Use my location"
            }
          />
          {locationError && (
            <p className="mt-1 text-xs text-amber-400/90">{locationError}</p>
          )}
        </div>
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  placeholder?: string;
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
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
