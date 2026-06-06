import { useEffect, useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import { NoteDetail } from "./components/NoteDetail";
import { NoteForm } from "./components/NoteForm";
import { NotesList } from "./components/NotesList";
import { createNote, fetchNote, fetchNotes, fetchPatients, type NoteDetail as NoteDetailType, type NoteListItem, type Patient } from "./lib/api";

export function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteDetailType | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNotes(nextSelectedId?: string) {
    const nextNotes = await fetchNotes();
    setNotes(nextNotes);

    const noteId = nextSelectedId ?? selectedNoteId ?? nextNotes[0]?.id ?? null;
    setSelectedNoteId(noteId);
  }

  async function loadInitialData() {
    setError(null);
    setIsBooting(true);

    try {
      const [nextPatients, nextNotes] = await Promise.all([fetchPatients(), fetchNotes()]);
      setPatients(nextPatients);
      setNotes(nextNotes);
      setSelectedNoteId(nextNotes[0]?.id ?? null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load data");
    } finally {
      setIsBooting(false);
    }
  }

  async function handleCreateNote(input: { patientId: string; text: string; audioFile: File | null }) {
    setError(null);
    setIsSubmitting(true);

    try {
      const note = await createNote(input);
      setSelectedNote(note);
      await loadNotes(note.id);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save note");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedNoteId) {
      setSelectedNote(null);
      return;
    }

    let isMounted = true;
    setIsDetailLoading(true);

    fetchNote(selectedNoteId)
      .then((note) => {
        if (isMounted) {
          setSelectedNote(note);
        }
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load note");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsDetailLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedNoteId]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <ClipboardList aria-hidden="true" size={22} />
          </span>
          <div>
            <h1>AI Scribe Notes</h1>
            <p>Home healthcare documentation</p>
          </div>
        </div>
        <button className="icon-button" onClick={() => void loadInitialData()} title="Refresh" type="button">
          <RefreshCw aria-hidden="true" size={18} />
        </button>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <div className="workspace">
        <aside className="left-pane">
          <section className="panel">
            <div className="section-heading">
              <h2>New note</h2>
            </div>
            <NoteForm patients={patients} isSubmitting={isSubmitting} onSubmit={handleCreateNote} />
          </section>

          <section className="panel list-panel">
            <div className="section-heading">
              <h2>Notes</h2>
              <span>{notes.length}</span>
            </div>
            {isBooting ? (
              <div className="empty-state">Loading...</div>
            ) : (
              <NotesList notes={notes} selectedNoteId={selectedNoteId} onSelectNote={setSelectedNoteId} />
            )}
          </section>
        </aside>

        <section className="right-pane">
          <NoteDetail note={selectedNote} isLoading={isDetailLoading} />
        </section>
      </div>
    </main>
  );
}
