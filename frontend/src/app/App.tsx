import { useState } from "react";
import { Settings, Calculator, Table2, BookOpen, ChevronRight } from "lucide-react";
import { PolicyEditor, DEFAULT_POLICY } from "./components/PolicyEditor";
import type { LatePolicy } from "./components/PolicyEditor";
import { ScoreCalculator } from "./components/ScoreCalculator";
import { AssignmentOverrides } from "./components/AssignmentOverrides";

/* MARKER-MAKE-KIT-INVOKED */

type Tab = "policy" | "calculator" | "assignments";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "policy", label: "Policy Configuration", icon: Settings },
  { id: "calculator", label: "Score Preview", icon: Calculator },
  { id: "assignments", label: "Assignment Overrides", icon: Table2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("policy");
  const [policy, setPolicy] = useState<LatePolicy>(DEFAULT_POLICY);
  const [savedPolicies, setSavedPolicies] = useState<LatePolicy[]>([DEFAULT_POLICY]);

  function handleSave() {
    setSavedPolicies((prev) => {
      const exists = prev.find((p) => p.id === policy.id);
      if (exists) return prev.map((p) => (p.id === policy.id ? policy : p));
      return [...prev, policy];
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-primary text-primary-foreground border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <BookOpen size={20} className="text-primary-foreground/70" />
          <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
            <span>LMS Admin</span>
            <ChevronRight size={14} />
            <span className="text-primary-foreground">Late Submission Policy Engine</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-foreground mb-1">Late Submission Policies</h1>
          <p className="text-muted-foreground text-sm">
            Configure grace periods and penalty rules, preview score adjustments, and manage per-assignment overrides.
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar nav */}
          <nav className="w-52 shrink-0 sticky top-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors border-b border-border last:border-b-0 ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Active policy summary */}
            <div className="mt-4 bg-card border border-border rounded-lg p-4 space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Active Policy</div>
              <div className="text-sm text-foreground">{policy.name}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Grace</span>
                  <span className="mono text-foreground">
                    {policy.gracePeriodEnabled
                      ? `${policy.gracePeriodValue}${policy.gracePeriodUnit === "hours" ? "h" : "d"}`
                      : "off"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Penalty</span>
                  <span className="mono text-foreground capitalize">{policy.penaltyMode.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Accept late</span>
                  <span className={`mono text-xs ${policy.acceptAfterDeadline ? "text-emerald-600" : "text-destructive"}`}>
                    {policy.acceptAfterDeadline ? "yes" : "no"}
                  </span>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === "policy" && (
              <PolicyEditor policy={policy} onChange={setPolicy} onSave={handleSave} />
            )}
            {activeTab === "calculator" && (
              <ScoreCalculator policy={policy} />
            )}
            {activeTab === "assignments" && (
              <AssignmentOverrides savedPolicies={savedPolicies} />
            )}
          </main>
        </div>
      </div>

      <footer className="border-t border-border py-4 px-6 mt-auto">
        <div className="max-w-6xl mx-auto text-xs text-muted-foreground">
          Late Submission Policy Engine · LMS Admin v2.4 · All score adjustments are computed in real-time and applied at grade export.
        </div>
      </footer>
    </div>
  );
}
