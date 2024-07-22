import { Application, Prisma, Project } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "@utils/apiError";

/**
 * Create a new project
 * @param {Omit<Project, "id" | "createdAt">} data - Project data to create
 * @returns {Promise<Project>} Created project object
 */
const createProject = async (data: Omit<Project, "id" | "createdAt">): Promise<Project> => {
  // Create new project
  const newProject = await prisma.project.create({
    data,
  });

  return newProject;
};

/**
 * Query all projects
 * @returns {Promise<Project[]>} Array of projects
 */
const getProjects = async (): Promise<Project[]> => {
  // Query all projects
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return projects;
};


// get services by projectID
/**
 * Get project by ID
 * @param {string} id - Project ID
 * @returns {Promise<Postgres | Mongodb | Application | null>} Project object if found, null if not found
 */
const getProjectServicesByProjectId = async (projectId: string) => {
  const project = await getProjectById(projectId) 
  if(!project) {
    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
    }
  }
  const postgres = await prisma.postgres.findMany({
    where: {
      projectId
    }
  })
  const mongoDB = await prisma.mongoDB.findMany({
    where: {
      projectId
    }
  })

  const application = await prisma.application.findMany({
    where: {
      projectId
    }
  })

  return { postgres, mongoDB, application }
}

/**
 * Get project by ID
 * @param {string} id - Project ID
 * @returns {Promise<Project | null>} Project object if found, null if not found
 */
const getProjectById = async (id: string): Promise<Project | null> => {
  // Get project by ID
  const project = await prisma.project.findUnique({
    where: { id },
  });

  return project;
};

/**
 * Update project by ID
 * @param {string} id - Project ID
 * @param {Prisma.ProjectUpdateInput} data - Updated project data
 * @returns {Promise<Project | null>} Updated project object if found, null if not found
 */
const updateProject = async (id: string, data: Prisma.ProjectUpdateInput): Promise<Project | null> => {
  // Check if project exists
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });
  if (!existingProject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }

  // Update project
  const updatedProject = await prisma.project.update({
    where: { id },
    data,
  });

  return updatedProject;
};

/**
 * Delete project by ID
 * @param {string} id - Project ID
 * @returns {Promise<Project | null>} Deleted project object if found, null if not found
 */
const deleteProject = async (id: string): Promise<Project | null> => {
  // Check if project exists
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });
  if (!existingProject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }

  // Delete project
  await prisma.project.delete({
    where: { id },
  });

  return existingProject;
};

export default {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectServicesByProjectId
};
