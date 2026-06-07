import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { fetchApi } from "../api/client";
import { Assignment } from "./AssignmentOverrides";

export interface SubmissionResult {
  id: string;
  submissionId: string;
  policyVersionId: string;
  rawScore: number;
  penaltyApplied: number;
  latenessHours: number;
  effectiveLatenessHours: number;
  finalScore: number;
  status: "ACCEPTED" | "LATE_ACCEPTED" | "REJECTED";
  reason: string;
  evaluatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentIdentifier: string;
  submissionUrl?: string | null;
  submittedAt: string;
  createdAt: string;
  result: SubmissionResult;
}

export function SubmissionsView() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignmentId) {
      loadSubmissions(selectedAssignmentId);
    } else {
      setSubmissions([]);
    }
  }, [selectedAssignmentId]);

  async function loadAssignments() {
    try {
      const data = await fetchApi<Assignment[]>("/assignments");
      setAssignments(data);
      if (data.length > 0) {
        setSelectedAssignmentId(data[0].id);
      }
    } catch (err: any) {
      setError("Failed to load assignments: " + err.message);
    }
  }

  async function loadSubmissions(assignmentId: string) {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchApi<Submission[]>(`/submissions/assignment/${assignmentId}`);
      setSubmissions(data);
    } catch (err: any) {
      setError("Failed to load submissions: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const selectClass = "bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer w-72";

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
          <h3 className="text-sm text-foreground">Submission Results</h3>
          <select
            className={selectClass}
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
          >
            <option value="">-- Select an Assignment --</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>{a.title} ({a.courseCode})</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Student</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Submitted At (UTC)</th>
                <th className="text-right px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Raw Score</th>
                <th className="text-right px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Penalty</th>
                <th className="text-right px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Final Score</th>
                <th className="text-left px-5 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">Status / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Loading submissions...</td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No submissions found for this assignment.</td>
                </tr>
              ) : (
                submissions.map((s) => {
                  const res = s.result;
                  let statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
                  let Icon = CheckCircle;
                  if (res.status === "LATE_ACCEPTED") {
                    statusColor = "text-amber-700 bg-amber-50 border-amber-200";
                    Icon = AlertTriangle;
                  } else if (res.status === "REJECTED") {
                    statusColor = "text-red-700 bg-red-50 border-red-200";
                    Icon = XCircle;
                  }

                  return (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-sm text-foreground font-medium">{s.studentIdentifier}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground mono">{new Date(s.submittedAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right mono">{res.rawScore.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-right mono text-destructive">{res.penaltyApplied > 0 ? `-${res.penaltyApplied.toFixed(1)}` : "-"}</td>
                      <td className="px-4 py-3 text-sm text-right mono font-semibold">{res.finalScore.toFixed(1)}</td>
                      <td className="px-5 py-3">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs ${statusColor}`}>
                          <Icon size={12} />
                          <span>{res.reason}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
