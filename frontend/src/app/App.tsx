import { useState, useEffect } from "react";
import { Settings, Calculator, Table2, BookOpen, ChevronRight, Plus } from "lucide-react";
import { PolicyEditor, DEFAULT_POLICY } from "./components/PolicyEditor";
import type { LatePolicy } from "./components/PolicyEditor";
import { ScoreCalculator } from "./components/ScoreCalculator";
import { AssignmentOverrides } from "./components/AssignmentOverrides";
import { fetchApi } from "./api/client";
import { SubmissionsView } from "./components/SubmissionsView";

type Tab = "policy" | "calculator" | "assignments" | "submissions";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "policy", label: "Policy Configuration", icon: Settings },
  { id: "calculator", label: "Score Preview", icon: Calculator },
  { id: "assignments", label: "Assignment Overrides", icon: Table2 },
  { id: "submissions", label: "Submissions", icon: BookOpen },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("policy");
  const [policies, setPolicies] = useState<LatePolicy[]>([]);
  const [activePolicy, setActivePolicy] = useState<LatePolicy>(DEFAULT_POLICY);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  async function loadPolicies(selectedId?: string) {
    try {
      setLoading(true);
      const data = await fetchApi<LatePolicy[]>("/policies");
      setPolicies(data);
      if (data.length > 0) {
        let toSelect = data[0];
        if (selectedId) {
            toSelect = data.find(p => p.id === selectedId) || data[0];
        } else if (activePolicy.id) {
            toSelect = data.find(p => p.id === activePolicy.id) || data[0];
        }
        setActivePolicy(toSelect);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      let targetId = activePolicy.id;
      if (targetId) {
        // Update
        await fetchApi<LatePolicy>(`/policies/${targetId}`, {
          method: "PUT",
          body: JSON.stringify(activePolicy),
        });
      } else {
        // Create
        const res = await fetchApi<LatePolicy>("/policies", {
          method: "POST",
          body: JSON.stringify(activePolicy),
        });
        targetId = res.id;
      }
      await loadPolicies(targetId);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePolicy() {
    if (!activePolicy.id) return;
    if (!confirm("Are you sure you want to delete this policy? This cannot be undone.")) return;
    try {
      setIsSaving(true);
      await fetchApi(`/policies/${activePolicy.id}`, { method: "DELETE" });
      setActivePolicy(DEFAULT_POLICY);
      await loadPolicies();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCreateNew() {
    setActivePolicy(DEFAULT_POLICY);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <div className="mb-8">
          <h1 className="text-foreground mb-1">Late Submission Policies</h1>
          <p className="text-muted-foreground text-sm">
            Configure grace periods and penalty rules, preview score adjustments, and manage per-assignment overrides.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-8 items-start">
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

            {activeTab === "policy" && (
              <div className="mt-4 bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Saved Policies</h3>
                  <button onClick={handleCreateNew} className="text-primary hover:text-primary/70">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-xs text-muted-foreground text-center">Loading...</div>
                  ) : policies.length === 0 ? (
                    <div className="p-4 text-xs text-muted-foreground text-center">No policies found</div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {policies.map(p => (
                        <li key={p.id}>
                          <button
                            onClick={() => setActivePolicy(p)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              activePolicy.id === p.id ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            }`}
                          >
                            <div className="truncate">{p.name}</div>
                            <div className="text-[10px] uppercase opacity-70 mt-0.5">{p.penaltyType} • {p.penaltyValue}{p.penaltyType === 'PERCENTAGE' ? '%' : 'pts'} / day</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </nav>

          <main className="flex-1 min-w-0">
            {activeTab === "policy" && (
              <PolicyEditor
                policy={activePolicy}
                onChange={setActivePolicy}
                onSave={handleSave}
                onDelete={handleDeletePolicy}
                isSaving={isSaving}
              />
            )}
            {activeTab === "calculator" && (
              <ScoreCalculator policy={activePolicy} />
            )}
            {activeTab === "assignments" && (
              <AssignmentOverrides savedPolicies={policies} />
            )}
            {activeTab === "submissions" && (
              <SubmissionsView />
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
