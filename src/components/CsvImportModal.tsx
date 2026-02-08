import { useMemo, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { parseechoflashsCsv } from "../lib/csv";
import type { CsvError, CsvRow } from "../types";
import { Upload, FileSpreadsheet, AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (rows: CsvRow[]) => void;
};

export default function CsvImportModal({ open, onClose, onImport }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [errors, setErrors] = useState<CsvError[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [busy, setBusy] = useState(false);

  const canImport = rows.length > 0 && !busy;

  const reset = () => {
    setFile(null);
    setPreview([]);
    setRows([]);
    setErrors([]);
    setProgress(0);
    setBusy(false);
  };

  const onPickFile = async (f: File) => {
    reset();
    setFile(f);
    setBusy(true);
    const result = await parseechoflashsCsv(f, {
      previewLimit: 25,
      onPreview: (p) => setPreview(p),
      onProgress: (p) => setProgress(p),
    });
    setRows(result.rows);
    setErrors(result.errors);
    setBusy(false);
  };

  const errorTop = useMemo(() => errors.slice(0, 6), [errors]);

  return (
    <Modal
      open={open}
      title="Import CSV"
      description="Upload a CSV with columns: question, answer, (optional) tags."
      onClose={() => {
        onClose();
        reset();
      }}
      maxWidthClass="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={() => { onClose(); reset(); }}>
            Close
          </Button>
          <Button
            onClick={() => {
              onImport(rows);
              reset();
            }}
            disabled={!canImport}
          >
            Import {rows.length ? `(${rows.length})` : ""}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void onPickFile(f);
          }}
        >
          <div className="mx-auto flex max-w-lg flex-col items-center gap-2">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft">
              <Upload className="h-5 w-5 text-zinc-700" />
            </div>
            <div className="text-sm font-semibold">Drag & drop your CSV here</div>
            <div className="text-xs text-zinc-600">or choose a file</div>
            <label className="mt-2 inline-flex cursor-pointer">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPickFile(f);
                }}
              />
              <span className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                Choose CSV
              </span>
            </label>
            {file && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="truncate">{file.name}</span>
                {busy && <span className="text-zinc-500">Parsing…</span>}
              </div>
            )}

            {(busy || progress > 0) && (
              <div className="mt-3 w-full">
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-[11px] text-zinc-600">{Math.round(progress * 100)}%</div>
              </div>
            )}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              Issues found ({errors.length})
            </div>
            <ul className="mt-2 space-y-1 text-sm text-amber-900/90">
              {errorTop.map((e, idx) => (
                <li key={idx}>
                  <span className="font-medium">Row {e.row}:</span> {e.message}
                </li>
              ))}
            </ul>
            {errors.length > errorTop.length && (
              <div className="mt-2 text-xs text-amber-900/80">…and {errors.length - errorTop.length} more</div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Preview</div>
              <div className="text-xs text-zinc-600">Showing up to 25 parsed cards.</div>
            </div>
            <div className="text-xs text-zinc-600">
              Ready: <span className="font-medium text-zinc-900">{rows.length}</span>
            </div>
          </div>

          <div className="mt-3 overflow-auto">
            <table className="w-full min-w-[600px] border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs text-zinc-600">
                  <th className="border-b border-zinc-100 py-2 pr-3">Question</th>
                  <th className="border-b border-zinc-100 py-2 pr-3">Answer</th>
                  <th className="border-b border-zinc-100 py-2 pr-3">Tags</th>
                </tr>
              </thead>
              <tbody>
                {preview.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-zinc-500" colSpan={3}>
                      Upload a CSV to see a preview.
                    </td>
                  </tr>
                ) : (
                  preview.map((r, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="border-b border-zinc-50 py-2 pr-3 align-top">{r.question}</td>
                      <td className="border-b border-zinc-50 py-2 pr-3 align-top">{r.answer}</td>
                      <td className="border-b border-zinc-50 py-2 pr-3 align-top text-zinc-600">
                        {(r.tags ?? []).map((t) => `#${t}`).join(" ") || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-xs text-zinc-600">
          Tip: accepted formats:
          <span className="ml-1 rounded-lg border border-zinc-200 bg-white px-2 py-1">question,answer</span>
          <span className="ml-1 rounded-lg border border-zinc-200 bg-white px-2 py-1">question,answer,tags</span>
        </div>
      </div>
    </Modal>
  );
}
