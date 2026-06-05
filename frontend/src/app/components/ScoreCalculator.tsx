import { useState, useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import type { LatePolicy } from "./PolicyEditor";

interface Props {
  policy: LatePolicy;
}

interface CalcResult {
  status: "on_time" | "grace" | "penalized" | "rejected";
  rawScore: number;
  adjustedScore: number;
  penaltyPct: number;
  daysLate: number;
  hoursLate: number;
  breakdown: string[];
}

function calcScore(policy: LatePolicy, rawScore: number, dueDate: Date, submissionDate: Date): CalcResult {
  const diffMs = submissionDate.getTime() - dueDate.getTime();
  const hoursLate = Math.max(0, diffMs / (1000 * 60 * 60));
  const daysLate = hoursLate / 24;

  const breakdown: string[] = [];

  if (hoursLate <= 0) {
    breakdown.push("Submitted on time — no penalty applied.");
    return { status: "on_time", rawScore, adjustedScore: rawScore, penaltyPct: 0, daysLate: 0, hoursLate: 0, breakdown };
  }

  if (!policy.acceptAfterDeadline) {
    breakdown.push("Policy rejects all late submissions.");
    return { status: "rejected", rawScore, adjustedScore: 0, penaltyPct: 100, daysLate, hoursLate, breakdown };
  }

  // Check grace period
  if (policy.gracePeriodEnabled) {
    const graceLimitHours = policy.gracePeriodUnit === "hours"
      ? policy.gracePeriodValue
      : policy.gracePeriodValue * 24;
    if (hoursLate <= graceLimitHours) {
      breakdown.push(`Within grace period (${policy.gracePeriodValue} ${policy.gracePeriodUnit}) — treated as on-time.`);
      return { status: "grace", rawScore, adjustedScore: rawScore, penaltyPct: 0, daysLate, hoursLate, breakdown };
    }
    breakdown.push(`Grace period (${policy.gracePeriodValue} ${policy.gracePeriodUnit}) elapsed.`);
  }

  let penaltyPct = 0;

  if (policy.penaltyMode === "none") {
    breakdown.push("No penalty mode selected — score unchanged.");
  } else if (policy.penaltyMode === "flat") {
    penaltyPct = policy.flatDeductionPct;
    breakdown.push(`Flat deduction: −${penaltyPct}% applied.`);
  } else if (policy.penaltyMode === "per_day") {
    const fullDays = Math.ceil(daysLate);
    penaltyPct = Math.min(fullDays * policy.perDayDeductionPct, policy.maxPenaltyCap);
    breakdown.push(`${fullDays} day(s) late × ${policy.perDayDeductionPct}% = ${fullDays * policy.perDayDeductionPct}% raw penalty.`);
    if (fullDays * policy.perDayDeductionPct > policy.maxPenaltyCap) {
      breakdown.push(`Capped at maximum penalty of ${policy.maxPenaltyCap}%.`);
    }
  } else if (policy.penaltyMode === "tiered") {
    const sorted = [...policy.tiers].sort((a, b) => a.upToDays - b.upToDays);
    const matchedTier = sorted.find((t) => daysLate <= t.upToDays);
    if (matchedTier) {
      penaltyPct = matchedTier.deductionPct;
      breakdown.push(`Submission falls in tier "≤ ${matchedTier.upToDays} day(s)" → −${penaltyPct}%.`);
    } else {
      penaltyPct = 100;
      breakdown.push("Submission exceeds all tiers — rejected (or max penalty applied).");
    }
  }

  const adjustedScore = Math.max(0, rawScore * (1 - penaltyPct / 100));
  return { status: "penalized", rawScore, adjustedScore, penaltyPct, daysLate, hoursLate, breakdown };
}

const inputClass =
  "w-full bg-input-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors mono text-sm";

const selectClass =
  "bg-input-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm appearance-none cursor-pointer w-full pr-8";

export function ScoreCalculator({ policy }: Props) {
  const [rawScore, setRawScore] = useState(87);
  const [dueDate, setDueDate] = useState("2025-04-15T23:59");
  const [submitDate, setSubmitDate] = useState("2025-04-17T14:30");

  const result = useMemo(() => {
    try {
      return calcScore(policy, rawScore, new Date(dueDate), new Date(submitDate));
    } catch {
      return null;
    }
  }, [policy, rawScore, dueDate, submitDate]);

  const statusConfig = {
    on_time: { label: "On Time", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
    grace: { label: "Within Grace Period", color: "text-violet-700", bg: "bg-violet-50 border-violet-200", icon: Clock },
    penalized: { label: "Late — Penalty Applied", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
    rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
  };

  const cfg = result ? statusConfig[result.status] : null;
  const StatusIcon = cfg?.icon ?? CheckCircle;

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/40">
          <h3 className="text-sm text-foreground">Submission Details</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-foreground mb-1.5">Raw Score (points)</label>
            <input
              type="number"
              min={0}
              max={1000}
              className={inputClass}
              value={rawScore}
              onChange={(e) => setRawScore(Math.max(0, +e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm text-foreground mb-1.5">Due Date & Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-foreground mb-1.5">Submission Date & Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={submitDate}
              onChange={(e) => setSubmitDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Result */}
      {result && cfg && (
        <div className="space-y-3">
          <div className={`border rounded-lg px-5 py-4 flex items-center gap-3 ${cfg.bg}`}>
            <StatusIcon size={20} className={cfg.color} />
            <div>
              <div className={`text-sm ${cfg.color}`}>{cfg.label}</div>
              {result.hoursLate > 0 && (
                <div className="text-xs text-muted-foreground mt-0.5 mono">
                  {result.hoursLate.toFixed(1)}h late ({result.daysLate.toFixed(2)} days)
                </div>
              )}
            </div>
          </div>

          {/* Score bar */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Raw Score</div>
                <div className="mono text-2xl text-foreground">{result.rawScore.toFixed(1)}</div>
              </div>
              {result.penaltyPct > 0 && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Penalty</div>
                  <div className="mono text-2xl text-destructive">−{result.penaltyPct}%</div>
                </div>
              )}
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Final Score</div>
                <div className={`mono text-2xl ${result.adjustedScore < result.rawScore ? "text-amber-600" : "text-emerald-600"}`}>
                  {result.adjustedScore.toFixed(1)}
                </div>
              </div>
            </div>

            {/* progress bar */}
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(result.adjustedScore / Math.max(result.rawScore, 1)) * 100}%` }}
              />
            </div>
            {result.penaltyPct > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>0</span>
                <span className="mono">{result.adjustedScore.toFixed(1)} / {result.rawScore}</span>
                <span>{result.rawScore}</span>
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-secondary/40">
              <h3 className="text-sm text-foreground">Calculation Breakdown</h3>
            </div>
            <ul className="divide-y divide-border">
              {result.breakdown.map((step, i) => (
                <li key={i} className="px-5 py-3 flex gap-3">
                  <span className="mono text-xs text-muted-foreground mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="text-sm text-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
