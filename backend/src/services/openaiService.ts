import OpenAI, { toFile } from "openai";
import { env } from "../config/env.js";

const openai = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY
    })
  : null;

function ensureFallbackAllowed() {
  if (!env.USE_AI_FALLBACKS) {
    throw new Error("OPENAI_API_KEY is required when USE_AI_FALLBACKS is false.");
  }
}

function fallbackSoapNote(rawText: string) {
  return [
    "SOAP Note",
    "",
    "Subjective:",
    rawText || "No subjective details captured.",
    "",
    "Objective:",
    "Review clinician-entered or transcribed observations above.",
    "",
    "Assessment:",
    "Clinical assessment requires licensed clinician review.",
    "",
    "Plan:",
    "Continue care plan review and document follow-up actions as appropriate."
  ].join("\n");
}

export async function transcribeAudio(file: Express.Multer.File) {
  if (!openai) {
    ensureFallbackAllowed();
    return `[Audio uploaded: ${file.originalname}. Configure OPENAI_API_KEY to generate a real transcription.]`;
  }

  const audioFile = await toFile(file.buffer, file.originalname, {
    type: file.mimetype
  });

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: env.OPENAI_TRANSCRIPTION_MODEL
  });

  return transcription.text;
}

export async function generateClinicalSummary(rawText: string) {
  if (!openai) {
    ensureFallbackAllowed();
    return fallbackSoapNote(rawText);
  }

  const response = await openai.chat.completions.create({
    model: env.OPENAI_SUMMARY_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You create concise clinical notes in SOAP format. Keep clinically uncertain items qualified. Do not invent vitals, diagnoses, medications, or orders."
      },
      {
        role: "user",
        content: rawText
      }
    ]
  });

  return response.choices[0]?.message.content?.trim() ?? fallbackSoapNote(rawText);
}
