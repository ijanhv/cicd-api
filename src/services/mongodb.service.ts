import { Prisma, MongoDB } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "@utils/apiError";

/**
 * Create a new MongoDB instance
 * @param {Omit<MongoDB, 'mongoId'>} data - MongoDB instance data to create
 * @returns {Promise<MongoDB>}
 */
const createMongoDB = async (data: Omit<MongoDB, "mongoId">): Promise<MongoDB> => {
  try {
    return await prisma.mongoDB.create({
      data,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not create MongoDB instance");
  }
};

/**
 * Get all MongoDB instances
 * @returns {Promise<MongoDB[]>}
 */
const getMongoDBs = async (): Promise<MongoDB[]> => {
  try {
    return await prisma.mongoDB.findMany();
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Could not fetch MongoDB instances");
  }
};

/**
 * Get MongoDB instance by ID
 * @param {string} id - MongoDB instance ID
 * @returns {Promise<MongoDB | null>}
 */
const getMongoDBById = async (id: string): Promise<MongoDB | null> => {
  try {
    return await prisma.mongoDB.findUnique({
      where: { mongoId: id },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, "MongoDB instance not found");
  }
};

/**
 * Update a MongoDB instance by ID
 * @param {string} id - MongoDB instance ID
 * @param {Partial<MongoDB>} data - Updated MongoDB instance data
 * @returns {Promise<MongoDB>}
 */
const updateMongoDB = async (id: string, data: Partial<MongoDB>): Promise<MongoDB> => {
  try {
    return await prisma.mongoDB.update({
      where: { mongoId: id },
      data,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not update MongoDB instance");
  }
};

/**
 * Delete a MongoDB instance by ID
 * @param {string} id - MongoDB instance ID
 * @returns {Promise<void>}
 */
const deleteMongoDB = async (id: string): Promise<void> => {
  try {
    await prisma.mongoDB.delete({
      where: { mongoId: id },
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not delete MongoDB instance");
  }
};

export default {
  createMongoDB,
  getMongoDBs,
  getMongoDBById,
  updateMongoDB,
  deleteMongoDB,
};
