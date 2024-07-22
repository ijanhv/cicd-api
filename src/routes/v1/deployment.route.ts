
import deploymentController from "@controllers/deployment.controller";

import express from "express";


const router = express.Router();

router.patch(
    "/:id",
  
    deploymentController.updateDeployment
  );
  
// Create application route
router.get(
  "/application/:applicationId",

  deploymentController.getDeploymentsByApplicationId
);


export default router;
