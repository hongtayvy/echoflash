import Papa from "papaparse";
import type { CsvError, CsvRow } from "../types";
import { splitTags, uniq } from "./utils";

type ParseResult = {
  rows: CsvRow[];
  errors: CsvError[];
};

function getCell(row: unknown[], idx: number) {
  const v = row?.[idx];
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/**
 * Parse CSV with either:
 * - headers: question, answer, tags(optional)
 * - no headers: first two columns are question/answer, third optional tags
 *
 * Uses PapaParse; caller can supply callbacks for progress.
 */
export function parseechoflashsCsv(
  file: File,
  opts: {
    onProgress?: (progress01: number) => void;
    onPreview?: (preview: CsvRow[]) => void;
    previewLimit?: number;
  } = {}
): Promise<ParseResult> {
  const previewLimit = opts.previewLimit ?? 25;

  return new Promise((resolve) => {
    const rows: CsvRow[] = [];
    const errors: CsvError[] = [];
    let totalParsed = 0;

    let detectedHeader: boolean | null = null;
    let headerMap: Record<string, number> | null = null;

    const pushRow = (dataRowIndex1Based: number, q: string, a: string, tagsRaw?: string) => {
      const question = q.trim();
      const answer = a.trim();
      const tags = uniq(splitTags(tagsRaw ?? ""));
      if (!question && !answer) return; // ignore empty row
      if (!question) {
        errors.push({ row: dataRowIndex1Based, message: "Missing question" });
        return;
      }
      if (!answer) {
        errors.push({ row: dataRowIndex1Based, message: "Missing answer" });
        return;
      }
      rows.push({ question, answer, tags });
    };

    Papa.parse<unknown[]>(file, {
      worker: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      chunkSize: 1024 * 64,
      chunk: (results, parser) => {
        // progress (best-effort)
        if (opts.onProgress && file.size > 0) {
          const approx = Math.min(0.98, totalParsed / Math.max(1, totalParsed + 200));
          opts.onProgress(approx);
        }

        for (const raw of results.data ?? []) {
          if (!Array.isArray(raw)) continue;
          totalParsed += 1;

          // Determine header presence on first non-empty line
          if (detectedHeader === null) {
            const c0 = getCell(raw, 0).trim().toLowerCase();
            const c1 = getCell(raw, 1).trim().toLowerCase();
            const c2 = getCell(raw, 2).trim().toLowerCase();

            const looksLikeHeader =
              (c0 === "question" && (c1 === "answer" || c1 === "answers")) ||
              (c0 === "q" && c1 === "a") ||
              (c0.includes("question") && c1.includes("answer")) ||
              (c0 === "question" && c1 === "answer" && c2 === "tags");

            detectedHeader = looksLikeHeader;

            if (looksLikeHeader) {
              headerMap = {};
              raw.forEach((cell, idx) => {
                const key = String(cell ?? "").trim().toLowerCase();
                if (!key) return;
                headerMap![key] = idx;
              });
              continue; // skip header row
            }
          }

          // Data row index (1-based), not counting header if present
          const dataRowIndex1Based = detectedHeader ? totalParsed - 1 : totalParsed;

          if (headerMap) {
            const qIdx = headerMap["question"] ?? headerMap["q"] ?? 0;
            const aIdx = headerMap["answer"] ?? headerMap["answers"] ?? headerMap["a"] ?? 1;
            const tIdx = headerMap["tags"] ?? headerMap["tag"] ?? headerMap["labels"];
            pushRow(
              dataRowIndex1Based,
              getCell(raw, qIdx),
              getCell(raw, aIdx),
              tIdx != null ? getCell(raw, tIdx) : ""
            );
          } else {
            pushRow(
              dataRowIndex1Based,
              getCell(raw, 0),
              getCell(raw, 1),
              getCell(raw, 2)
            );
          }

          if (opts.onPreview && rows.length <= previewLimit) {
            opts.onPreview(rows.slice(0, previewLimit));
          }
        }

        if (results.errors?.length) {
          for (const e of results.errors) {
            const row = (e.row ?? 0) + 1;
            errors.push({ row, message: e.message });
          }
        }

        void parser;
      },
      complete: () => {
        opts.onProgress?.(1);
        resolve({ rows, errors });
      },
      error: (err) => {
        resolve({ rows: [], errors: [{ row: 0, message: err.message }] });
      },
    });
  });
}

export function toechoflashsCsv(rows: { question: string; answer: string; tags?: string[] }[]) {
  return Papa.unparse(
    rows.map((r) => ({
      question: r.question,
      answer: r.answer,
      tags: (r.tags ?? []).join(" "),
    })),
    { quotes: true, escapeFormulae: true }
  );
}
