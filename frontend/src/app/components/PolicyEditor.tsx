import { useState } from "react";
import { Info, ChevronDown } from "lucide-react";

export type PenaltyMode = "none" | "flat" | "per_day" | "tiered";
export type GraceUnit = "hours" | "days";

export interface TierRule {
  upToDays: number;
  deductionPct: number;
}

export interface LatePolicy {
  id: string;
  name: string;
  gracePeriodEnabled: boolean;
  gracePeriodValue: number;
  gracePeriodUnit: GraceUnit;
  penaltyMode: PenaltyMode;
  flatDeductionPct: number;
  perDayDeductionPct: number;
  maxPenaltyCap: number;
  tiers: TierRule[];
  acceptAfterDeadline: boolean;
}

export const DEFAULT_POLICY: LatePolicy = {
  id: "default",
  name: "Default Policy",
  gracePeriodEnabled: true,
  gracePeriodValue: 24,
  gracePeriodUnit: "hours",
  penaltyMode: "per_day",
  flatDeductionPct: 10,
  perDayDeductionPct: 10,
  maxPenaltyCap: 50,
  tiers: [
    { upToDays: 1, deductionPct: 10 },
    { upToDays: 3, deductionPct: 25 },
    { upToDays: 7, deductionPct: 50 },
  ],
  acceptAfterDeadline: true,
};

interface Props {
  policy: LatePolicy;
  onChange: (p: LatePolicy) => void;
  onSave: () => void;
}

const inputClass =
  "w-full bg-input-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors mono text-sm";

const selectClass =
  "bg-input-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm appearance-none cursor-pointer";

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-sm text-foreground">{label}</span>
      {hint && (
        <div className="group relative">
          <Info size={13} className="text-muted-foreground cursor-help" />
          <div className="absolute left-5 top-0 z-10 hidden group-hover:block bg-foreground text-primary-foreground text-xs rounded px-2 py-1 w-52 leading-relaxed shadow-lg">
            {hint}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-secondary/40">
        <h3 className="text-sm text-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export function PolicyEditor({ policy, onChange, onSave }: Props) {
  const [saved, setSaved] = useState(false);

  function set<K extends keyof LatePolicy>(key: K, val: LatePolicy[K]) {
    onChange({ ...policy, [key]: val });
  }

  function handleSave() {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateTier(i: number, field: keyof TierRule, val: number) {
    const tiers = policy.tiers.map((t, idx) => (idx === i ? { ...t, [field]: val } : t));
    set("tiers", tiers);
  }

  function addTier() {
    set("tiers", [...policy.tiers, { upToDays: 14, deductionPct: 75 }]);
  }

  function removeTier(i: number) {
    set("tiers", policy.tiers.filter((_, idx) => idx !== i));
  }

  const penaltyOptions: { value: PenaltyMode; label: string; desc: string }[] = [
    { value: "none", label: "No Penalty", desc: "Accept late work without score adjustment" },
    { value: "flat", label: "Flat Deduction", desc: "Deduct a fixed % from the final score" },
    { value: "per_day", label: "Per-Day Deduction", desc: "Deduct a % for each calendar day late" },
    { value: "tiered", label: "Tiered Penalty", desc: "Different deductions based on how late" },
  ];

  return (
    <div className="space-y-4">
      {/* Policy name */}
      <SectionCard title="Policy Identity">
        <div>
          <FieldLabel label="Policy Name" />
          <input
            className={inputClass}
            value={policy.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Accept submissions after deadline</p>
            <p className="text-xs text-muted-foreground mt-0.5">If disabled, late submissions are rejected outright</p>
          </div>
          <button
            onClick={() => set("acceptAfterDeadline", !policy.acceptAfterDeadline)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              policy.acceptAfterDeadline ? "bg-primary" : "bg-switch-background"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                policy.acceptAfterDeadline ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </SectionCard>

      {/* Grace Period */}
      <SectionCard title="Grace Period">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Enable grace period</p>
            <p className="text-xs text-muted-foreground mt-0.5">No penalty applied within this window</p>
          </div>
          <button
            onClick={() => set("gracePeriodEnabled", !policy.gracePeriodEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              policy.gracePeriodEnabled ? "bg-primary" : "bg-switch-background"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                policy.gracePeriodEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {policy.gracePeriodEnabled && (
          <div className="flex gap-3">
            <div className="flex-1">
              <FieldLabel label="Duration" hint="Submissions within this window are treated as on-time" />
              <input
                type="number"
                min={1}
                className={inputClass}
                value={policy.gracePeriodValue}
                onChange={(e) => set("gracePeriodValue", Math.max(1, +e.target.value))}
              />
            </div>
            <div className="w-32">
              <FieldLabel label="Unit" />
              <div className="relative">
                <select
                  className={selectClass + " w-full pr-8"}
                  value={policy.gracePeriodUnit}
                  onChange={(e) => set("gracePeriodUnit", e.target.value as GraceUnit)}
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Penalty Mode */}
      <SectionCard title="Penalty Configuration">
        <div>
          <FieldLabel label="Penalty Mode" />
          <div className="grid grid-cols-2 gap-2">
            {penaltyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => set("penaltyMode", opt.value)}
                className={`text-left px-3 py-2.5 rounded-md border text-sm transition-all ${
                  policy.penaltyMode === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <div className="text-[13px]">{opt.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {policy.penaltyMode === "flat" && (
          <div>
            <FieldLabel label="Flat Deduction (%)" hint="This percentage is subtracted from the raw score" />
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={policy.flatDeductionPct}
              onChange={(e) => set("flatDeductionPct", Math.min(100, Math.max(0, +e.target.value)))}
            />
          </div>
        )}

        {policy.penaltyMode === "per_day" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel label="Deduction per Day (%)" hint="Applied for each calendar day past the deadline (or grace period)" />
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={policy.perDayDeductionPct}
                onChange={(e) => set("perDayDeductionPct", Math.min(100, Math.max(0, +e.target.value)))}
              />
            </div>
            <div>
              <FieldLabel label="Maximum Cap (%)" hint="Penalty will not exceed this value regardless of lateness" />
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={policy.maxPenaltyCap}
                onChange={(e) => set("maxPenaltyCap", Math.min(100, Math.max(0, +e.target.value)))}
              />
            </div>
          </div>
        )}

        {policy.penaltyMode === "tiered" && (
          <div>
            <FieldLabel label="Penalty Tiers" hint="Tiers are applied based on how many days late the submission is" />
            <div className="space-y-2">
              {policy.tiers.map((tier, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-14 shrink-0">≤ day</span>
                  <input
                    type="number"
                    min={1}
                    className={inputClass + " w-20"}
                    value={tier.upToDays}
                    onChange={(e) => updateTier(i, "upToDays", Math.max(1, +e.target.value))}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">deduct</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass + " w-20"}
                    value={tier.deductionPct}
                    onChange={(e) => updateTier(i, "deductionPct", Math.min(100, Math.max(0, +e.target.value)))}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">%</span>
                  <button
                    onClick={() => removeTier(i)}
                    className="ml-auto text-xs text-destructive hover:text-destructive/70 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                Submissions later than the last tier are rejected (or use max tier penalty).
              </div>
            </div>
            <button
              onClick={addTier}
              className="text-sm text-primary hover:text-primary/70 transition-colors"
            >
              + Add tier
            </button>
          </div>
        )}

        {policy.penaltyMode !== "none" && policy.penaltyMode !== "flat" && policy.penaltyMode !== "tiered" && (
          <div>
            <FieldLabel label="Maximum Penalty Cap (%)" />
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={policy.maxPenaltyCap}
              onChange={(e) => set("maxPenaltyCap", Math.min(100, Math.max(0, +e.target.value)))}
            />
          </div>
        )}
      </SectionCard>

      <button
        onClick={handleSave}
        className={`w-full py-2.5 rounded-md text-sm transition-all ${
          saved
            ? "bg-emerald-600 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]"
        }`}
      >
        {saved ? "Policy Saved ✓" : "Save Policy"}
      </button>
    </div>
  );
}
