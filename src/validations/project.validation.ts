import Joi from 'joi';

const createProject = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
  })
};

const updateProject = {
  params: Joi.object().keys({
    id: Joi.string().required()
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
  })
};

const getProject = {
  params: Joi.object().keys({
    id: Joi.string().required()
  })
};

const deleteProject = {
  params: Joi.object().keys({
    id: Joi.string().required()
  })
};

export default {
  createProject,
  updateProject,
  getProject,
  deleteProject
};