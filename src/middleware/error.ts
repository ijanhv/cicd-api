import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import config from '@config/envCofig';
import ApiError from '@utils/apiError';


const prismaErrorHandler = (error: Prisma.PrismaClientKnownRequestError): ApiError => {
  let statusCode: number;
  let message: string;

  switch (error.code) {
    case 'P2002': // Unique constraint failed
      statusCode = httpStatus.CONFLICT;
      message = 'A record with this value already exists';
      break;
    case 'P2025': // Record not found
      statusCode = httpStatus.NOT_FOUND;
      message = 'Record not found';
      break;
    // Add more Prisma error codes and messages as needed
    default:
      statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      break;
  }

  return new ApiError(statusCode, message, false, error.stack);
};
export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    console.log("HELO APIERROR")
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.log("HELO her")
      error = prismaErrorHandler(error);
    } else if(error.name === 'PrismaClientValidationError' ) {
      const statusCode = httpStatus.FORBIDDEN
      const message = "All fields are required"
      error = new ApiError(statusCode, message, false, err.stack);
    }  else {
      console.log("ELSE")
      const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || httpStatus[statusCode];
      error = new ApiError(statusCode, message, false, err.stack);
    }
  }
  next(error);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack })
  };

  if (config.env === 'development') {
    console.error(err);
  }

  res.status(statusCode).json(response);
};