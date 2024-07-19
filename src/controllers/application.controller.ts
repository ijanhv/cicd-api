// controllers/applicationController.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import applicationService from "@services/application.service";
import httpStatus from "http-status";

const createApplication = catchAsync(async (req: Request, res: Response) => {
  const applicationData: Prisma.ApplicationCreateInput = req.body;
  const newApplication = await applicationService.createApplication(applicationData);
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
    res.json({ success: true, data: application });
  } else {
    res.status(httpStatus.NOT_FOUND).json({ success: false, error: "Application not found" });
  }
});

const updateApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const applicationData: Prisma.ApplicationUpdateInput = req.body;
  const updatedApplication = await applicationService.updateApplication(id, applicationData);
  res.json({ success: true, data: updatedApplication });
});

const deleteApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await applicationService.deleteApplication(id);
  res.status(httpStatus.NO_CONTENT).json({ success: true, message: "Application deleted successfully" });
});

export default {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
