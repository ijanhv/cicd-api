// controllers/applicationController.ts

import { application, Request, Response } from "express";
import { Application, Prisma } from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import applicationService from "@services/application.service";
import httpStatus from "http-status";
import deploymentController from "./deployment.controller";
import { cloneRepository } from "@helper/providers/github";
import { buildApplication, startApplicationContainer } from "@helper/builders";
import { docker } from "@constants/index";
import { Container } from "dockerode";
import deploymentService from "@services/deployment.service";


const createApplication = catchAsync(async (req: Request, res: Response) => {
  const applicationData: Prisma.ApplicationCreateInput = req.body;
  const newApplication = await applicationService.createApplication(
    applicationData
  );
  res.status(httpStatus.CREATED).json({ success: true, data: newApplication });
});

const getApplications = catchAsync(async (req: Request, res: Response) => {
  const applications = await applicationService.getApplications();
  res.json({ success: true, data: applications });
});

const getApplicationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const application = await applicationService.getApplicationById(id);
  if (application) {
    res.json({
      success: true,
      message: "Application fetched successfully!",
      application,
    });
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, error: "Application not found" });
  }
});

const updateApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const applicationData: Prisma.ApplicationUpdateInput = req.body;
  const updatedApplication = await applicationService.updateApplication(
    id,
    applicationData
  );
  res.json({ success: true, data: updatedApplication });
});

const deleteApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await applicationService.deleteApplication(id);
  res
    .status(httpStatus.NO_CONTENT)
    .json({ success: true, message: "Application deleted successfully" });
});

const deployApplication = catchAsync(async (req: Request, res: Response) => {
  const {
    applicationId,
    titleLog = "Manual Deployment",
    descriptionLog = "",
  } = req.body;
  const application = await applicationService.getApplicationById(
    applicationId
  );

  const deployment = await deploymentController.createNewDeployment({
    applicationId,
    title: titleLog,
    description: descriptionLog,
  });
  try {
    if (application?.sourceType === "GITHUB") {
      const entity = {
        appName: application.appName,
        url: application.repository || "",
        branch: application.branch || "",
      };
      await cloneRepository({
        entity,
        isCompose: false,
        logPath: deployment.logPath,
      });

      await buildApplication(application, deployment.logPath, deployment.deploymentId);

      res.status(httpStatus.CREATED).json({
        success: true,
        deployment,
        message: "Deployment created successfully",
      });
    }
  } catch (error) {
    // Update application status to RUNNING
    await applicationService.updateApplication(applicationId, {
      applicationStatus: "ERROR",
    });
    await deploymentService.updateDeployment(deployment.deploymentId, {
      status: "ERROR",
    });

    res
      .status(httpStatus.CREATED)
      .json({ success: false, message: "Deployment couldnt be created!" });
  }
});

export default {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  deployApplication,
};
