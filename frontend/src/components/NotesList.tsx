import { FileText, Mic2 } from "lucide-react";
import type { NoteListItem } from "../lib/api";

type NotesListProps = {
  notes: NoteListItem[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function NotesList({ notes, selectedNoteId, onSelectNote }: NotesListProps) {
  if (notes.length === 0) {
    return <div className="empty-state">No notes yet.</div>;
  }

  return (
    <div className="notes-list">
      {notes.map((note) => (
        <button
          className={note.id === selectedNoteId ? "note-row selected" : "note-row"}
          key={note.id}
          onClick={() => onSelectNote(note.id)}
          type="button"
        >
          <span className="note-icon" title={note.inputType === "text" ? "Text note" : "Audio note"}>
            {note.inputType === "text" ? <FileText aria-hidden="true" size={18} /> : <Mic2 aria-hidden="true" size={18} />}
          </span>
          <span className="note-row-body">
            <span className="note-row-top">
              <strong>{note.patientName}</strong>
              <time>{formatDate(note.createdAt)}</time>
            </span>
            <span className="note-preview">{note.preview || "No summary available."}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
