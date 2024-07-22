
import applicationController from "@controllers/application.controller";
import validate from "@middleware/validate";
import applicationValidation from "@validations/application.validation";

import express from "express";


const router = express.Router();

// Create application route
router.post(
  "/",
  validate(applicationValidation.createApplicationSchema),
  applicationController.createApplication
);

// Get application by ID
router.get(
  "/:id",
  validate(applicationValidation.updateApplicationSchema),
  applicationController.getApplicationById
);

// Update application by ID
router.patch(
  "/:id",
  // validate(applicationValidation.updateApplicationSchema),
  applicationController.updateApplication
);

// Delete application by ID
router.delete(
  "/:id",
  validate(applicationValidation.updateApplicationSchema),
  applicationController.deleteApplication
);


router.post(
  "/deploy",
  applicationController.deployApplication
)

export default router;
