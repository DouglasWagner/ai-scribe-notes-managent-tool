import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { FileAudio, Loader2, Save } from "lucide-react";
import type { Patient } from "../lib/api";

type NoteFormProps = {
  patients: Patient[];
  isSubmitting: boolean;
  onSubmit: (input: { patientId: string; text: string; audioFile: File | null }) => Promise<void>;
};

export function NoteForm({ patients, isSubmitting, onSubmit }: NoteFormProps) {
  const [patientId, setPatientId] = useState("");
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const selectedFileName = useMemo(() => audioFile?.name ?? "No file selected", [audioFile]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setAudioFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ patientId, text, audioFile });
    setText("");
    setAudioFile(null);
    event.currentTarget.reset();
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Patient</span>
        <select value={patientId} onChange={(event) => setPatientId(event.target.value)} required>
          <option value="">Select patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName} - {patient.medicalRecordNumber}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Clinical text</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={7}
          placeholder="Patient reports reduced pain after morning visit..."
        />
      </label>

      <label className="file-field">
        <input accept="audio/*,.m4a,.mp3,.mp4,.mpeg,.mpga,.ogg,.wav,.webm" type="file" onChange={handleFileChange} />
        <FileAudio aria-hidden="true" size={18} />
        <span>{selectedFileName}</span>
      </label>

      <button className="primary-button" disabled={isSubmitting || (!text.trim() && !audioFile)} type="submit">
        {isSubmitting ? <Loader2 aria-hidden="true" className="spin" size={18} /> : <Save aria-hidden="true" size={18} />}
        <span>{isSubmitting ? "Processing" : "Save note"}</span>
      </button>
    </form>
  );
}
