import { Prisma, Deployment } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../client";
import fs from "fs/promises"
import ApiError from "@utils/apiError";
import path from "node:path"

/**
 * Create a new deployment
 * @param {Omit<Deployment, "deploymentId" | "createdAt">} data - Deployment data to create
 * @returns {Promise<Deployment>} Created deployment object
 */
const createDeployment = async (
  data: Omit<
    Deployment,
    "deploymentId" | "createdAt" 
  >
): Promise<Deployment> => {
  try {
    // Create new deployment
    const newDeployment = await prisma.deployment.create({
      data,
    });
    return newDeployment;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create deployment"
    );
  }
};

/**
 * Query all deployments
 * @returns {Promise<Deployment[]>} Array of deployments
 */
const getDeployments = async (): Promise<Deployment[]> => {
  try {
    // Query all deployments
    const deployments = await prisma.deployment.findMany();
    return deployments;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to retrieve deployments"
    );
  }
};


const getApplicationDeployments = async (applicationId: string): Promise<Deployment[]> => {
  try {
    // Query all deployments
    const deployments = await prisma.deployment.findMany({
      where: {
        applicationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Create an array of promises for reading log files
    const logReadPromises = deployments.map(async (deployment) => {
      if (!deployment.logPath) return '';
      try {
        return await fs.readFile(path.resolve(deployment.logPath), 'utf-8');
      } catch (error) {
        console.error(`Error reading log file for deployment ${deployment.deploymentId}:`, error);
        return '';
      }
    });

    // Wait for all log read operations to complete
    const logDatas = await Promise.all(logReadPromises);

    // Combine deployments with their log data
    const deploymentsWithLogs = deployments.map((deployment, index) => ({
      ...deployment,
      logData: logDatas[index]
    }));
    
    return deploymentsWithLogs;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to retrieve deployments"
    );
  }
};

/**
 * Get deployment by ID
 * @param {string} id - Deployment ID
 * @returns {Promise<Deployment | null>} Deployment object if found, null if not found
 */
const getDeploymentById = async (id: string): Promise<Deployment | null> => {
  try {
    // Get deployment by ID
    const deployment = await prisma.deployment.findUnique({
      where: { deploymentId: id },
    });
    if (!deployment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Deployment not found");
    }
    return deployment;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to retrieve deployment"
    );
  }
};

/**
 * Update deployment by ID
 * @param {string} id - Deployment ID
 * @param {Prisma.DeploymentUpdateInput} data - Updated deployment data
 * @returns {Promise<Deployment | null>} Updated deployment object if found, null if not found
 */
const updateDeployment = async (
  id: string,
  data: Prisma.DeploymentUpdateInput
): Promise<Deployment | null> => {
  try {
    console.log(id, data)
   
    // Check if deployment exists
    const existingDeployment = await prisma.deployment.findUnique({
      where: { deploymentId: id },
    });
    console.log(existingDeployment)
    if (!existingDeployment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Deployment not found");
    }

    // Update deployment
    const updatedDeployment = await prisma.deployment.update({
      where: { deploymentId: id },
      data,
    });

    console.log(updatedDeployment)
    return updatedDeployment;
  } catch (error) {

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update deployment"
    );
  }
};

/**
 * Delete deployment by ID
 * @param {string} id - Deployment ID
 * @returns {Promise<Deployment | null>} Deleted deployment object if found, null if not found
 */
const deleteDeployment = async (id: string): Promise<Deployment | null> => {
  try {
    // Check if deployment exists
    const existingDeployment = await prisma.deployment.findUnique({
      where: { deploymentId: id },
    });
    if (!existingDeployment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Deployment not found");
    }

    // Delete deployment
    await prisma.deployment.delete({
      where: { deploymentId: id },
    });

    return existingDeployment;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete deployment"
    );
  }
};

export default {
  createDeployment,
  getDeployments,
  getApplicationDeployments,
  getDeploymentById,
  updateDeployment,
  deleteDeployment,
};
