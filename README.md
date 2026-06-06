# AI Scribe Notes Management Tool

A lightweight take-home implementation for creating, processing, storing, listing, and viewing AI-generated clinical notes linked to seeded patient records.

## Stack

- Backend: Node.js, TypeScript, Express
- Frontend: React, TypeScript, Vite
- Database: PostgreSQL
- AI: OpenAI audio transcription + SOAP-style summary generation
- AWS: S3 audio storage through the AWS SDK
- Local dev: Docker Compose with Postgres and LocalStack S3

## Features

- Seeds 3 mock patients on API startup.
- Creates notes for an existing patient from typed text, audio upload, or both.
- Uploads audio to S3. Docker uses LocalStack by default so the S3 flow works locally.
- Transcribes audio with OpenAI when `OPENAI_API_KEY` is configured.
- Generates a SOAP-style clinical summary and stores both raw and processed text.
- Lists notes with patient name, timestamp, input type, and preview.
- Shows note detail and patient metadata side by side.

## Quick Start

Copy the environment template:

```bash
cp .env.example .env
```

Start the app:

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- API health: http://localhost:4000/api/health
- Postgres: `localhost:5432`
- LocalStack S3 endpoint: http://localhost:4566

The backend runs migrations and patient seeding automatically when it starts.

## OpenAI Configuration

For real AI transcription and summary generation, set:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe
OPENAI_SUMMARY_MODEL=gpt-4o-mini
```

`USE_AI_FALLBACKS=true` keeps the local demo usable without an OpenAI key:

- Audio upload stores the file but returns a placeholder transcription.
- Text notes still get a deterministic SOAP-style note.

Set `USE_AI_FALLBACKS=false` to require OpenAI for processing.

## AWS S3 Configuration

Docker Compose defaults to LocalStack:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_S3_BUCKET=scribe-audio
AWS_S3_ENDPOINT=http://localstack:4566
AWS_S3_PUBLIC_BASE_URL=http://localhost:4566/scribe-audio
AWS_FORCE_PATH_STYLE=true
```

To use a real AWS bucket:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT=
AWS_S3_PUBLIC_BASE_URL=
AWS_FORCE_PATH_STYLE=false
```

Leave `AWS_S3_ENDPOINT` empty for real AWS S3. The Docker Compose defaults only point to LocalStack when this variable is not defined.

The app stores the S3 object key and an audio URL/pointer with each note. Public playback depends on the bucket policy or a public base URL.

## API

Base URL: `http://localhost:4000/api`

### `GET /health`

Returns API status.

### `GET /patients`

Returns seeded patients.

Response:

```json
{
  "patients": [
    {
      "id": "7a7fbd48-0640-4fb5-9df6-d9234b257b41",
      "medicalRecordNumber": "MRN-1001",
      "firstName": "Maria",
      "lastName": "Santos",
      "dateOfBirth": "1948-03-14",
      "primaryDiagnosis": "Post-operative hip replacement care"
    }
  ]
}
```

### `GET /notes`

Returns note list items.

### `GET /notes/:id`

Returns one note with raw text, processed note, audio metadata, and patient metadata.

### `POST /notes`

Creates a note.

Content type: `multipart/form-data`

Fields:

- `patientId`: required
- `text`: optional when audio is provided
- `audio`: optional when text is provided

Example:

```bash
curl -X POST http://localhost:4000/api/notes \
  -F "patientId=7a7fbd48-0640-4fb5-9df6-d9234b257b41" \
  -F "text=Patient reports improved mobility and mild soreness after therapy."
```

## Database

Schema reference lives in `db/schema.sql`. Runtime migrations are intentionally small and are executed from `backend/src/db/migrate.ts`.

Main tables:

- `patients`
- `notes`

## Project Structure

```text
.
├── backend
│   └── src
│       ├── config
│       ├── db
│       ├── middleware
│       ├── routes
│       └── services
├── frontend
│   └── src
│       ├── components
│       └── lib
├── db
└── docker-compose.yml
```

## Assumptions and Shortcuts

- Authentication and authorization are out of scope for this take-home.
- Patient records are seeded mock data only.
- Notes are treated as documentation drafts and should be reviewed by a clinician.
- Audio upload is handled by the backend and then stored in S3; direct browser-to-S3 upload is not implemented.
- LocalStack is used to make S3 runnable locally without requiring a real AWS account.
- No background job queue is used; AI processing happens during note creation for a simple vertical slice.

## Video Walkthrough Outline

1. Show `docker compose up --build` and the seeded patients.
2. Create a text note and open it from the notes list.
3. Create an audio note and show the stored audio metadata.
4. Show the database tables briefly.
5. Explain the architecture: React UI, Express API, Postgres persistence, OpenAI service, S3 storage adapter.
6. Call out shortcuts and next steps.

## Useful Commands

Inside a running backend container:

```bash
npm run typecheck
npm run build
```

Inside a running frontend container:

```bash
npm run typecheck
npm run build
```
