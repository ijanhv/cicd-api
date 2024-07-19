// routes/postgres.routes.ts

import postgresController from "@controllers/postgres.controller";
import validate from "@middleware/validate";
import postgresValidation from "@validations/postgres.validation";

import express from "express";

const router = express.Router();

// Create PostgreSQL instance route
router.post(
  "/",
  validate(postgresValidation.createPostgresSchema),
  postgresController.createPostgres
);

// Get all PostgreSQL instances route
router.get("/", postgresController.getAllPostgres);

// Get all PostgreSQL instances route
router.get("/project/:projectId", postgresController.getPostgresByProjectId);

// Get PostgreSQL instance by ID route
router.get(
  "/:id",
  validate(postgresValidation.updatePostgresSchema),
  postgresController.getPostgresById
);

// Update PostgreSQL instance by ID route
router.put(
  "/:id",
  validate(postgresValidation.updatePostgresSchema),
  postgresController.updatePostgres
);

// Delete PostgreSQL instance by ID route
router.delete(
  "/:id",
  validate(postgresValidation.updatePostgresSchema),
  postgresController.deletePostgres
);

export default router;
