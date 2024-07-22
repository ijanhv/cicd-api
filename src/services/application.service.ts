import { Prisma, Application } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "@utils/apiError";


/**
 * Create a new application
 * @param {Prisma.ApplicationCreateInput} data - Application data to create
 * @returns {Promise<Application>}
 */
const createApplication = async (data: Prisma.ApplicationCreateInput): Promise<Application> => {
  try {
    return await prisma.application.create({
      data
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not create application");
  }
};

/**
 * Get all applications
 * @returns {Promise<Application[]>}
 */
const getApplications = async (): Promise<Application[]> => {
  try {
    return await prisma.application.findMany();
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Could not fetch applications");
  }
};

/**
 * Get application by ID
 * @param {string} id - Application ID
 * @returns {Promise<Application | null>}
 */
const getApplicationById = async (id: string): Promise<Application | null> => {
  try {
    return await prisma.application.findUnique({
      where: { applicationId: id },
      include: { Project: true }
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }
};

/**
 * Update an application by ID
 * @param {string} id - Application ID
 * @param {Prisma.ApplicationUpdateInput} data - Updated application data
 * @returns {Promise<Application>}
 */
const updateApplication = async (id: string, data: Prisma.ApplicationUpdateInput): Promise<Application> => {
  try {
    return await prisma.application.update({
      where: { applicationId: id },
      data,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not update application");
  }
};


/**
 * Delete an application by ID
 * @param {string} id - Application ID
 * @returns {Promise<void>}
 */
const deleteApplication = async (id: string): Promise<void> => {
  try {
    await prisma.application.delete({
      where: { applicationId: id },
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not delete application");
  }
};

export default {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
