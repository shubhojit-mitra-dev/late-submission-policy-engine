import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { LatePolicy } from "./PolicyEditor";

interface Assignment {
  id: string;
  name: string;
  course: string;
  dueDate: string;
  policyId: string | "default";
}

const SAMPLE_ASSIGNMENTS: Assignment[] = [
  { id: "a1", name: "Problem Set 1", course: "CS 101", dueDate: "2025-02-10", policyId: "default" },
  { id: "a2", name: "Research Paper Draft", course: "ENG 205", dueDate: "2025-03-01", policyId: "strict" },
  { id: "a3", name: "Lab Report 3", course: "BIO 301", dueDate: "2025-03-15", policyId: "default" },
  { id: "a4", name: "Midterm Reflection", course: "PSY 110", dueDate: "2025-03-22", policyId: "lenient" },
  { id: "a5", name: "Final Project Proposal", course: "CS 401", dueDate: "2025-04-01", policyId: "default" },
  { id: "a6", name: "Statistics Assignment 4", course: "MATH 220", dueDate: "2025-04-08", policyId: "strict" },
];

interface PolicyBadgeProps {
  policyId: string;
}

function PolicyBadge({ policyId }: PolicyBadgeProps) {
  const configs: Record<string, { label: string; color: string }> = {
    default: { label: "Default", color: "bg-secondary text-secondary-foreground border-border" },
    strict: { label: "Strict", color: "bg-red-50 text-red-700 border-red-200" },
    lenient: { label: "Lenient", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    no_late: { label: "No Late", color: "bg-violet-900 text-white border-violet-900" },
  };
  const c = configs[policyId] ?? configs.default;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs mono ${c.color}`}>
      {c.label}
    </span>
  );
}

interface Props {
  savedPolicies: LatePolicy[];
}

export function AssignmentOverrides({ savedPolicies }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>(SAMPLE_ASSIGNMENTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPolicy, setEditPolicy] = useState<string>("default");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPolicy, setNewPolicy] = useState("default");

  const policyOptions = [
    { id: "default", name: "Default Policy" },
    { id: "strict", name: "Strict (No Grace)" },
    { id: "lenient", name: "Lenient (48h Grace)" },
    { id: "no_late", name: "No Late Accepted" },
    ...savedPolicies.filter(p => p.id && !["default","strict","lenient","no_late"].includes(p.id)).map(p => ({ id: p.id as string, name: p.name })),
  ];

  function startEdit(a: Assignment) {
    setEditingId(a.id);
    setEditPolicy(a.policyId);
  }

  function commitEdit(id: string) {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, policyId: editPolicy } : a));
    setEditingId(null);
  }

  function deleteAssignment(id: string) {
    setAssignments(prev => prev.filter(a => a.id !== id));
  }

  function commitAdd() {
    if (!newName.trim()) return;
    const id = `a${Date.now()}`;
    setAssignments(prev => [...prev, { id, name: newName, course: newCourse, dueDate: newDue, policyId: newPolicy }]);
    setNewName(""); setNewCourse(""); setNewDue(""); setNewPolicy("default");
    setAdding(false);
  }

  const inputClass = "bg-input-background border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const selectClass = "bg-input-background border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer";

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
          <h3 className="text-sm text-foreground">Assignment Policy Overrides</h3>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/70 transition-colors"
          >
            <Plus size={13} /> Add Assignment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Assignment</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Course</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Due Date</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Policy</th>
                <th className="px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-5 py-3 text-sm text-foreground">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground mono">{a.course}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground mono">{a.dueDate}</td>
                  <td className="px-4 py-3">
                    {editingId === a.id ? (
                      <select
                        className={selectClass}
                        value={editPolicy}
                        onChange={(e) => setEditPolicy(e.target.value)}
                      >
                        {policyOptions.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <PolicyBadge policyId={a.policyId} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === a.id ? (
                        <>
                          <button onClick={() => commitEdit(a.id)} className="text-emerald-600 hover:text-emerald-700 transition-colors">
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
                      placeholder="Assignment name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className={inputClass + " w-28"}
                      placeholder="Course"
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      className={inputClass}
                      value={newDue}
                      onChange={(e) => setNewDue(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={selectClass}
                      value={newPolicy}
                      onChange={(e) => setNewPolicy(e.target.value)}
                    >
                      {policyOptions.map(p => (
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
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} — overrides take precedence over the course default policy.
          </p>
        </div>
      </div>
    </div>
  );
}
