const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type Patient = {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  primaryDiagnosis: string | null;
};

export type NoteListItem = {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  inputType: "text" | "audio" | "mixed";
  preview: string;
};

export type NoteDetail = {
  id: string;
  patientId: string;
  inputType: "text" | "audio" | "mixed";
  rawText: string;
  processedNote: string;
  audioStorageKey: string | null;
  audioUrl: string | null;
  originalFileName: string | null;
  mimeType: string | null;
  createdAt: string;
  patient: Patient;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Request failed");
  }

  return body;
}

export async function fetchPatients() {
  const response = await fetch(`${API_URL}/patients`);
  const body = await parseResponse<{ patients: Patient[] }>(response);
  return body.patients;
}

export async function fetchNotes() {
  const response = await fetch(`${API_URL}/notes`);
  const body = await parseResponse<{ notes: NoteListItem[] }>(response);
  return body.notes;
}

export async function fetchNote(noteId: string) {
  const response = await fetch(`${API_URL}/notes/${noteId}`);
  const body = await parseResponse<{ note: NoteDetail }>(response);
  return body.note;
}

export type CreateNoteInput = {
  patientId: string;
  text: string;
  audioFile: File | null;
};

export async function createNote(input: CreateNoteInput) {
  const formData = new FormData();
  formData.append("patientId", input.patientId);
  formData.append("text", input.text);

  if (input.audioFile) {
    formData.append("audio", input.audioFile);
  }

  const response = await fetch(`${API_URL}/notes`, {
    method: "POST",
    body: formData
  });

  const body = await parseResponse<{ note: NoteDetail }>(response);
  return body.note;
}
