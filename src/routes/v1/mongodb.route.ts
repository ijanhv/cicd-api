// routes/mongodb.routes.ts

import mongodbController from '@controllers/mongodb.controller';
import validate from '@middleware/validate';
import { mongodbValidation } from '@validations/index';
import express from 'express';


const router = express.Router();

// Create MongoDB route
router.post('/', validate(mongodbValidation.createMongoDBSchema), mongodbController.createMongoDB);

// Get all MongoDBs route
router.get('/', validate(mongodbValidation.updateMongoDBSchema),mongodbController.getAllMongoDBs);

// Get MongoDB by ID route
router.get('/:id', validate(mongodbValidation.updateMongoDBSchema),mongodbController.getMongoDBById);

// Update MongoDB by ID route
router.put('/:id', validate(mongodbValidation.updateMongoDBSchema), mongodbController.updateMongoDB);

// Delete MongoDB by ID route
router.delete('/:id',validate(mongodbValidation.deleteMongoDBSchema), mongodbController.deleteMongoDB);

export default router;
