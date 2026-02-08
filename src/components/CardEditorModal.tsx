import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import Textarea from "./Textarea";
import { splitTags, uniq } from "../lib/utils";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: { question: string; answer: string; tags: string[] };
  onClose: () => void;
  onSave: (data: { question: string; answer: string; tags: string[] }) => void;
};

export default function CardEditorModal({ open, mode, initial, onClose, onSave }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuestion(initial?.question ?? "");
    setAnswer(initial?.answer ?? "");
    setTagsRaw((initial?.tags ?? []).join(" "));
  }, [open, initial]);

  const tags = useMemo(() => uniq(splitTags(tagsRaw)), [tagsRaw]);
  const canSave = question.trim().length > 0 && answer.trim().length > 0;

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Add card" : "Edit card"}
      description="Keep it concise. You can use tags to filter later."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ question, answer, tags })} disabled={!canSave}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Question</label>
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., What is a SQL index?" />
        </div>
        <div>
          <label className="text-sm font-medium">Answer</label>
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="e.g., A data structure that speeds up lookups..." />
        </div>
        <div>
          <label className="text-sm font-medium">Tags (optional)</label>
          <Input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="e.g., sql backend interview" />
          {tags.length > 0 && (
            <p className="mt-2 text-xs text-zinc-600">
              Parsed: {tags.map((t) => `#${t}`).join(" ")}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
