// validations/postgres.validation.ts

import Joi from "joi";

export const createPostgresSchema = {
  body: {
    name: Joi.string().required(),
    appName: Joi.string().required(),
    databaseName: Joi.string().required(),
    databaseUser: Joi.string().required(),
    databasePassword: Joi.string().required(),
    description: Joi.string().optional(),
    dockerImage: Joi.string().optional(),
    command: Joi.string().optional(),
    env: Joi.string().optional(),
    applicationStatus: Joi.string()
      .valid("IDLE", "RUNNING", "DONE", "ERROR")
      .default("IDLE"),
    projectId: Joi.string().required(),
  },
};


export const updatePostgresSchema = {
    params: Joi.object().keys({
        id: Joi.string().required()
      }),
  body: {
    name: Joi.string().optional(),
    appName: Joi.string().optional(),
    databaseName: Joi.string().optional(),
    databaseUser: Joi.string().optional(),
    databasePassword: Joi.string().optional(),
    description: Joi.string().optional(),
    dockerImage: Joi.string().optional(),
    command: Joi.string().optional(),
    env: Joi.string().optional(),
    applicationStatus: Joi.string()
      .valid("IDLE", "RUNNING", "DONE", "ERROR")
      .optional(),
  },
};

export default {
  createPostgresSchema,
  updatePostgresSchema,
};
