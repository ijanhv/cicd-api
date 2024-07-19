import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongodbService from '../services/mongodb.service';
import catchAsync from '../utils/catchAsync';
import { Prisma } from '@prisma/client';

const createMongoDB = catchAsync(async (req: Request, res: Response) => {
  const newMongoDB: Prisma.MongoDBUncheckedCreateInput = await mongodbService.createMongoDB(req.body);
  res.status(httpStatus.CREATED).json({ success: true, data: newMongoDB });
});


const getAllMongoDBs = catchAsync(async (req: Request, res: Response) => {
  const mongoDBs = await mongodbService.getMongoDBs();
  res.status(httpStatus.OK).json({ success: true, data: mongoDBs });
});


const getMongoDBById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const mongoDB = await mongodbService.getMongoDBById(id);
  if (mongoDB) {
    res.status(httpStatus.OK).json({ success: true, data: mongoDB });
  } else {
    res.status(httpStatus.NOT_FOUND).json({ success: false, error: 'MongoDB not found' });
  }
});


const updateMongoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedMongoDB = await mongodbService.updateMongoDB(id, req.body);
  res.status(httpStatus.OK).json({ success: true, data: updatedMongoDB });
});


const deleteMongoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await mongodbService.deleteMongoDB(id);
  res.status(httpStatus.NO_CONTENT).json({ success: true, message: 'MongoDB deleted successfully' });
});

export default {
  createMongoDB,
  getAllMongoDBs,
  getMongoDBById,
  updateMongoDB,
  deleteMongoDB,
};
