import { Router } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errorHandler.js";
import { createNote, getNote, listNotes, type NoteInputType } from "../services/noteService.js";
import { generateClinicalSummary, transcribeAudio } from "../services/openaiService.js";
import { findPatientById } from "../services/patientService.js";
import { storeAudio } from "../services/storageService.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024
  }
});

export const notesRouter = Router();

notesRouter.get("/", async (_request, response, next) => {
  try {
    response.json({
      notes: await listNotes()
    });
  } catch (error) {
    next(error);
  }
});

notesRouter.get("/:id", async (request, response, next) => {
  try {
    response.json({
      note: await getNote(request.params.id)
    });
  } catch (error) {
    next(error);
  }
});

notesRouter.post("/", upload.single("audio"), async (request, response, next) => {
  try {
    const patientId = String(request.body.patientId ?? "").trim();
    const typedText = String(request.body.text ?? "").trim();
    const audioFile = request.file;

    if (!patientId) {
      throw new HttpError(400, "patientId is required");
    }

    if (!typedText && !audioFile) {
      throw new HttpError(400, "Provide either text or an audio file");
    }

    const patient = await findPatientById(patientId);

    if (!patient) {
      throw new HttpError(404, "Patient not found");
    }

    let audioText = "";
    let audioStorageKey: string | undefined;
    let audioUrl: string | undefined;

    if (audioFile) {
      const storedAudio = await storeAudio(audioFile);
      audioStorageKey = storedAudio.key;
      audioUrl = storedAudio.url;
      audioText = await transcribeAudio(audioFile);
    }

    const rawText = [typedText, audioText].filter(Boolean).join("\n\n");
    const processedNote = await generateClinicalSummary(rawText);

    let inputType: NoteInputType = "text";
    if (typedText && audioFile) {
      inputType = "mixed";
    } else if (audioFile) {
      inputType = "audio";
    }

    const note = await createNote({
      patientId,
      inputType,
      rawText,
      processedNote,
      audioStorageKey,
      audioUrl,
      originalFileName: audioFile?.originalname,
      mimeType: audioFile?.mimetype
    });

    response.status(201).json({
      note
    });
  } catch (error) {
    next(error);
  }
});
