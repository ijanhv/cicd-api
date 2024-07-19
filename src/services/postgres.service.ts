import { Prisma, Postgres } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "@utils/apiError";

/**
 * Create a new Postgres instance
 * @param {Omit<Postgres, 'postgresId' | 'createdAt'>} data - Postgres instance data to create
 * @returns {Promise<Postgres>}
 */
const createPostgres = async (data: Omit<Postgres, "postgresId">): Promise<Postgres> => {
  try {
    return await prisma.postgres.create({
      data
    });
  } catch (error) {
    console.log(error)
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not create Postgres instance");
  }
};

/**
 * Get all Postgres instances
 * @returns {Promise<Postgres[]>}
 */
const getPostgres = async (): Promise<Postgres[]> => {
  try {
    return await prisma.postgres.findMany();
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Could not fetch Postgres instances");
  }
};

/**
 * Get Postgres instance by ID
 * @param {string} id - Postgres instance ID
 * @returns {Promise<Postgres | null>}
 */
const getPostgresById = async (id: string): Promise<Postgres | null> => {
  try {
    return await prisma.postgres.findUnique({
      where: { postgresId: id },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, "Postgres instance not found");
  }
};
/**
 * Get Postgres instance by ID
 * @param {string} id - Postgres instance ID
 * @returns {Promise<Postgres | null>}
 */
const getPostgresByProjectId = async (id: string): Promise<Postgres[] | null> => {
  try {
    return await prisma.postgres.findMany({
      where: { projectId: id },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, "Postgres instance not found");
  }
};

/**
 * Update a Postgres instance by ID
 * @param {string} id - Postgres instance ID
 * @param {Partial<Postgres>} data - Updated Postgres instance data
 * @returns {Promise<Postgres>}
 */
const updatePostgres = async (id: string, data: Partial<Postgres>): Promise<Postgres> => {
  try {
    return await prisma.postgres.update({
      where: { postgresId: id },
      data,
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not update Postgres instance");
  }
};

/**
 * Delete a Postgres instance by ID
 * @param {string} id - Postgres instance ID
 * @returns {Promise<void>}
 */
const deletePostgres = async (id: string): Promise<void> => {
  try {
    await prisma.postgres.delete({
      where: { postgresId: id },
    });
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Could not delete Postgres instance");
  }
};

export default {
  createPostgres,
  getPostgres,
  getPostgresById,
  updatePostgres,
  getPostgresByProjectId,
  deletePostgres
};
