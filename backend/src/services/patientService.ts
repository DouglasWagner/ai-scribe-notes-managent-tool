import { query } from "../db/pool.js";

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

type PatientRow = {
  id: string;
  medical_record_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  primary_diagnosis: string | null;
};

export function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    medicalRecordNumber: row.medical_record_number,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    phone: row.phone,
    addressLine1: row.address_line1,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    primaryDiagnosis: row.primary_diagnosis
  };
}

export async function listPatients() {
  const result = await query<PatientRow>(`
    SELECT
      id,
      medical_record_number,
      first_name,
      last_name,
      date_of_birth::text,
      phone,
      address_line1,
      city,
      state,
      postal_code,
      primary_diagnosis
    FROM patients
    ORDER BY last_name ASC, first_name ASC;
  `);

  return result.rows.map(mapPatient);
}

export async function findPatientById(patientId: string) {
  const result = await query<PatientRow>(
    `
      SELECT
        id,
        medical_record_number,
        first_name,
        last_name,
        date_of_birth::text,
        phone,
        address_line1,
        city,
        state,
        postal_code,
        primary_diagnosis
      FROM patients
      WHERE id = $1;
    `,
    [patientId]
  );

  return result.rows[0] ? mapPatient(result.rows[0]) : null;
}
