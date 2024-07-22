// controllers/deploymentController.ts

import { Request, Response } from "express";
import { DeploymentStatus, Prisma } from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import deploymentService from "@services/deployment.service";
import httpStatus from "http-status";
import applicationService from "@services/application.service";
import { format } from "date-fns";
import path from "node:path";
import { promises as fsPromises } from "node:fs";

import { LOGS_PATH } from "@constants/index";

const createNewDeployment = async ({applicationId,
  title,
  description
}: {
  applicationId: string,
  title: string,
  description: string
}) => {
  const application = await applicationService.getApplicationById(
    applicationId
  );

  const formattedDateTime = format(new Date(), "yyyy-MM-dd:HH:mm:ss");
  const fileName = `${application?.appName}-${formattedDateTime}.log`;

  const logFilePath = path.join(
    LOGS_PATH,
    application?.appName as string,
    fileName
  );

  await fsPromises.mkdir(path.join(LOGS_PATH, application?.appName as string), {
    recursive: true,
  });

  const newDeployment = await deploymentService.createDeployment({
    applicationId,
    title,
    description,
    logPath: logFilePath,
    status: DeploymentStatus.RUNNING,
  });

  return newDeployment
};

const getDeployments = catchAsync(async (req: Request, res: Response) => {
  const deployments = await deploymentService.getDeployments();
  res.json({ success: true, data: deployments });
});

const getDeploymentsByApplicationId = catchAsync(async (req: Request, res: Response) => {
  const deployments = await deploymentService.getApplicationDeployments(req.params.applicationId);
  res.json({ success: true, message: "Deployments fetched successfully" ,deployments });
});


const getDeploymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deployment = await deploymentService.getDeploymentById(id);
  if (deployment) {
    res.json({ success: true, data: deployment });
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, error: "Deployment not found" });
  }
});

const updateDeployment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deploymentData: Prisma.DeploymentUpdateInput = req.body;
  const updatedDeployment = await deploymentService.updateDeployment(
    id,
    deploymentData
  );
  if (updatedDeployment) {
    res.json({ success: true, deployment: updatedDeployment });
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, error: "Deployment not found" });
  }
});

const deleteDeployment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedDeployment = await deploymentService.deleteDeployment(id);
  if (deletedDeployment) {
    res
      .status(httpStatus.NO_CONTENT)
      .json({ success: true, message: "Deployment deleted successfully" });
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, error: "Deployment not found" });
  }
})

export default {
  createNewDeployment,
  getDeployments,
  getDeploymentsByApplicationId,
  getDeploymentById,
  updateDeployment,
  deleteDeployment,
};
