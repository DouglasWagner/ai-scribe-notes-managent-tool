CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY,
  medical_record_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone TEXT,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  primary_diagnosis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'audio', 'mixed')),
  raw_text TEXT NOT NULL,
  processed_note TEXT NOT NULL,
  audio_storage_key TEXT,
  audio_url TEXT,
  original_file_name TEXT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_patient_id_idx ON notes(patient_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);
