import { useState } from "react";
import { Info } from "lucide-react";

export interface LatePolicy {
  id?: string;
  name: string;
  description: string;
  penaltyType: "FIXED" | "PERCENTAGE";
  penaltyValue: number;
  graceHours: number;
  maxPenalty: number;
  rejectAfterDays: number;
  active: boolean;
  versions?: { id: string; versionNumber: number }[];
}

export const DEFAULT_POLICY: LatePolicy = {
  name: "New Policy",
  description: "",
  penaltyType: "PERCENTAGE",
  penaltyValue: 10,
  graceHours: 24,
  maxPenalty: 50,
  rejectAfterDays: 7,
  active: true,
};

interface Props {
  policy: LatePolicy;
  onChange: (p: LatePolicy) => void;
  onSave: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
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

export function PolicyEditor({ policy, onChange, onSave, onDelete, isSaving }: Props) {
  function set<K extends keyof LatePolicy>(key: K, val: LatePolicy[K]) {
    onChange({ ...policy, [key]: val });
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Policy Identity">
        <div>
          <FieldLabel label="Policy Name" />
          <input
            className={inputClass}
            value={policy.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel label="Description" />
          <textarea
            className={inputClass}
            rows={2}
            value={policy.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Active Policy</p>
            <p className="text-xs text-muted-foreground mt-0.5">Can be assigned to new assignments</p>
          </div>
          <button
            onClick={() => set("active", !policy.active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              policy.active ? "bg-primary" : "bg-switch-background"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                policy.active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Penalty Rules">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Penalty Type" />
            <select
              className={selectClass + " w-full"}
              value={policy.penaltyType}
              onChange={(e) => set("penaltyType", e.target.value as "FIXED" | "PERCENTAGE")}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Points</option>
            </select>
          </div>
          <div>
            <FieldLabel label="Penalty Value (per day)" hint="Amount deducted per calendar day late" />
            <input
              type="number"
              min={0}
              className={inputClass}
              value={policy.penaltyValue}
              onChange={(e) => set("penaltyValue", Math.max(0, +e.target.value))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Max Penalty Cap" hint="Maximum deduction allowed regardless of lateness" />
            <input
              type="number"
              min={0}
              className={inputClass}
              value={policy.maxPenalty || 0}
              onChange={(e) => set("maxPenalty", Math.max(0, +e.target.value))}
            />
          </div>
          <div>
            <FieldLabel label="Grace Period (Hours)" hint="No penalty applied if submitted within this window" />
            <input
              type="number"
              min={0}
              className={inputClass}
              value={policy.graceHours}
              onChange={(e) => set("graceHours", Math.max(0, +e.target.value))}
            />
          </div>
        </div>
        <div>
          <FieldLabel label="Reject After (Days)" hint="Submissions are completely rejected after this many days late (0 means never reject)" />
          <input
            type="number"
            min={0}
            className={inputClass}
            value={policy.rejectAfterDays}
            onChange={(e) => set("rejectAfterDays", Math.max(0, +e.target.value))}
          />
        </div>
      </SectionCard>

      <div className="flex gap-3">
        {policy.id && onDelete && (
          <button
            onClick={onDelete}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-md text-sm transition-all border border-destructive/30 text-destructive hover:bg-destructive/10 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        )}
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`flex-1 py-2.5 rounded-md text-sm transition-all flex items-center justify-center gap-2 ${
            isSaving
              ? "bg-primary/50 text-white cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]"
          }`}
        >
          {isSaving ? "Saving..." : "Save Policy"}
        </button>
      </div>
    </div>
  );
}
