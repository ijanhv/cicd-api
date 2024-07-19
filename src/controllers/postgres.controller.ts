import { Request, Response } from 'express';
import httpStatus from 'http-status';
import postgresService from '../services/postgres.service';
import catchAsync from '../utils/catchAsync';
import { Prisma } from '@prisma/client';


const createPostgres = catchAsync(async (req: Request, res: Response) => {

  const newPostgres: Prisma.PostgresUncheckedCreateInput = await postgresService.createPostgres(req.body);
  res.status(httpStatus.CREATED).json({ success: true, data: newPostgres });
});

const getAllPostgres = catchAsync(async (req: Request, res: Response) => {
  const postgresInstances = await postgresService.getPostgres();
  res.status(httpStatus.OK).json({ success: true, data: postgresInstances });
});


const getPostgresById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const postgresInstance = await postgresService.getPostgresById(id);
  if (postgresInstance) {
    res.status(httpStatus.OK).json({ success: true, data: postgresInstance });
  } else {
    res.status(httpStatus.NOT_FOUND).json({ success: false, error: 'PostgreSQL instance not found' });
  }
});


const updatePostgres = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedPostgres = await postgresService.updatePostgres(id, req.body);
  res.status(httpStatus.OK).json({ success: true, data: updatedPostgres });
});


const deletePostgres = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await postgresService.deletePostgres(id);
  res.status(httpStatus.NO_CONTENT).json({ success: true, message: 'PostgreSQL instance deleted successfully' });
});


const getPostgresByProjectId = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const postgresInstances = await postgresService.getPostgresByProjectId(projectId);
  res.status(httpStatus.OK).json({ success: true, data: postgresInstances });
});


export default {
  createPostgres,
  getAllPostgres,
  getPostgresById,
  updatePostgres,
  getPostgresByProjectId,
  deletePostgres
};
