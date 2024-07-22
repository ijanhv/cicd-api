// controllers/projectController.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import catchAsync from "../utils/catchAsync";
import projectService from "@services/project.service";
import httpStatus from "http-status";

const createProject = catchAsync(async (req: Request, res: Response) => {
  const projectData: Prisma.ProjectCreateInput = req.body;
  const newProject = await projectService.createProject(projectData);
  res.status(httpStatus.CREATED).json({ success: true, data: newProject });
});

const getProjects = catchAsync(async (req: Request, res: Response) => {
  const projects = await projectService.getProjects();
  res.json({
    success: true,
    message: "Projects fetched successfully",
    projects,
  });
});

const getProjectServices = catchAsync(async (req: Request, res: Response) => {
  const { postgres, mongoDB, application } =
    await projectService.getProjectServicesByProjectId(req.params.projectId);

  res.json({
    success: true,
    message: "Projects fetched successfully",
    services: {
      postgres,
      mongoDB,
      application,
    },
  });
});

const getProjectById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await projectService.getProjectById(id);
  if (project) {
    res.json({ success: true, message: "Project fetched successfully!", project });
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .json({ success: false, error: "Project not found" });
  }
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const projectData: Prisma.ProjectUpdateInput = req.body;
  const updatedProject = await projectService.updateProject(id, projectData);
  res.json({
    success: true,
    message: "Project updated successfuly!",
    project: updatedProject,
  });
});

const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await projectService.deleteProject(id);
  res
    .status(httpStatus.NO_CONTENT)
    .json({ success: true, message: "Project deleted successfully" });
});

export default {
  createProject,
  getProjects,
  getProjectServices,
  getProjectById,
  updateProject,
  deleteProject,
};
