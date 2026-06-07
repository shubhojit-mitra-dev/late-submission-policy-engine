import { useState } from "react";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { LatePolicy } from "./PolicyEditor";
import { fetchApi } from "../api/client";

interface Props {
  policy: LatePolicy;
}

interface CalcResult {
  status: "ACCEPTED" | "LATE_ACCEPTED" | "REJECTED";
  rawScore: number;
  finalScore: number;
  penaltyApplied: number;
  latenessHours: number;
  effectiveLatenessHours: number;
  reason: string;
}

const inputClass =
  "w-full bg-input-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors mono text-sm";

export function ScoreCalculator({ policy }: Props) {
  const [rawScore, setRawScore] = useState(87);
  const [hoursLate, setHoursLate] = useState(0);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function calculate() {
    if (!policy.id) {
        setError("Please save the policy first to evaluate it.");
        return;
    }
    
    // We need a policyVersionId, but since the frontend only has `policy.id`, we need the latest version.
    // We added `versions` to the LatePolicy interface. Let's use the first version for now.
    const versionId = policy.versions && policy.versions.length > 0 
        ? policy.versions[0].id 
        : null;

    if (!versionId) {
        setError("This policy has no versions assigned yet. Try saving it again.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchApi<CalcResult>("/policies/evaluate", {
        method: "POST",
        body: JSON.stringify({
          policyVersionId: versionId,
          originalScore: rawScore,
          hoursLate: hoursLate
        })
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  const statusConfig = {
    ACCEPTED: { label: "On Time / Within Grace", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
    LATE_ACCEPTED: { label: "Late — Penalty Applied", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
    REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
  };

  const cfg = result ? statusConfig[result.status] : null;
  const StatusIcon = cfg?.icon ?? CheckCircle;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
          <h3 className="text-sm text-foreground">Score Evaluation: <span className="font-semibold">{policy.name}</span></h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Backend API</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5">Original Score (points)</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={rawScore}
                onChange={(e) => setRawScore(Math.max(0, +e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">Hours Late</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={hoursLate}
                onChange={(e) => setHoursLate(Math.max(0, +e.target.value))}
              />
            </div>
          </div>
          
          <button
            onClick={calculate}
            disabled={isLoading || !policy.id}
            className={`w-full py-2.5 rounded-md text-sm transition-all ${
              isLoading || !policy.id
                ? "bg-primary/50 text-white cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isLoading ? "Evaluating..." : !policy.id ? "Save Policy First" : "Evaluate Score"}
          </button>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </div>
      </div>

      {result && cfg && (
        <div className="space-y-3">
          <div className={`border rounded-lg px-5 py-4 flex items-center gap-3 ${cfg.bg}`}>
            <StatusIcon size={20} className={cfg.color} />
            <div>
              <div className={`text-sm ${cfg.color}`}>{cfg.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{result.reason}</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Original Score</div>
                <div className="mono text-2xl text-foreground">{result.rawScore.toFixed(1)}</div>
              </div>
              {result.penaltyApplied > 0 && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Penalty</div>
                  <div className="mono text-2xl text-destructive">−{result.penaltyApplied}</div>
                </div>
              )}
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Final Score</div>
                <div className={`mono text-2xl ${result.finalScore < result.rawScore ? "text-amber-600" : "text-emerald-600"}`}>
                  {result.finalScore.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
