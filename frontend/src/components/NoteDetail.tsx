import { CalendarClock, ExternalLink, FileAudio, UserRound } from "lucide-react";
import type { NoteDetail as NoteDetailType } from "../lib/api";

type NoteDetailProps = {
  note: NoteDetailType | null;
  isLoading: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function NoteDetail({ note, isLoading }: NoteDetailProps) {
  if (isLoading) {
    return <div className="detail-placeholder">Loading note...</div>;
  }

  if (!note) {
    return <div className="detail-placeholder">Select a note.</div>;
  }

  const patient = note.patient;
  const fullAddress = [patient.addressLine1, patient.city, patient.state, patient.postalCode].filter(Boolean).join(", ");

  return (
    <div className="detail-grid">
      <article className="note-detail">
        <div className="detail-heading">
          <div>
            <p className="eyebrow">Clinical note</p>
            <h2>
              {patient.firstName} {patient.lastName}
            </h2>
          </div>
          <div className="timestamp">
            <CalendarClock aria-hidden="true" size={17} />
            <time>{formatDate(note.createdAt)}</time>
          </div>
        </div>

        <section>
          <h3>Summary</h3>
          <pre>{note.processedNote}</pre>
        </section>

        <section>
          <h3>Transcription / Raw input</h3>
          <pre>{note.rawText}</pre>
        </section>

        {note.audioUrl ? (
          <a className="audio-link" href={note.audioUrl} rel="noreferrer" target="_blank">
            <FileAudio aria-hidden="true" size={17} />
            <span>{note.originalFileName ?? note.audioStorageKey}</span>
            <ExternalLink aria-hidden="true" size={15} />
          </a>
        ) : null}
      </article>

      <aside className="patient-panel">
        <div className="patient-title">
          <UserRound aria-hidden="true" size={20} />
          <h3>Patient</h3>
        </div>

        <dl>
          <div>
            <dt>Name</dt>
            <dd>
              {patient.firstName} {patient.lastName}
            </dd>
          </div>
          <div>
            <dt>MRN</dt>
            <dd>{patient.medicalRecordNumber}</dd>
          </div>
          <div>
            <dt>DOB</dt>
            <dd>{patient.dateOfBirth}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{patient.phone ?? "Not listed"}</dd>
          </div>
          <div>
            <dt>Diagnosis</dt>
            <dd>{patient.primaryDiagnosis ?? "Not listed"}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{fullAddress || "Not listed"}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
