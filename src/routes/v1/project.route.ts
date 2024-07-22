import express from "express";

import validate from "@middleware/validate";
import projectValidation from "@validations/project.validation";
import projectController from "@controllers/project.controller";

const router = express.Router();

// Create project route
router.post(
  "/",
  validate(projectValidation.createProject),
  projectController.createProject
);

router.get(
  "/",
  projectController.getProjects
);

// get projects by id
router.get(
  "/:id",
  validate(projectValidation.getProject),
  projectController.getProjectById
);

router.get(
  "/services/:projectId",
  validate(projectValidation.getProjectServices),
  projectController.getProjectServices
);

// update project by id
router.patch(
  "/:id",
  validate(projectValidation.updateProject),
  projectController.updateProject
);

// delete project by id
router.delete(
  "/:id",
  validate(projectValidation.deleteProject),
  projectController.deleteProject
);

export default router;
