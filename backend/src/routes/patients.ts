import { Router } from "express";
import { listPatients } from "../services/patientService.js";

export const patientsRouter = Router();

patientsRouter.get("/", async (_request, response, next) => {
  try {
    response.json({
      patients: await listPatients()
    });
  } catch (error) {
    next(error);
  }
});
