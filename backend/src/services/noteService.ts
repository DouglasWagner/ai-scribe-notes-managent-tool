import { randomUUID } from "node:crypto";
import { query } from "../db/pool.js";
import { HttpError } from "../middleware/errorHandler.js";
import { findPatientById, mapPatient, type Patient } from "./patientService.js";

export type NoteInputType = "text" | "audio" | "mixed";

export type NoteListItem = {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  inputType: NoteInputType;
  preview: string;
};

export type NoteDetail = {
  id: string;
  patientId: string;
  inputType: NoteInputType;
  rawText: string;
  processedNote: string;
  audioStorageKey: string | null;
  audioUrl: string | null;
  originalFileName: string | null;
  mimeType: string | null;
  createdAt: string;
  patient: Patient;
};

type NoteListRow = {
  id: string;
  patient_id: string;
  patient_name: string;
  created_at: string;
  input_type: NoteInputType;
  preview: string;
};

type NoteDetailRow = {
  id: string;
  patient_id: string;
  input_type: NoteInputType;
  raw_text: string;
  processed_note: string;
  audio_storage_key: string | null;
  audio_url: string | null;
  original_file_name: string | null;
  mime_type: string | null;
  created_at: string;
  patient_medical_record_number: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_date_of_birth: string;
  patient_phone: string | null;
  patient_address_line1: string | null;
  patient_city: string | null;
  patient_state: string | null;
  patient_postal_code: string | null;
  patient_primary_diagnosis: string | null;
};

export async function listNotes(): Promise<NoteListItem[]> {
  const result = await query<NoteListRow>(`
    SELECT
      notes.id,
      notes.patient_id,
      patients.first_name || ' ' || patients.last_name AS patient_name,
      to_char(notes.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at,
      notes.input_type,
      LEFT(REPLACE(notes.processed_note, E'\n', ' '), 180) AS preview
    FROM notes
    INNER JOIN patients ON patients.id = notes.patient_id
    ORDER BY notes.created_at DESC;
  `);

  return result.rows.map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    createdAt: row.created_at,
    inputType: row.input_type,
    preview: row.preview
  }));
}

export async function getNote(noteId: string): Promise<NoteDetail> {
  const result = await query<NoteDetailRow>(
    `
      SELECT
        notes.id,
        notes.patient_id,
        notes.input_type,
        notes.raw_text,
        notes.processed_note,
        notes.audio_storage_key,
        notes.audio_url,
        notes.original_file_name,
        notes.mime_type,
        to_char(notes.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at,
        patients.medical_record_number AS patient_medical_record_number,
        patients.first_name AS patient_first_name,
        patients.last_name AS patient_last_name,
        patients.date_of_birth::text AS patient_date_of_birth,
        patients.phone AS patient_phone,
        patients.address_line1 AS patient_address_line1,
        patients.city AS patient_city,
        patients.state AS patient_state,
        patients.postal_code AS patient_postal_code,
        patients.primary_diagnosis AS patient_primary_diagnosis
      FROM notes
      INNER JOIN patients ON patients.id = notes.patient_id
      WHERE notes.id = $1;
    `,
    [noteId]
  );

  const row = result.rows[0];

  if (!row) {
    throw new HttpError(404, "Note not found");
  }

  return {
    id: row.id,
    patientId: row.patient_id,
    inputType: row.input_type,
    rawText: row.raw_text,
    processedNote: row.processed_note,
    audioStorageKey: row.audio_storage_key,
    audioUrl: row.audio_url,
    originalFileName: row.original_file_name,
    mimeType: row.mime_type,
    createdAt: row.created_at,
    patient: mapPatient({
      id: row.patient_id,
      medical_record_number: row.patient_medical_record_number,
      first_name: row.patient_first_name,
      last_name: row.patient_last_name,
      date_of_birth: row.patient_date_of_birth,
      phone: row.patient_phone,
      address_line1: row.patient_address_line1,
      city: row.patient_city,
      state: row.patient_state,
      postal_code: row.patient_postal_code,
      primary_diagnosis: row.patient_primary_diagnosis
    })
  };
}

type CreateNoteInput = {
  patientId: string;
  inputType: NoteInputType;
  rawText: string;
  processedNote: string;
  audioStorageKey?: string;
  audioUrl?: string;
  originalFileName?: string;
  mimeType?: string;
};

export async function createNote(input: CreateNoteInput) {
  const patient = await findPatientById(input.patientId);

  if (!patient) {
    throw new HttpError(404, "Patient not found");
  }

  const noteId = randomUUID();

  await query(
    `
      INSERT INTO notes (
        id,
        patient_id,
        input_type,
        raw_text,
        processed_note,
        audio_storage_key,
        audio_url,
        original_file_name,
        mime_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `,
    [
      noteId,
      input.patientId,
      input.inputType,
      input.rawText,
      input.processedNote,
      input.audioStorageKey ?? null,
      input.audioUrl ?? null,
      input.originalFileName ?? null,
      input.mimeType ?? null
    ]
  );

  return getNote(noteId);
}
