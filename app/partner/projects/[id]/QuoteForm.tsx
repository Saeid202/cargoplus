"use client";

import { useState } from "react";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { submitQuote, type SubmitQuoteInput } from "@/app/actions/partner";
import type { EngineeringQuote } from "@/types/database";

interface QuoteFormProps {
  projectId: string;
  existingQuote: EngineeringQuote | null;
  onSuccess?: () => void;
}

const inp =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

export function QuoteForm({ projectId, existingQuote, onSuccess }: QuoteFormProps) {
  const [priceCad, setPriceCad] = useState(existingQuote?.price_cad?.toString() ?? "");
  const [timelineWeeks, setTimelineWeeks] = useState(existingQuote?.timeline_weeks?.toString() ?? "");
  const [validityDays, setValidityDays] = useState(existingQuote?.validity_days?.toString() ?? "");
  const [notes, setNotes] = useState(existingQuote?.notes ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: SubmitQuoteInput = {
      price_cad: parseFloat(priceCad),
      timeline_weeks: parseInt(timelineWeeks),
      validity_days: parseInt(validityDays),
      notes: notes.trim() || null,
    };

    // Convert files to base64
    const attachments: { name: string; base64: string; type: string }[] = [];
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      attachments.push({ name: file.name, base64, type: file.type });
    }

    const result = await submitQuote(projectId, input, attachments);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setFiles([]);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Quote {existingQuote ? "updated" : "submitted"} successfully.
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Price (CAD) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={priceCad}
            onChange={(e) => setPriceCad(e.target.value)}
            className={inp}
            placeholder="e.g. 250000"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Timeline (weeks) *</label>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={timelineWeeks}
            onChange={(e) => setTimelineWeeks(e.target.value)}
            className={inp}
            placeholder="e.g. 12"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Validity (days) *</label>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={validityDays}
            onChange={(e) => setValidityDays(e.target.value)}
            className={inp}
            placeholder="e.g. 30"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Notes</label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inp + " resize-none"}
          placeholder="Additional details, assumptions, or conditions…"
        />
      </div>

      {/* File upload */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Attachments (PDF, Excel)</label>
        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-500">
          <Upload className="h-4 w-4" />
          <span>Choose files…</span>
          <input
            type="file"
            multiple
            accept=".pdf,.xls,.xlsx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
            }}
          />
        </label>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs text-gray-700">
                <FileText className="h-3 w-3" />
                <span className="max-w-[140px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {existingQuote ? "Update Quote" : "Submit Quote"}
      </button>
    </form>
  );
}
