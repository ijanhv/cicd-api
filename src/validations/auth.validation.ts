import Joi from 'joi';
import { password } from './custom.validation';

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password)
  })
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required()
  })
}

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};


export default {
    register,
    login,
    refreshTokens
}