import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { LatePolicy } from "./PolicyEditor";
import { fetchApi } from "../api/client";

export interface AssignmentPolicyMapping {
  id: string;
  assignmentId: string;
  policyVersionId: string;
  assignedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseCode: string;
  dueDate: string;
  createdBy: string;
  activePolicyMapping?: AssignmentPolicyMapping | null;
}

interface Props {
  savedPolicies: LatePolicy[];
}

export function AssignmentOverrides({ savedPolicies }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPolicyId, setEditPolicyId] = useState<string>("");

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPolicyId, setNewPolicyId] = useState<string>("");

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      setIsLoading(true);
      const data = await fetchApi<Assignment[]>("/assignments");
      setAssignments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // To display the policy name for an assignment, we need to find which policy owns the assigned policyVersionId
  function getPolicyNameByVersionId(versionId: string | undefined): string {
    if (!versionId) return "No Policy";
    for (const p of savedPolicies) {
      if (p.versions?.some(v => v.id === versionId)) {
        return p.name;
      }
    }
    return "Unknown Policy";
  }

  // For the edit/create dropdowns, we let the user select a Base Policy ID, 
  // and we'll automatically use its latest Version ID when saving.
  function getLatestVersionId(policyId: string): string | null {
    const p = savedPolicies.find(p => p.id === policyId);
    if (p && p.versions && p.versions.length > 0) {
      return p.versions[0].id;
    }
    return null;
  }

  function getBasePolicyIdFromVersionId(versionId: string | undefined): string {
    if (!versionId) return "";
    for (const p of savedPolicies) {
      if (p.versions?.some(v => v.id === versionId)) return p.id as string;
    }
    return "";
  }

  async function startEdit(a: Assignment) {
    setEditingId(a.id);
    setEditPolicyId(getBasePolicyIdFromVersionId(a.activePolicyMapping?.policyVersionId));
  }

  async function commitEdit(a: Assignment) {
    try {
      const versionId = getLatestVersionId(editPolicyId);
      if (versionId && versionId !== a.activePolicyMapping?.policyVersionId) {
        await fetchApi(`/assignments/${a.id}/policy`, {
          method: "POST",
          body: JSON.stringify({ policyVersionId: versionId })
        });
        // Reload to get the updated mapping
        loadAssignments();
      }
      setEditingId(null);
    } catch (err: any) {
      alert("Failed to update policy: " + err.message);
    }
  }

  async function deleteAssignment(id: string) {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await fetchApi(`/assignments/${id}`, { method: "DELETE" });
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  }

  async function commitAdd() {
    if (!newTitle.trim() || !newDue) return;
    try {
      // Create assignment
      const dueUtc = new Date(newDue).toISOString();
      const newAssignment = await fetchApi<Assignment>("/assignments", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          courseCode: newCourse,
          dueDate: dueUtc,
          createdBy: "system" // Normally from auth token
        })
      });

      // If a policy was selected, link it
      const versionId = getLatestVersionId(newPolicyId);
      if (versionId) {
        await fetchApi(`/assignments/${newAssignment.id}/policy`, {
          method: "POST",
          body: JSON.stringify({ policyVersionId: versionId })
        });
      }

      setNewTitle(""); setNewCourse(""); setNewDue(""); setNewPolicyId("");
      setAdding(false);
      loadAssignments();
    } catch (err: any) {
      alert("Failed to create assignment: " + err.message);
    }
  }

  const inputClass = "bg-input-background border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const selectClass = "bg-input-background border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer";

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
          <h3 className="text-sm text-foreground">Assignments & Policy Links</h3>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/70 transition-colors"
          >
            <Plus size={13} /> Add Assignment
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading assignments...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Assignment Title</th>
                  <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Course</th>
                  <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Due Date (UTC)</th>
                  <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Active Policy</th>
                  <th className="px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-5 py-3 text-sm text-foreground">{a.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground mono">{a.courseCode}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground mono">
                      {new Date(a.dueDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === a.id ? (
                        <select
                          className={selectClass}
                          value={editPolicyId}
                          onChange={(e) => setEditPolicyId(e.target.value)}
                        >
                          <option value="">-- Select Policy --</option>
                          {savedPolicies.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs mono ${
                          a.activePolicyMapping ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-secondary text-secondary-foreground"
                        }`}>
                          {getPolicyNameByVersionId(a.activePolicyMapping?.policyVersionId)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === a.id ? (
                          <>
                            <button onClick={() => commitEdit(a)} className="text-emerald-600 hover:text-emerald-700 transition-colors">
                              <Check size={15} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                              <X size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(a)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteAssignment(a.id)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {adding && (
                  <tr className="bg-secondary/20">
                    <td className="px-5 py-3">
                      <input
                        className={inputClass + " w-full"}
                        placeholder="Assignment Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        autoFocus
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className={inputClass + " w-28"}
                        placeholder="Course Code"
                        value={newCourse}
                        onChange={(e) => setNewCourse(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="datetime-local"
                        className={inputClass}
                        value={newDue}
                        onChange={(e) => setNewDue(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={selectClass}
                        value={newPolicyId}
                        onChange={(e) => setNewPolicyId(e.target.value)}
                      >
                        <option value="">-- No Policy --</option>
                        {savedPolicies.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={commitAdd} className="text-emerald-600 hover:text-emerald-700 transition-colors">
                          <Check size={15} />
                        </button>
                        <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                
                {!isLoading && assignments.length === 0 && !adding && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No assignments found. Click "Add Assignment" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
